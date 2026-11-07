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
  AlertCircle,
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
  checkUsernameAvailability,
} from "@/lib/firestoreProfile";
import { compressImageFile } from "@/lib/imageUtils";
import { DesignerProfileData, SocialLinks } from "@/types/portfolio";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { DeleteConfirmModal } from "@/components/portfolio/DeleteConfirmModal";
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
  const [username, setUsername] = useState<string>("");
  const [originalUsername, setOriginalUsername] = useState<string>("");
  const [roleTitle, setRoleTitle] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // 사용자 이름 중복 및 유효성 상태 관리
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "mine" | "taken" | "invalid"
  >("idle");
  const [usernameFeedback, setUsernameFeedback] = useState<string>("");

  // 사용자 이름(username)에는 영문 및 숫자, 언더스코어만 작성할 수 있도록 제한하는 핸들러 (예: user123)
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyEnglish = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(onlyEnglish);
  };

  // 사용자 이름 실시간 중복 체크 (350ms 디바운스)
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    const origClean = originalUsername.trim().toLowerCase();

    if (!clean) {
      setUsernameStatus("idle");
      setUsernameFeedback("");
      return;
    }

    if (clean.length < 2) {
      setUsernameStatus("invalid");
      setUsernameFeedback("2자 이상의 영문/숫자를 입력해주세요.");
      return;
    }

    // 기존 본인의 사용자 이름과 같다면 즉시 통과
    if (origClean && clean === origClean) {
      setUsernameStatus("mine");
      setUsernameFeedback("현재 회원님이 사용 중인 이름입니다.");
      return;
    }

    setUsernameStatus("checking");
    setUsernameFeedback("중복 여부를 확인하고 있어요...");

    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailability(clean, user?.uid);
      if (res.available) {
        if (res.reason === "mine") {
          setUsernameStatus("mine");
        } else {
          setUsernameStatus("available");
        }
      } else {
        if (res.reason === "taken") {
          setUsernameStatus("taken");
        } else {
          setUsernameStatus("invalid");
        }
      }
      setUsernameFeedback(res.message);
    }, 350);

    return () => clearTimeout(timer);
  }, [username, originalUsername, user?.uid]);

  // 2. 소셜 링크 목록 (사용자가 추가한 링크만 동적 리스트로 관리)
  const [socialList, setSocialList] = useState<SocialItem[]>([]);
  const [isAddingSocial, setIsAddingSocial] = useState<boolean>(false);
  const [newSocialInput, setNewSocialInput] = useState<string>("");
  const [socialToDelete, setSocialToDelete] = useState<SocialItem | null>(null);

  // 3. 이력서 PDF 링크 관리 (선택사항 UX: 버튼 클릭 시에만 입력폼 오픈)
  const [resumePdfUrl, setResumePdfUrl] = useState<string>("");
  const [isAddingResume, setIsAddingResume] = useState<boolean>(false);
  const [resumeTempInput, setResumeTempInput] = useState<string>("");

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
    const initialLocalUsername = (local.username || local.handle || "").replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(initialLocalUsername);
    setOriginalUsername(initialLocalUsername);
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
          const initialFsUsername = (info.username || info.handle || "").replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
          if (initialFsUsername) {
            setUsername(initialFsUsername);
            setOriginalUsername(initialFsUsername);
          }
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

    if (usernameStatus === "taken") {
      alert("이미 사용 중인 사용자 이름입니다. 다른 이름을 입력해주세요.");
      return;
    }

    if (usernameStatus === "invalid") {
      alert("사용자 이름 형식이 올바르지 않습니다. (2자 이상 영문/숫자/언더스코어)");
      return;
    }

    if (usernameStatus === "checking") {
      alert("사용자 이름 중복 확인이 진행 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const cleanUsername = username.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");

    // 저장 전 최종 안전 중복 검사 (새로운 username으로 변경하는 경우)
    if (cleanUsername && cleanUsername.toLowerCase() !== originalUsername.toLowerCase()) {
      const finalCheck = await checkUsernameAvailability(cleanUsername, user?.uid);
      if (!finalCheck.available && finalCheck.reason !== "mine") {
        alert(finalCheck.message || "이미 다른 사용자가 선점한 사용자 이름입니다.");
        return;
      }
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
        handle: cleanUsername || currentProfile.handle,
        username: cleanUsername,
        roleTitle: roleTitle.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || currentProfile.avatarUrl,
        resumePdfUrl: resumePdfUrl.trim() || undefined,
        socialLinks: finalSocials,
      };

      // 1. 로컬 스토리지 저장
      saveDesignerProfile(updatedProfile);

      // 2. Firestore 세부 서브 컬렉션 동기화 (users/{user.uid}/profile 및 user/{user.uid}/profile)
      await Promise.all([
        saveProfileInfoToFirestore(
          {
            name: updatedProfile.name,
            handle: updatedProfile.handle,
            username: updatedProfile.username,
            roleTitle: updatedProfile.roleTitle,
            bio: updatedProfile.bio,
            avatarUrl: updatedProfile.avatarUrl,
            skills: updatedProfile.skills,
          },
          user?.uid,
          originalUsername
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

  const containerClasses =
    "w-full max-w-[680px] my-0 sm:my-6 rounded-none border-0 sm:border border-[#E5E8EB] shadow-none bg-white flex flex-col pb-16 transition-all duration-300";

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] text-[#191F28] flex flex-col items-center">
      <main className={containerClasses}>
        {/* 상단 네비게이션 헤더 */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#E5E8EB] flex items-center justify-between select-none">
          <Link
            href="/"
            aria-label="뒤로가기"
            className="flex items-center justify-center text-[#4E5968] hover:text-[#191F28] transition-colors p-2 -ml-2 rounded-lg hover:bg-[#F2F4F6]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <span className="text-xs sm:text-sm font-bold text-[#191F28]">
            프로필 편집
          </span>

          <div className="w-9" />
        </header>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-8">
          {/* ======================================================== */}
          {/* 1. 디자인 기본 프로필 (첨부 이미지 스타일: 좌측 볼드 레이블, 우측 박스 인풋) */}
          {/* ======================================================== */}
          <div className="space-y-1">
            <div className="pb-2 border-b border-[#E5E8EB]">
              <h2 className="text-sm font-bold text-[#191F28]">
                기본 프로필
              </h2>
            </div>

            {/* 행 0: 프로필 사진 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-4 border-b border-[#F2F4F6]">
              <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0">
                프로필 사진
              </label>
              <div className="flex-1 flex items-center gap-4">
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  title="프로필 사진 변경 (클릭)"
                >
                  <Avatar
                    src={avatarUrl}
                    alt={name}
                    fallback={name.slice(0, 1) || "P"}
                    size="xl"
                    className="w-20 h-20 ring-2 ring-[#E5E8EB] shadow-none transition-opacity group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1">
                    <Camera className="w-4 h-4" />
                    <span>변경</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-3 text-xs font-medium text-[#191F28] border-[#E5E8EB] hover:bg-[#F2F4F6] rounded-lg cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" />
                      <span>사진 업로드</span>
                    </Button>
                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAvatarUrl("");
                          showToast("프로필 사진이 기본 이미지로 초기화되었어요.");
                        }}
                        className="h-8 px-2.5 text-xs text-[#E8344E] hover:bg-[#FEECEF] rounded-lg cursor-pointer"
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8B95A1]">
                    JPG, PNG, GIF 파일 지원 (권장 1:1 비율)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* 행 1: 이름 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
              <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0">
                이름 <span className="text-[#E8344E]">*</span>
              </label>
              <div className="flex-1">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="디자이너 이름을 입력하세요"
                  className="h-9 text-xs sm:text-sm bg-white border-[#E5E8EB]"
                />
              </div>
            </div>

            {/* 행 2: 사용자 이름 (Username) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
              <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0 sm:pt-2">
                사용자 이름 (@)
              </label>
              <div className="flex-1 space-y-1">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-[#8B95A1] font-mono pointer-events-none">
                    @
                  </span>
                  <Input
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="username (영문, 숫자, _)"
                    className={`h-9 text-xs sm:text-sm pl-6 pr-8 bg-white font-mono border-[#E5E8EB] transition-colors ${
                      usernameStatus === "taken" || usernameStatus === "invalid"
                        ? "border-[#E8344E] focus-visible:ring-[#E8344E]/20"
                        : usernameStatus === "available" || usernameStatus === "mine"
                        ? "border-[#00B06B] focus-visible:ring-[#00B06B]/20"
                        : ""
                    }`}
                  />
                  <div className="absolute right-2.5 flex items-center pointer-events-none">
                    {usernameStatus === "checking" && (
                      <Loader2 className="w-3.5 h-3.5 text-[#3182F6] animate-spin" />
                    )}
                    {usernameStatus === "available" && (
                      <Check className="w-3.5 h-3.5 text-[#00B06B]" />
                    )}
                    {usernameStatus === "mine" && (
                      <Check className="w-3.5 h-3.5 text-[#3182F6]" />
                    )}
                    {usernameStatus === "taken" && (
                      <X className="w-3.5 h-3.5 text-[#E8344E]" />
                    )}
                    {usernameStatus === "invalid" && (
                      <AlertCircle className="w-3.5 h-3.5 text-[#E8344E]" />
                    )}
                  </div>
                </div>
                {usernameFeedback && (
                  <p
                    className={`text-[11px] font-medium transition-colors ${
                      usernameStatus === "taken" || usernameStatus === "invalid"
                        ? "text-[#E8344E]"
                        : usernameStatus === "available"
                        ? "text-[#00B06B]"
                        : usernameStatus === "mine"
                        ? "text-[#3182F6]"
                        : "text-[#8B95A1]"
                    }`}
                  >
                    {usernameFeedback}
                  </p>
                )}
              </div>
            </div>

            {/* 행 3: 직함 / 포지션 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
              <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0">
                직함 / 포지션
              </label>
              <div className="flex-1">
                <Input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="예: Product & Visual Designer"
                  className="h-9 text-xs sm:text-sm bg-white border-[#E5E8EB]"
                />
              </div>
            </div>

            {/* 행 4: 소개글 (Bio) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
              <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0 sm:pt-2">
                소개글 (Bio)
              </label>
              <div className="flex-1">
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="디자이너 소개글을 입력하세요 (경력 목표, 디자인 철학 등)"
                  className="text-xs sm:text-sm bg-white border-[#E5E8EB] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. 소셜 채널 링크 관리 (첨부 이미지 스타일) */}
          {/* ======================================================== */}
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E8EB]">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#191F28]" />
                <h2 className="text-sm font-bold text-[#191F28]">
                  소셜 채널 링크
                </h2>
              </div>
              <span className="text-[11px] text-[#8B95A1] font-mono">
                {socialList.length}개 등록됨
              </span>
            </div>

            {/* 등록된 소셜 링크 목록 */}
            {socialList.length > 0 ? (
              <div className="divide-y divide-[#F2F4F6]">
                {socialList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* 동그라미 형태의 아이콘 컨테이너 */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[#E5E8EB] shrink-0">
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
                      className="p-1.5 rounded-lg text-[#8B95A1] hover:text-[#E8344E] hover:bg-[#FEECEF] transition-colors shrink-0 cursor-pointer"
                      title="소셜 링크 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !isAddingSocial && (
                <div className="py-6 text-center">
                  <p className="text-xs text-[#8B95A1]">
                    등록된 소셜 링크가 없습니다.
                  </p>
                </div>
              )
            )}

            {/* 새 소셜 링크 추가 입력 영역 */}
            {isAddingSocial ? (
              <div className="py-3.5 border-t border-[#F2F4F6] space-y-2.5 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0">
                    새 링크 URL
                  </label>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={newSocialInput}
                      onChange={(e) => setNewSocialInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSocialItem();
                        }
                      }}
                      placeholder="https://instagram.com/아이디, 깃허브 등"
                      className="h-9 text-xs sm:text-sm bg-white border-[#E5E8EB] flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddSocialItem}
                      disabled={!newSocialInput.trim()}
                      className="h-9 px-3.5 text-xs font-semibold bg-[#191F28] hover:bg-[#333D4B] text-white rounded-lg cursor-pointer shrink-0"
                    >
                      추가
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingSocial(false);
                        setNewSocialInput("");
                      }}
                      className="h-9 px-3 text-xs text-[#6B7684] border-[#E5E8EB] rounded-lg shrink-0 cursor-pointer"
                    >
                      취소
                    </Button>
                  </div>
                </div>

                {currentPreview && (
                  <div className="flex items-center gap-2 sm:ml-36 pl-4 text-xs">
                    <span className="text-[11px] text-[#8B95A1]">감지된 채널:</span>
                    <div className="flex items-center gap-1.5 font-bold text-[#191F28]">
                      {renderSocialIcon(currentPreview.iconType, "w-3.5 h-3.5")}
                      <span>{currentPreview.name}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingSocial(true)}
                  className="h-8.5 px-3 text-xs font-medium text-[#4E5968] bg-transparent border-[#E5E8EB] hover:bg-[#F2F4F6] hover:text-[#191F28] rounded-lg gap-1.5 shadow-none cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>소셜 채널 링크 추가</span>
                </Button>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. 이력서 (Resume) 링크 관리 (첨부 이미지 스타일) */}
          {/* ======================================================== */}
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E8EB]">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#191F28]" />
                <h2 className="text-sm font-bold text-[#191F28]">
                  이력서 (Resume) 관리
                </h2>
              </div>
              <span className="text-[11px] text-[#8B95A1]">선택 항목</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
              <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0 sm:pt-1.5">
                이력서 링크
              </label>
              <div className="flex-1 space-y-2.5">
                {/* 케이스 A: 이미 이력서가 등록되어 있는 경우 */}
                {resumePdfUrl && !isAddingResume ? (
                  <div className="p-3 rounded-xl border border-[#E5E8EB] bg-[#FAFAFA] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#E5E8EB] text-[#191F28] shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <a
                            href={resumePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#191F28] font-mono hover:underline truncate block"
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
                          className="p-1 rounded text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] transition-colors cursor-pointer"
                          title="이력서 링크 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveResume}
                          className="p-1 rounded text-[#8B95A1] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                          title="이력서 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#8B95A1]">
                      * 메인 프로필에 &apos;이력서 다운로드&apos; 버튼이 노출되고 있습니다.
                    </p>
                  </div>
                ) : null}

                {/* 케이스 B: 이력서 링크 추가 또는 수정 중일 때 */}
                {isAddingResume ? (
                  <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E8EB] space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-1 border-b border-[#E5E8EB]">
                      <span className="text-xs font-bold text-[#191F28]">
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
                        className="h-8.5 text-xs bg-white border-[#E5E8EB]"
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
                        className="h-7.5 px-3 text-xs text-[#4E5968] border-[#E5E8EB] hover:bg-[#F2F4F6] rounded-lg cursor-pointer"
                      >
                        취소
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleApplyResume}
                        className="h-7.5 px-3.5 text-xs bg-[#191F28] hover:bg-[#333D4B] text-white rounded-lg shadow-none cursor-pointer"
                      >
                        확인
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* 케이스 C: 등록된 이력서가 없고 추가 모드도 아닐 때 */}
                {!resumePdfUrl && !isAddingResume ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResumeTempInput("");
                      setIsAddingResume(true);
                    }}
                    className="h-8.5 px-3 text-xs font-medium text-[#4E5968] bg-transparent border-[#E5E8EB] hover:bg-[#F2F4F6] hover:text-[#191F28] rounded-lg gap-1.5 shadow-none cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>이력서 링크 등록</span>
                  </Button>
                ) : null}
              </div>
            </div>
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
              className="flex-1 h-11 text-xs sm:text-sm font-semibold bg-[#191F28] hover:bg-[#333D4B] text-white rounded-xl flex items-center justify-center gap-1.5 shadow-none active:scale-[0.98] transition-all cursor-pointer"
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
