"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Settings,
  LogOut,
  FolderGit2,
  Calendar,
  FileText,
  Lock,
  Globe,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getDesignerProfile } from "@/lib/portfolioStorage";
import { getLinksFromFirestore } from "@/lib/firestoreLinks";
import {
  getProfileInfoFromFirestore,
  getProfileLinksFromFirestore,
} from "@/lib/firestoreProfile";
import { DesignerProfileData, ProjectItem } from "@/types/portfolio";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { GoogleIcon } from "@/components/ui/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function MyPage() {
  const router = useRouter();
  const { user, userProfile, isLoading: isAuthLoading, signInWithGoogle, logout } =
    useAuth();

  const [profile, setProfile] = useState<DesignerProfileData>(() => getDesignerProfile());
  const [links, setLinks] = useState<ProjectItem[]>(() => getDesignerProfile().projects || []);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Base UI Switch 상태들
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [allowResumeDownload, setAllowResumeDownload] = useState<boolean>(true);
  const [enableAnalytics, setEnableAnalytics] = useState<boolean>(true);
  const [enableNotification, setEnableNotification] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (user) {
      // Firestore에서 유저 링크 및 프로필 로드
      Promise.all([
        getLinksFromFirestore(user.uid),
        getProfileInfoFromFirestore(user.uid),
        getProfileLinksFromFirestore(user.uid),
      ])
        .then(([firestoreLinks, info, linksPayload]) => {
          setLinks(firestoreLinks);
          const local = getDesignerProfile();
          setProfile({
            ...local,
            name: info?.name || userProfile?.displayName || user.displayName || local.name,
            handle:
              info?.handle ||
              userProfile?.handle ||
              (user.email ? user.email.split("@")[0] : local.handle),
            roleTitle: info?.roleTitle || userProfile?.roleTitle || local.roleTitle,
            bio: info?.bio || userProfile?.bio || local.bio,
            avatarUrl: info?.avatarUrl || userProfile?.photoURL || user.photoURL || local.avatarUrl,
            resumePdfUrl: linksPayload?.resumePdfUrl || local.resumePdfUrl,
            socialLinks: {
              ...local.socialLinks,
              ...(linksPayload?.socialLinks || {}),
              email: linksPayload?.socialLinks?.email || user.email || local.socialLinks?.email,
            },
            projects: firestoreLinks,
          });
        })
        .catch((err) => {
          console.warn("마이페이지 데이터 로드 오류:", err);
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }
  }, [user, userProfile]);

  // 포트폴리오 완성도 계산
  const completionScore = useMemo(() => {
    let score = 0;
    if (profile.name && profile.name.trim()) score += 20;
    if (profile.roleTitle && profile.roleTitle.trim()) score += 15;
    if (profile.bio && profile.bio.trim()) score += 15;
    if (profile.avatarUrl && profile.avatarUrl.trim()) score += 15;
    if (links.length > 0) score += 20;
    if (profile.resumePdfUrl && profile.resumePdfUrl.trim()) score += 15;
    return Math.min(score, 100);
  }, [profile, links]);

  // 공유 링크 복사 핸들러
  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/@${profile.handle || "designer"}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    showToast("내 포트폴리오 주소가 복사되었어요! 🔗");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await logout();
      showToast("로그아웃 되었습니다.");
      router.push("/");
    } catch {
      showToast("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // Google 로그인
  const handleGoogleLogin = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        showToast(`${loggedUser.displayName || "회원"}님 환영합니다! 🎉`);
      }
    } catch (err: unknown) {
      console.error("로그인 실패:", err);
      showToast("Google 로그인에 실패했습니다.");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F2F4F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#3182F6]" />
          <span className="text-xs text-[#8B95A1]">계정 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 비로그인 상태 안내 화면
  if (!user) {
    return (
      <TooltipProvider>
        <div className="min-h-screen w-full bg-[#F2F4F6] text-[#191F28] flex flex-col items-center">
          <main className="w-full max-w-[480px] min-h-screen bg-[#F9FAFB] flex flex-col rounded-none shadow-none border-x border-[#E5E8EB]/60 pb-16">
            {/* 상단 탑바 */}
            <header className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E8EB]">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-[15px] font-bold text-[#191F28]"
              >
                <span className="w-6 h-6 rounded-lg bg-[#3182F6] flex items-center justify-center text-white text-xs font-black">
                  M
                </span>
                <span>MyLink</span>
              </Link>
              <Link
                href="/landing"
                className="text-xs font-semibold text-[#3182F6] hover:underline"
              >
                서비스 소개
              </Link>
            </header>

            {/* 비로그인 안내 카드 */}
            <div className="px-5 py-12 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center mb-4 shadow-none">
                <Lock className="w-8 h-8" />
              </div>

              <h1 className="text-xl font-bold text-[#191F28] tracking-tight">
                마이페이지는 로그인이 필요해요
              </h1>
              <p className="mt-2 text-xs text-[#4E5968] leading-relaxed max-w-xs break-keep">
                Google 계정으로 로그인하시면 내 포트폴리오 관리,
                <code className="mx-1 px-1.5 py-0.5 rounded bg-[#F2F4F6] text-[#3182F6] font-mono text-[11px]">
                  users/{`{uid}`}/links
                </code>
                클라우드 동기화 및 공개 설정을 자유롭게 변경할 수 있습니다.
              </p>

              <div className="mt-6 w-full max-w-xs space-y-2.5">
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full h-12 rounded-2xl bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-sm shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <GoogleIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>Google 계정으로 로그인</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full h-10 rounded-xl text-xs font-semibold text-[#4E5968] border-[#E5E8EB]"
                >
                  메인 포트폴리오 둘러보기
                </Button>
              </div>
            </div>
          </main>
          <Toast message={toastMessage} />
        </div>
      </TooltipProvider>
    );
  }

  // 로그인 상태 마이페이지
  return (
    <TooltipProvider>
      <div className="min-h-screen w-full bg-[#F2F4F6] text-[#191F28] flex flex-col items-center">
        <main className="w-full max-w-[480px] min-h-screen bg-[#F9FAFB] flex flex-col rounded-none shadow-none border-x border-[#E5E8EB]/60 pb-16">
          {/* 1. 상단 네비게이션 헤더 */}
          <header className="w-full flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-[#E5E8EB]/70 sticky top-0 z-30 select-none">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-[15px] font-bold text-[#191F28] hover:opacity-85 transition-opacity"
              >
                <span className="w-6 h-6 rounded-lg bg-[#3182F6] flex items-center justify-center text-white text-xs font-black shadow-none">
                  M
                </span>
                <span className="tracking-tight">MyLink</span>
              </Link>
              <span className="text-[11px] font-semibold text-[#8B95A1] px-2 py-0.5 rounded-full bg-[#F2F4F6]">
                마이페이지
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#4E5968] bg-[#F2F4F6] hover:bg-[#E5E8EB] transition-colors"
              >
                <span>내 포트폴리오</span>
                <ExternalLink className="w-3 h-3 text-[#8B95A1]" />
              </Link>
              <button
                onClick={handleLogout}
                aria-label="로그아웃"
                title="로그아웃"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E5E8EB] text-[#8B95A1] hover:text-[#F04452] hover:bg-[#FEECEE] transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* 2. 유저 프로필 및 계정 요약 카드 */}
          <section className="p-4 select-none">
            <div className="rounded-3xl bg-white border border-[#E5E8EB] p-5 shadow-none">
              <div className="flex items-center gap-3.5">
                <Avatar
                  src={profile.avatarUrl}
                  alt={profile.name}
                  fallback={profile.name.slice(0, 1)}
                  size="lg"
                  className="w-14 h-14 ring-2 ring-[#3182F6]/20 shadow-none shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-base font-bold text-[#191F28] truncate">
                      {profile.name}
                    </h1>
                    <span className="text-[11px] font-bold text-[#3182F6] bg-[#E8F3FF] px-1.5 py-0.5 rounded-full">
                      ✓ 인증됨
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#4E5968] truncate mt-0.5">
                    {profile.roleTitle || "Product & Visual Designer"}
                  </p>
                  <p className="text-[11px] font-mono text-[#8B95A1] truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                <Link
                  href="/profile/edit"
                  className="flex h-8 px-2.5 items-center justify-center gap-1 rounded-xl bg-[#F2F4F6] hover:bg-[#E8F3FF] text-[#4E5968] hover:text-[#3182F6] text-xs font-bold transition-all shrink-0"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>수정</span>
                </Link>
              </div>

              {/* Base UI Progress: 포트폴리오 완성도 바 */}
              <div className="mt-4 pt-3.5 border-t border-[#F2F4F6]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#4E5968]">
                    포트폴리오 완성도
                  </span>
                  <span className="font-bold text-[#3182F6] font-mono">
                    {completionScore}%
                  </span>
                </div>
                <Progress value={completionScore} indicatorColor="bg-[#3182F6]" />
                <p className="mt-1.5 text-[11px] text-[#8B95A1]">
                  {completionScore === 100
                    ? "🎉 모든 필수 항목이 완벽하게 등록되었습니다!"
                    : "프로필 사진, 바이오, 작업물 링크 및 이력서를 등록하면 완성도가 올라가요."}
                </p>
              </div>

              {/* 내 포트폴리오 고유 URL 복사 바 (Base UI Tooltip 적용) */}
              <div className="mt-3.5 flex items-center justify-between p-2.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Globe className="w-3.5 h-3.5 text-[#3182F6] shrink-0" />
                  <span className="text-xs font-mono text-[#333D4B] truncate">
                    mylink.io/@{profile.handle || "designer"}
                  </span>
                </div>

                <Tooltip>
                  <TooltipTrigger
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#D1D6DB] text-xs font-bold text-[#191F28] hover:bg-[#F2F4F6] active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-[#3182F6]" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#4E5968]" />
                    )}
                    <span>{isCopied ? "복사됨" : "URL 복사"}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    내 포트폴리오 공유 링크 복사하기
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </section>

          {/* 3. Base UI Tabs: 마이페이지 세부 섹션 */}
          <section className="px-4 flex-1">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-10 p-1 bg-[#E5E8EB]/70 rounded-2xl mb-4">
                <TabsTrigger
                  value="overview"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-[#191F28] data-[state=active]:shadow-none transition-all"
                >
                  개요 & 통계
                </TabsTrigger>
                <TabsTrigger
                  value="links"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-[#191F28] data-[state=active]:shadow-none transition-all"
                >
                  내 링크 ({links.length})
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-[#191F28] data-[state=active]:shadow-none transition-all"
                >
                  설정
                </TabsTrigger>
              </TabsList>

              {/* 탭 1: 개요 & 통계 */}
              <TabsContent value="overview" className="space-y-3">
                {/* 통계 요약 그리드 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E8EB] shadow-none">
                    <div className="flex items-center gap-1.5 text-xs text-[#8B95A1] font-medium">
                      <Layers className="w-3.5 h-3.5 text-[#3182F6]" />
                      <span>등록된 작업물</span>
                    </div>
                    <div className="text-xl font-bold text-[#191F28] mt-1 font-mono">
                      {links.length}
                      <span className="text-xs font-normal text-[#8B95A1] ml-0.5">
                        개
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E8EB] shadow-none">
                    <div className="flex items-center gap-1.5 text-xs text-[#8B95A1] font-medium">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#3182F6]" />
                      <span>보유 도구</span>
                    </div>
                    <div className="text-xl font-bold text-[#191F28] mt-1 font-mono">
                      {profile.toolProficiencies?.length || 0}
                      <span className="text-xs font-normal text-[#8B95A1] ml-0.5">
                        개
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E8EB] shadow-none">
                    <div className="flex items-center gap-1.5 text-xs text-[#8B95A1] font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#3182F6]" />
                      <span>경력 및 활동</span>
                    </div>
                    <div className="text-xl font-bold text-[#191F28] mt-1 font-mono">
                      {profile.careers?.length || 0}
                      <span className="text-xs font-normal text-[#8B95A1] ml-0.5">
                        개
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E8EB] shadow-none">
                    <div className="flex items-center gap-1.5 text-xs text-[#8B95A1] font-medium">
                      <FileText className="w-3.5 h-3.5 text-[#3182F6]" />
                      <span>이력서 PDF</span>
                    </div>
                    <div className="text-sm font-bold text-[#191F28] mt-1.5 truncate">
                      {profile.resumePdfUrl ? "등록 완료" : "미등록"}
                    </div>
                  </div>
                </div>

                {/* Firestore 클라우드 동기화 상태 카드 */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#E8F3FF]/70 to-white border border-[#3182F6]/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#3182F6]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>개인화 클라우드 동기화 활성화됨</span>
                  </div>
                  <p className="mt-1 text-xs text-[#4E5968] leading-relaxed break-keep">
                    회원님의 데이터는 Firestore 보안 경로에 안전하게 격리되어 보관됩니다.
                  </p>
                  <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-white/80 border border-[#3182F6]/20 font-mono text-[11px] text-[#3182F6] flex items-center justify-between">
                    <span className="truncate">users/{user.uid}/links</span>
                    <span className="text-[10px] bg-[#3182F6] text-white px-1.5 py-0.5 rounded-md shrink-0">
                      LIVE
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* 탭 2: 내 링크 관리 */}
              <TabsContent value="links" className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#4E5968]">
                    등록된 프로젝트 목록
                  </span>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#3182F6] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>새 링크 추가</span>
                  </Link>
                </div>

                {isLoadingData ? (
                  <div className="py-8 text-center text-xs text-[#8B95A1]">
                    링크 목록 불러오는 중...
                  </div>
                ) : links.length > 0 ? (
                  <div className="space-y-2">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E5E8EB] hover:border-[#3182F6]/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {link.thumbnailUrl && (
                            <img
                              src={link.thumbnailUrl}
                              alt={link.title}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E5E8EB]"
                            />
                          )}
                          <div className="min-w-0">
                            <h2 className="text-xs font-bold text-[#191F28] truncate">
                              {link.title}
                            </h2>
                            <p className="text-[11px] text-[#8B95A1] truncate">
                              {link.categoryLabel} • {link.period}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <Link
                            href={`/projects/${link.id}`}
                            className="p-1.5 rounded-lg bg-[#F2F4F6] hover:bg-[#E8F3FF] text-[#4E5968] hover:text-[#3182F6] text-xs transition-colors"
                            title="상세 및 수정"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-white rounded-2xl border border-[#E5E8EB] p-4">
                    <p className="text-xs font-bold text-[#191F28]">
                      아직 등록된 링크가 없어요
                    </p>
                    <p className="text-[11px] text-[#8B95A1] mt-1">
                      메인 포트폴리오에서 첫 번째 작업물 링크를 추가해보세요.
                    </p>
                    <Link
                      href="/"
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3182F6] text-white text-xs font-bold shadow-none hover:bg-[#1B64DA] transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>작업물 추가하러 가기</span>
                    </Link>
                  </div>
                )}
              </TabsContent>

              {/* 탭 3: 설정 (Base UI Switch & Accordion 활용) */}
              <TabsContent value="settings" className="space-y-4">
                {/* 1. Base UI Switch를 활용한 공개 설정 리스트 */}
                <div className="rounded-3xl bg-white border border-[#E5E8EB] p-4 space-y-4">
                  <h2 className="text-xs font-bold text-[#8B95A1] uppercase tracking-wider">
                    포트폴리오 공개 및 보안
                  </h2>

                  {/* 스위치 1: 전체 공개 여부 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#191F28]">
                        포트폴리오 전체 공개
                      </div>
                      <p className="text-[11px] text-[#8B95A1] mt-0.5">
                        링크를 가진 누구나 내 포트폴리오를 방문할 수 있습니다.
                      </p>
                    </div>
                    <Switch
                      checked={isPublic}
                      onCheckedChange={(checked) => {
                        setIsPublic(checked);
                        showToast(
                          checked
                            ? "포트폴리오가 공개 상태로 설정되었어요"
                            : "포트폴리오가 비공개로 전환되었어요"
                        );
                      }}
                    />
                  </div>

                  <div className="h-px bg-[#F2F4F6]" />

                  {/* 스위치 2: 이력서 다운로드 허용 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#191F28]">
                        방문자 이력서 PDF 다운로드 허용
                      </div>
                      <p className="text-[11px] text-[#8B95A1] mt-0.5">
                        헤더에 이력서 다운로드 CTA 버튼을 노출합니다.
                      </p>
                    </div>
                    <Switch
                      checked={allowResumeDownload}
                      onCheckedChange={(checked) => {
                        setAllowResumeDownload(checked);
                        showToast(
                          checked
                            ? "이력서 다운로드가 활성화되었어요"
                            : "이력서 다운로드가 비활성화되었어요"
                        );
                      }}
                    />
                  </div>

                  <div className="h-px bg-[#F2F4F6]" />

                  {/* 스위치 3: 방문자 통계 수집 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#191F28]">
                        방문자 조회수 수집 활성화
                      </div>
                      <p className="text-[11px] text-[#8B95A1] mt-0.5">
                        포트폴리오 뷰 및 링크 클릭 트래킹을 수집합니다.
                      </p>
                    </div>
                    <Switch
                      checked={enableAnalytics}
                      onCheckedChange={(checked) => {
                        setEnableAnalytics(checked);
                        showToast("통계 설정이 변경되었습니다.");
                      }}
                    />
                  </div>

                  <div className="h-px bg-[#F2F4F6]" />

                  {/* 스위치 4: 이메일 문의 알림 수신 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#191F28]">
                        새로운 협업 제안 알림
                      </div>
                      <p className="text-[11px] text-[#8B95A1] mt-0.5">
                        방문자가 이메일로 제안 시 알림을 받습니다.
                      </p>
                    </div>
                    <Switch
                      checked={enableNotification}
                      onCheckedChange={(checked) => {
                        setEnableNotification(checked);
                        showToast("알림 설정이 변경되었습니다.");
                      }}
                    />
                  </div>
                </div>

                {/* 2. Base UI Accordion을 활용한 세부 도움말 섹션 */}
                <div className="rounded-3xl bg-white border border-[#E5E8EB] p-4">
                  <h2 className="text-xs font-bold text-[#8B95A1] uppercase tracking-wider mb-2">
                    서비스 가이드 및 계정 관리
                  </h2>
                  <Accordion defaultValue={["item-1"]}>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        Firestore 클라우드 동기화 경로 안내
                      </AccordionTrigger>
                      <AccordionContent>
                        회원님의 프로젝트 링크 데이터는 Firebase Firestore의
                        <code className="mx-1 px-1 py-0.5 rounded bg-[#F2F4F6] text-[#3182F6] font-mono font-semibold">
                          users/{user.uid}/links
                        </code>
                        컬렉션에 실시간 저장됩니다. 프로필 정보는
                        <code className="mx-1 px-1 py-0.5 rounded bg-[#F2F4F6] text-[#3182F6] font-mono font-semibold">
                          users/{user.uid}/profile
                        </code>
                        에 안전하게 격리되어 보관됩니다.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        커스텀 도메인 및 고유 주소 설정
                      </AccordionTrigger>
                      <AccordionContent>
                        현재 기본 주소는
                        <code className="mx-1 px-1 py-0.5 rounded bg-[#F2F4F6] font-mono">
                          mylink.io/@{profile.handle}
                        </code>
                        형태로 제공됩니다. 프로필 수정 페이지에서 핸들(@handle)을 자유롭게 변경하실 수 있습니다.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>
                        계정 연동 및 데이터 보존 정책
                      </AccordionTrigger>
                      <AccordionContent>
                        Google 소셜 로그인을 통해 연결된 계정 정보는 안전하게 관리되며, 언제든지 원하는 프로젝트 항목을 수정하거나 영구 삭제할 수 있습니다.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* 푸터 */}
          <footer className="mt-8 mb-4 flex flex-col items-center justify-center text-center px-4 select-none">
            <Link
              href="/landing"
              className="text-xs font-semibold text-[#3182F6] hover:underline"
            >
              MyLink 서비스 소개 보기
            </Link>
            <p className="mt-1 text-[11px] text-[#B0B8C1]">
              © 2026 MyLink. 디자이너를 위한 올인원 포트폴리오 아카이빙
            </p>
          </footer>
        </main>

        <Toast message={toastMessage} />
      </div>
    </TooltipProvider>
  );
}
