"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Trash2,
  Save,
  Loader2,
  Plus,
  X,
  Camera,
  Globe,
  Check,
  ExternalLink,
  Edit2,
} from "lucide-react";
import {
  getDesignerProfile,
  saveDesignerProfile,
} from "@/lib/portfolioStorage";
import {
  saveProfileInfoToFirestore,
  saveProfileLinksToFirestore,
  getProfileInfoFromFirestore,
  getProfileLinksFromFirestore,
} from "@/lib/firestoreProfile";
import { compressImageFile } from "@/lib/imageUtils";
import { DesignerProfileData, SocialLinks } from "@/types/portfolio";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { DeleteConfirmModal } from "@/components/portfolio/DeleteConfirmModal";
import { DeviceViewportBar, DeviceMode } from "@/components/common/DeviceViewportBar";
import { useAuth } from "@/context/AuthContext";
import {
  InstagramIcon,
  BehanceIcon,
  LinkedinIcon,
  GithubIcon,
  DribbbleIcon,
  MailIcon,
  YoutubeIcon,
} from "@/components/ui/icons";

interface SocialItem {
  id: string;
  url: string;
  key: string;
  name: string;
  iconType: "instagram" | "github" | "behance" | "linkedin" | "dribbble" | "email" | "youtube" | "website";
  color: string;
}

// URL/이메일로부터 소셜 타입 및 아이콘 자동 감지 헬퍼
function detectSocialChannel(rawInput: string): {
  key: string;
  name: string;
  iconType: SocialItem["iconType"];
  color: string;
  formattedUrl: string;
} {
  let val = rawInput.trim();
  const lower = val.toLowerCase();

  // 이메일 주소인 경우
  if (lower.startsWith("mailto:") || (lower.includes("@") && !lower.includes("/"))) {
    const emailAddr = val.replace(/^mailto:/i, "");
    return {
      key: "email",
      name: "이메일 (Email)",
      iconType: "email",
      color: "#3182F6",
      formattedUrl: emailAddr,
    };
  }

  // URL 프로토콜 보정
  if (!/^https?:\/\//i.test(val) && /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(val)) {
    val = `https://${val}`;
  }

  if (lower.includes("instagram.com")) {
    return {
      key: "instagram",
      name: "Instagram",
      iconType: "instagram",
      color: "#E1306C",
      formattedUrl: val,
    };
  }
  if (lower.includes("github.com")) {
    return {
      key: "github",
      name: "GitHub",
      iconType: "github",
      color: "#191F28",
      formattedUrl: val,
    };
  }
  if (lower.includes("behance.net")) {
    return {
      key: "behance",
      name: "Behance",
      iconType: "behance",
      color: "#0057FF",
      formattedUrl: val,
    };
  }
  if (lower.includes("linkedin.com")) {
    return {
      key: "linkedin",
      name: "LinkedIn",
      iconType: "linkedin",
      color: "#0A66C2",
      formattedUrl: val,
    };
  }
  if (lower.includes("dribbble.com")) {
    return {
      key: "dribbble",
      name: "Dribbble",
      iconType: "dribbble",
      color: "#EA4C89",
      formattedUrl: val,
    };
  }
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return {
      key: "youtube",
      name: "YouTube",
      iconType: "youtube",
      color: "#FF0000",
      formattedUrl: val,
    };
  }

  // 기타 웹사이트
  try {
    const parsed = new URL(val);
    const domain = parsed.hostname.replace(/^www\./, "");
    return {
      key: domain,
      name: domain,
      iconType: "website",
      color: "#4E5968",
      formattedUrl: val,
    };
  } catch {
    return {
      key: "website",
      name: "웹 링크",
      iconType: "website",
      color: "#4E5968",
      formattedUrl: val,
    };
  }
}

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. 기본 프로필 정보
  const [name, setName] = useState<string>("");
  const [handle, setHandle] = useState<string>("");
  const [roleTitle, setRoleTitle] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // 2. 소셜 링크 목록 (사용자가 추가한 링크만 동적 리스트로 관리)
  const [socialList, setSocialList] = useState<SocialItem[]>([]);
  const [isAddingSocial, setIsAddingSocial] = useState<boolean>(false);
  const [newSocialInput, setNewSocialInput] = useState<string>("");
  const [socialToDelete, setSocialToDelete] = useState<SocialItem | null>(null);

  // 3. 이력서 PDF 링크 관리 (선택사항 UX: 버튼 클릭 시에만 입력폼 오픈)
  const [resumePdfUrl, setResumePdfUrl] = useState<string>("");
  const [isAddingResume, setIsAddingResume] = useState<boolean>(false);
  const [resumeTempInput, setResumeTempInput] = useState<string>("");

  // 모바일 / 웹 리사이징 뷰포트 상태
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("responsive");
  const [customWidth, setCustomWidth] = useState<number | undefined>(undefined);

  const handleModeChange = (mode: DeviceMode) => {
    setDeviceMode(mode);
    setCustomWidth(undefined);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // 초기 프로필 데이터 로드
  useEffect(() => {
    const local = getDesignerProfile();
    setName(local.name || "");
    setHandle(local.handle || "");
    setRoleTitle(local.roleTitle || "");
    setBio(local.bio || "");
    setAvatarUrl(local.avatarUrl || "");

    const existingResume = local.resumePdfUrl || "";
    setResumePdfUrl(existingResume);
    setResumeTempInput(existingResume);

    // 기존 소셜 링크 중 값이 존재하는 항목만 동적 리스트로 변환
    const initialSocials: SocialItem[] = [];
    if (local.socialLinks) {
      Object.entries(local.socialLinks).forEach(([key, val]) => {
        if (val && typeof val === "string" && val.trim().length > 0) {
          const detected = detectSocialChannel(val);
          initialSocials.push({
            id: `social-${key}-${Date.now()}-${Math.random()}`,
            url: detected.formattedUrl,
            key: detected.key,
            name: detected.name,
            iconType: detected.iconType,
            color: detected.color,
          });
        }
      });
    }
    setSocialList(initialSocials);
    setIsLoading(false);

    // Firestore 서브 컬렉션 동기화 (users/{user.uid}/profile)
    Promise.all([
      getProfileInfoFromFirestore(user?.uid),
      getProfileLinksFromFirestore(user?.uid),
    ])
      .then(([info, links]) => {
        if (info) {
          if (info.name) setName(info.name);
          if (info.handle) setHandle(info.handle);
          if (info.roleTitle) setRoleTitle(info.roleTitle);
          if (info.bio) setBio(info.bio);
          if (info.avatarUrl) setAvatarUrl(info.avatarUrl);
        } else if (user) {
          if (user.displayName && !local.name) setName(user.displayName);
          if (user.photoURL && !local.avatarUrl) setAvatarUrl(user.photoURL);
        }
        if (links) {
          if (links.resumePdfUrl !== undefined) {
            setResumePdfUrl(links.resumePdfUrl);
            setResumeTempInput(links.resumePdfUrl);
          }
          if (links.socialLinks) {
            const fsSocials: SocialItem[] = [];
            Object.entries(links.socialLinks).forEach(([key, val]) => {
              if (val && typeof val === "string" && val.trim().length > 0) {
                const detected = detectSocialChannel(val);
                fsSocials.push({
                  id: `fs-social-${key}-${Date.now()}`,
                  url: detected.formattedUrl,
                  key: detected.key,
                  name: detected.name,
                  iconType: detected.iconType,
                  color: detected.color,
                });
              }
            });
            if (fsSocials.length > 0) {
              setSocialList(fsSocials);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("Firestore 프로필 정보 불러오기 오류:", err);
      });
  }, [user]);

  // 이미지 직접 업로드 핸들러 (인스타그램 스타일 아바타 변경)
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    try {
      setIsCompressingAvatar(true);
      // 아바타 이미지를 400px, 0.82 퀄리티로 리사이징 & 압축하여 로컬 및 Firestore에 가볍게 저장
      const compressedDataUrl = await compressImageFile(file, 400, 0.82);
      setAvatarUrl(compressedDataUrl);
      showToast("프로필 사진이 새 이미지로 변경되었어요! ✨");
    } catch (err) {
      console.error("아바타 이미지 압축 에러:", err);
      alert("이미지를 처리하는 중 오류가 발생했습니다.");
    } finally {
      setIsCompressingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 소셜 채널 아이콘 렌더링 헬퍼
  const renderSocialIcon = (iconType: SocialItem["iconType"], className = "w-4 h-4") => {
    switch (iconType) {
      case "instagram":
        return <InstagramIcon className={`${className} text-[#E1306C]`} />;
      case "github":
        return <GithubIcon className={`${className} text-[#191F28]`} />;
      case "behance":
        return <BehanceIcon className={`${className} text-[#0057FF]`} />;
      case "linkedin":
        return <LinkedinIcon className={`${className} text-[#0A66C2]`} />;
      case "dribbble":
        return <DribbbleIcon className={`${className} text-[#EA4C89]`} />;
      case "email":
        return <MailIcon className={`${className} text-[#3182F6]`} />;
      case "youtube":
        return <YoutubeIcon className={`${className} text-[#FF0000]`} />;
      default:
        return <Globe className={`${className} text-[#4E5968]`} />;
    }
  };

  // 소셜 링크 추가
  const handleAddSocialItem = () => {
    const trimmed = newSocialInput.trim();
    if (!trimmed) return;

    const detected = detectSocialChannel(trimmed);
    const newItem: SocialItem = {
      id: `social-${Date.now()}`,
      url: detected.formattedUrl,
      key: detected.key,
      name: detected.name,
      iconType: detected.iconType,
      color: detected.color,
    };

    setSocialList([...socialList, newItem]);
    setNewSocialInput("");
    setIsAddingSocial(false);
    showToast(`'${detected.name}' 링크가 추가되었어요!`);
  };

  // 소셜 링크 삭제 확정 핸들러 (삭제 모달 연동)
  const handleConfirmDeleteSocial = () => {
    if (!socialToDelete) return;
    setSocialList((prev) => prev.filter((item) => item.id !== socialToDelete.id));
    showToast(`'${socialToDelete.name}' 링크가 삭제되었습니다.`);
    setSocialToDelete(null);
  };

  // 소셜 링크 삭제 요청 (삭제 확인 모달 열기)
  const handleRequestRemoveSocial = (item: SocialItem) => {
    setSocialToDelete(item);
  };

  // 이력서 링크 적용
  const handleApplyResume = () => {
    const trimmed = resumeTempInput.trim();
    setResumePdfUrl(trimmed);
    setIsAddingResume(false);
    if (trimmed) {
      showToast("이력서 링크가 등록되었어요!");
    } else {
      showToast("이력서 링크가 삭제되었습니다.");
    }
  };

  // 이력서 삭제
  const handleRemoveResume = () => {
    setResumePdfUrl("");
    setResumeTempInput("");
    setIsAddingResume(false);
    showToast("이력서가 삭제되어 메인 프로필에서 숨김 처리됩니다.");
  };

  // 폼 전체 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // 소셜 링크 목록을 SocialLinks 객체로 역변환
      const finalSocials: SocialLinks = {};
      socialList.forEach((item) => {
        if (item.key === "instagram") finalSocials.instagram = item.url;
        else if (item.key === "behance") finalSocials.behance = item.url;
        else if (item.key === "linkedin") finalSocials.linkedin = item.url;
        else if (item.key === "github") finalSocials.github = item.url;
        else if (item.key === "dribbble") finalSocials.dribbble = item.url;
        else if (item.key === "email") finalSocials.email = item.url;
        else {
          finalSocials[item.key] = item.url;
        }
      });

      const currentProfile = getDesignerProfile();
      const updatedProfile: DesignerProfileData = {
        ...currentProfile,
        name: name.trim(),
        handle: handle.trim() || currentProfile.handle,
        roleTitle: roleTitle.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || currentProfile.avatarUrl,
        resumePdfUrl: resumePdfUrl.trim() || undefined,
        socialLinks: finalSocials,
      };

      // 1. 로컬 스토리지 저장
      saveDesignerProfile(updatedProfile);

      // 2. Firestore 세부 서브 컬렉션 동기화 (users/{user.uid}/profile)
      await Promise.all([
        saveProfileInfoToFirestore(
          {
            name: updatedProfile.name,
            handle: updatedProfile.handle,
            roleTitle: updatedProfile.roleTitle,
            bio: updatedProfile.bio,
            avatarUrl: updatedProfile.avatarUrl,
            skills: updatedProfile.skills,
          },
          user?.uid
        ),
        saveProfileLinksToFirestore(
          {
            resumePdfUrl: updatedProfile.resumePdfUrl,
            socialLinks: updatedProfile.socialLinks,
          },
          user?.uid
        ),
      ]);

      showToast("프로필과 링크가 성공적으로 저장되었어요.");
      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch (err) {
      console.error("프로필 저장 에러:", err);
      showToast("Firestore 저장 중 문제가 발생했으나 로컬에 저장되었습니다.");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  // 실시간 입력 중인 URL의 채널 감지 프리뷰
  const currentPreview = newSocialInput.trim()
    ? detectSocialChannel(newSocialInput)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F2F4F6] flex flex-col items-center">
        <main className="w-full max-w-[480px] min-h-screen bg-[#F9FAFB] flex flex-col border-x border-[#E5E8EB]/60 p-4">
          <div className="animate-pulse space-y-4 pt-8">
            <div className="h-6 bg-[#E5E8EB] rounded w-24 mb-6" />
            <div className="w-24 h-24 mx-auto bg-[#E5E8EB] rounded-full" />
            <div className="h-20 bg-[#E5E8EB] rounded-2xl" />
            <div className="h-24 bg-[#E5E8EB] rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  const containerClasses = customWidth
    ? "w-full my-0 sm:my-6 rounded-none sm:rounded-2xl border-0 sm:border border-[#E5E8EB] shadow-none sm:shadow-sm bg-white flex flex-col pb-16 transition-all duration-300"
    : deviceMode === "mobile"
    ? "w-full max-w-[390px] my-0 sm:my-6 rounded-none sm:rounded-3xl border-0 sm:border border-[#E5E8EB] shadow-none sm:shadow-2xl bg-white flex flex-col pb-16 transition-all duration-300"
    : "w-full max-w-[680px] my-0 sm:my-6 rounded-none sm:rounded-2xl border-0 sm:border border-[#E5E8EB] shadow-none sm:shadow-sm bg-white flex flex-col pb-16 transition-all duration-300";

  const containerStyle = customWidth ? { maxWidth: `${customWidth}px` } : undefined;

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] text-[#191F28] flex flex-col items-center">
      {/* 0. 화면 크기 모바일/웹 리사이징 뷰포트 컨트롤 바 */}
      <DeviceViewportBar
        currentMode={deviceMode}
        onModeChange={handleModeChange}
        customWidth={customWidth}
        onCustomWidthChange={setCustomWidth}
      />

      <main className={containerClasses} style={containerStyle}>
        {/* 상단 네비게이션 헤더 */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#E5E8EB] flex items-center justify-between select-none">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4E5968] hover:text-[#191F28] transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-[#F2F4F6]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </Link>

          <span className="text-xs sm:text-sm font-bold text-[#191F28]">
            프로필 및 링크 관리
          </span>

          <div className="w-16" />
        </header>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* 1. 디자인 기본 프로필 (카드 형식 대신 배경 위 라인으로 구분) */}
          {/* ======================================================== */}
          <div className="pt-1 pb-6 border-b border-[#E5E8EB] space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#191F28]">
                기본 프로필
              </span>
            </div>

            {/* 원형 아바타 (클릭 시 이미지 변경) */}
            <div className="flex flex-col items-center justify-center pt-1 pb-2">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                title="프로필 사진 변경 (클릭)"
              >
                <Avatar
                  src={avatarUrl}
                  alt={name}
                  fallback={name.slice(0, 1) || "P"}
                  size="xl"
                  className="w-24 h-24 shadow-md ring-4 ring-white transition-opacity group-hover:opacity-90"
                />

                {/* 우측 하단 카메라 아이콘 뱃지 */}
                <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#4E5968] border border-[#E5E8EB] shadow-xs group-hover:text-[#191F28] transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </div>

                {/* 호버 오버레이 */}
                <div className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1">
                  <Camera className="w-5 h-5" />
                  <span>변경</span>
                </div>
              </div>

              {/* 숨겨진 로컬 파일 인풋 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              {/* 이미지 삭제하기 텍스트 버튼 */}
              {avatarUrl && (
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl("");
                      showToast("프로필 사진이 기본 이미지로 초기화되었어요.");
                    }}
                    className="text-xs font-semibold text-[#8B95A1] hover:text-[#E8344E] hover:underline transition-colors cursor-pointer"
                  >
                    이미지 삭제하기
                  </button>
                </div>
              )}
            </div>

            {/* 프로필 텍스트 필드 그룹 */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                    이름 *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름"
                    className="h-9 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                    사용자 이름
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[#8B95A1] font-mono pointer-events-none">
                      @
                    </span>
                    <Input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                      placeholder="username"
                      className="h-9 text-xs pl-6 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                  직함 / 포지션
                </label>
                <Input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="예: Product & Visual Designer"
                  className="h-9 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                  소개글 (Bio)
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="디자이너 소개글을 입력하세요."
                  className="text-xs bg-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. 소셜 채널 링크 관리 (추가 시 목록 생성 & 아이콘 자동)  */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl border border-[#E5E8EB] p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F2F4F6] pb-2.5">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#191F28]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#191F28]">
                  소셜 채널 링크
                </h3>
              </div>
              <span className="text-[11px] text-[#8B95A1] font-mono">
                {socialList.length}개 등록됨
              </span>
            </div>

            {/* 등록된 소셜 링크 목록 (사용자가 추가했을 때만 생성) */}
            {socialList.length > 0 ? (
              <div className="space-y-2">
                {socialList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] hover:border-[#D1D6DB] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E5E8EB]/80 shrink-0 shadow-2xs">
                        {renderSocialIcon(item.iconType, "w-4 h-4")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#191F28] block truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#8B95A1] block truncate font-mono">
                          {item.url}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRequestRemoveSocial(item)}
                      className="p-1.5 rounded-lg text-[#8B95A1] hover:text-[#E8344E] hover:bg-[#FEECEF] transition-colors shrink-0"
                      title="소셜 링크 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !isAddingSocial && (
                <div className="py-4 text-center rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E8EB] p-4">
                  <p className="text-xs text-[#8B95A1]">
                    등록된 소셜 링크가 없습니다.
                  </p>
                  <p className="text-[11px] text-[#B0B8C1] mt-0.5">
                    링크를 추가하면 메인 프로필에 해당 소셜 버튼이 표시됩니다.
                  </p>
                </div>
              )
            )}

            {/* 링크 추가 인라인 폼 (isAddingSocial 상태) */}
            {isAddingSocial ? (
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E8EB] space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#191F28]">
                    새 소셜 링크 추가
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSocial(false);
                      setNewSocialInput("");
                    }}
                    className="text-[#8B95A1] hover:text-[#191F28]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <Input
                    value={newSocialInput}
                    onChange={(e) => setNewSocialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSocialItem();
                      }
                    }}
                    placeholder="URL 입력 (예: https://instagram.com/아이디, 깃허브, 비핸스 등)"
                    className="h-8.5 text-xs bg-white border-[#E5E8EB] focus:border-[#191F28] rounded-xl"
                    autoFocus
                  />
                </div>

                {/* 입력에 따른 자동 채널 감지 프리뷰 */}
                {currentPreview && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#E5E8EB] text-xs">
                    <span className="text-[11px] text-[#8B95A1]">감지된 채널:</span>
                    <div className="flex items-center gap-1 font-semibold text-[#191F28]">
                      {renderSocialIcon(currentPreview.iconType, "w-3.5 h-3.5")}
                      <span>{currentPreview.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingSocial(false);
                      setNewSocialInput("");
                    }}
                    className="h-7.5 px-3 text-xs text-[#6B7684] rounded-lg"
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddSocialItem}
                    disabled={!newSocialInput.trim()}
                    className="h-7.5 px-3.5 text-xs bg-[#191F28] hover:bg-[#333D4B] text-white rounded-lg cursor-pointer"
                  >
                    추가
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingSocial(true)}
                className="w-full h-9 rounded-xl border border-dashed border-[#D1D5DB] hover:border-[#191F28] text-[#4E5968] hover:text-[#191F28] hover:bg-[#FAFAFA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>소셜 채널 링크 추가하기</span>
              </Button>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. 이력서 (Resume) PDF 관리 */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl border border-[#E5E8EB] p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F2F4F6] pb-2.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#4E5968]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#191F28]">
                  이력서 (Resume) 관리
                </h3>
              </div>
              <span className="text-[11px] text-[#8B95A1]">선택 항목</span>
            </div>

            {/* 케이스 A: 이미 이력서가 등록되어 있는 경우 */}
            {resumePdfUrl ? (
              <div className="p-3.5 rounded-xl border border-[#E5E8EB] bg-[#FAFAFA] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#191F28] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-[#191F28] block">
                        등록된 이력서 링크
                      </span>
                      <a
                        href={resumePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#4E5968] hover:text-[#191F28] hover:underline truncate block font-mono"
                      >
                        {resumePdfUrl}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setResumeTempInput(resumePdfUrl);
                        setIsAddingResume(true);
                      }}
                      className="p-1.5 rounded-lg text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] transition-colors cursor-pointer"
                      title="이력서 링크 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="p-1.5 rounded-lg text-[#8B95A1] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                      title="이력서 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-[#8B95A1]">
                  * 메인 프로필에 '이력서 다운로드' 버튼이 노출되고 있습니다.
                </p>
              </div>
            ) : null}

            {/* 케이스 B: 이력서가 없거나, 수정 모드일 때 입력 폼 */}
            {isAddingResume ? (
              <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E8EB] space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#191F28]">
                    {resumePdfUrl ? "이력서 링크 수정" : "이력서 링크 등록"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingResume(false)}
                    className="text-[#8B95A1] hover:text-[#191F28]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <Input
                    value={resumeTempInput}
                    onChange={(e) => setResumeTempInput(e.target.value)}
                    placeholder="https://... (예: Google Drive 또는 Notion 이력서 링크)"
                    className="h-8.5 text-xs bg-white border-[#E5E8EB] focus:border-[#191F28] rounded-xl"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-[#8B95A1]">
                  PDF 파일 주소나 Notion, 구글 드라이브 공유 링크를 입력하세요.
                </p>

                <div className="flex justify-end gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingResume(false)}
                    className="h-7.5 px-3 text-xs text-[#6B7684] rounded-lg"
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyResume}
                    className="h-7.5 px-3.5 text-xs bg-[#191F28] hover:bg-[#333D4B] text-white rounded-lg cursor-pointer"
                  >
                    확인
                  </Button>
                </div>
              </div>
            ) : !resumePdfUrl ? (
              <div className="space-y-2">
                <p className="text-[11px] text-[#8B95A1] leading-relaxed">
                  이력서는 선택사항입니다. 공유할 이력서가 있다면 버튼을 눌러 링크를 등록해보세요.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingResume(true)}
                  className="w-full h-9 rounded-xl border border-dashed border-[#D1D5DB] hover:border-[#191F28] text-[#4E5968] hover:text-[#191F28] hover:bg-[#FAFAFA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>이력서 추가하기</span>
                </Button>
              </div>
            ) : null}
          </div>

          {/* 하단 저장 및 취소 액션 버튼 */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => router.push("/")}
              className="flex-1 h-11 text-xs sm:text-sm font-semibold text-[#4E5968] border-[#E5E8EB] hover:bg-[#FAFAFA] rounded-xl cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-11 text-xs sm:text-sm font-semibold bg-[#191F28] hover:bg-[#333D4B] text-white rounded-xl flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>변경사항 저장하기</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      {/* 소셜 링크 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={Boolean(socialToDelete)}
        onClose={() => setSocialToDelete(null)}
        itemName={socialToDelete ? `${socialToDelete.name} (${socialToDelete.url})` : ""}
        itemCategory="소셜 채널 링크"
        itemDescription={socialToDelete?.url}
        onConfirmDelete={handleConfirmDeleteSocial}
      />

      {/* TDS 플로팅 토스트 알림 */}
      <Toast message={toastMessage} />
    </div>
  );
}
