"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, notFound } from "next/navigation";
import {
  Search,
  RefreshCw,
  Plus,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  DesignerProfileData,
  ProjectCategory,
  ViewMode,
  ProjectItem,
  CategoryItem,
  ToolProficiency,
  CareerItem,
  DEFAULT_CATEGORIES,
} from "@/types/portfolio";
import {
  getDesignerProfile,
  resetDesignerProfile,
  saveDesignerProfile,
} from "@/lib/portfolioStorage";
import {
  saveLinkToFirestore,
  deleteLinkFromFirestore,
  getLinksFromFirestore,
  trackProjectClick,
} from "@/lib/firestoreLinks";
import {
  getProfileInfoFromFirestore,
  getProfileLinksFromFirestore,
  getToolsFromFirestore,
  getCareersFromFirestore,
  saveToolsToFirestore,
  saveCareersToFirestore,
  findUserIdByUsername,
  findUserByHandleOrUid,
} from "@/lib/firestoreProfile";
import { useAuth } from "@/context/AuthContext";
import { TopNavHeader } from "@/components/portfolio/TopNavHeader";
import { ProfileHeader } from "@/components/portfolio/ProfileHeader";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { DeleteConfirmModal } from "@/components/portfolio/DeleteConfirmModal";
import { ToolProficiencyBars } from "@/components/portfolio/ToolProficiencyBars";
import { AddLinkModal } from "@/components/portfolio/AddLinkModal";
import { CareerTimeline } from "@/components/portfolio/CareerTimeline";
import { ShareModal } from "@/components/profile/ShareModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type DeleteTarget =
  | { type: "project"; data: ProjectItem }
  | { type: "tool"; data: ToolProficiency }
  | { type: "career"; data: CareerItem }
  | null;

export interface PortfolioBoardProps {
  targetHandle?: string;
  targetUsername?: string;
  targetUid?: string;
  isDemo?: boolean;
  isDynamicRoute?: boolean;
  hideHeaderProfileMenu?: boolean;
  showCreateProjectButton?: boolean;
  isPreview?: boolean;
  onUserNotFound?: () => void;
}

const EMPTY_PROFILE: DesignerProfileData = {
  handle: "",
  username: "",
  name: "",
  roleTitle: "",
  bio: "",
  avatarUrl: "",
  resumePdfUrl: "",
  socialLinks: {},
  skills: [],
  toolProficiencies: [],
  careers: [],
  projects: [],
  categories: DEFAULT_CATEGORIES,
};

export function PortfolioBoard({
  targetHandle,
  targetUsername,
  targetUid: initialTargetUid,
  isDemo = false,
  isDynamicRoute = false,
  hideHeaderProfileMenu = false,
  showCreateProjectButton,
  isPreview = false,
  onUserNotFound,
}: PortfolioBoardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, signInWithGoogle } = useAuth();

  const fromMypage = searchParams.get("from") === "mypage";

  const [profile, setProfile] = useState<DesignerProfileData>(EMPTY_PROFILE);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const effectiveIdentifier = targetUsername || targetHandle;

  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // 현재 열람 중인 프로필의 UID 및 소유자 여부
  const [resolvedOwnerUid, setResolvedOwnerUid] = useState<string | null>(
    initialTargetUid || null
  );

  const isPublicView = useMemo(() => {
    if (isPreview) return true;
    if (isDemo) return true;
    if (effectiveIdentifier) {
      if (user && resolvedOwnerUid && user.uid === resolvedOwnerUid) {
        return false;
      }
      return true;
    }
    if (initialTargetUid && user?.uid !== initialTargetUid) {
      return true;
    }
    return false;
  }, [isPreview, isDemo, effectiveIdentifier, initialTargetUid, user, resolvedOwnerUid]);

  const isOwner = useMemo(() => {
    // /preview 라우트는 다른 사람이 내 링크를 볼 때 어떻게 보이는지 확인하는 방문자 시점 뷰이므로
    // 모든 추가/편집/삭제 권한을 비활성화함
    if (isPreview) return false;
    if (isDemo) return false;
    if (isPublicView) {
      return Boolean(user && resolvedOwnerUid && user.uid === resolvedOwnerUid);
    }
    return Boolean(user);
  }, [isPreview, isDemo, isPublicView, user, resolvedOwnerUid]);

  // 통합 삭제 확인 모달 대상 및 진행 상태
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Firestore users/{uid}/links에서 링크 목록을 불러와 프로필 프로젝트 목록 갱신
  const fetchAndApplyLinks = useCallback(
    async (targetUid?: string, showUpdatingIndicator = false) => {
      if (showUpdatingIndicator) {
        setIsUpdating(true);
      }
      try {
        const firestoreLinks = await getLinksFromFirestore(targetUid);
        setProfile((prev) => {
          if (targetUid) {
            return {
              ...prev,
              projects: firestoreLinks,
            };
          }

          // 비로그인 상태일 때는 기존 로컬 목록과 병합
          const map = new Map<string, ProjectItem>();
          prev.projects.forEach((p) => map.set(p.id, p));
          firestoreLinks.forEach((p) => map.set(p.id, p));

          const firestoreIdOrder = new Map<string, number>();
          firestoreLinks.forEach((p, idx) => firestoreIdOrder.set(p.id, idx));

          const mergedList = Array.from(map.values()).sort((a, b) => {
            const aOrder = firestoreIdOrder.get(a.id);
            const bOrder = firestoreIdOrder.get(b.id);
            if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
            if (aOrder !== undefined) return -1;
            if (bOrder !== undefined) return 1;
            return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
          });

          return {
            ...prev,
            projects: mergedList,
          };
        });
      } catch (error) {
        console.warn("Firestore 링크 로드 실패:", error);
      } finally {
        setIsLoadingLinks(false);
        setIsUpdating(false);
      }
    },
    []
  );

  // 프로필 데이터 로드
  useEffect(() => {
    setIsMounted(true);

    const loadData = async () => {
      setIsLoadingLinks(true);

      // 케이스 1: 데모 모드이거나 타겟 핸들이 "demo"인 경우
      if (isDemo || effectiveIdentifier === "demo") {
        const sample = getDesignerProfile();
        setProfile(sample);
        setIsLoadingLinks(false);
        return;
      }

      // 케이스 2: 타인의 사용자 이름(username)이 지정된 경우
      if (effectiveIdentifier) {
        const cleanIdentifier = effectiveIdentifier.replace(/^@/, "").trim();
        try {
          const match = await findUserIdByUsername(cleanIdentifier);
          if (match?.uid) {
            setResolvedOwnerUid(match.uid);
            const firestoreLinks = await getLinksFromFirestore(match.uid);

            const [info, links, tools, careers] = await Promise.all([
              getProfileInfoFromFirestore(match.uid),
              getProfileLinksFromFirestore(match.uid),
              getToolsFromFirestore(match.uid),
              getCareersFromFirestore(match.uid),
            ]);

            setProfile({
              name: info?.name || match.userInfo?.displayName || "프로필",
              handle: info?.handle || match.userInfo?.handle || cleanIdentifier,
              username: info?.username || match.userInfo?.username || cleanIdentifier,
              avatarUrl: info?.avatarUrl || match.userInfo?.photoURL || "",
              roleTitle: info?.roleTitle || match.userInfo?.roleTitle || "",
              bio: info?.bio || match.userInfo?.bio || "",
              skills: info?.skills || [],
              resumePdfUrl: links?.resumePdfUrl || "",
              socialLinks: links?.socialLinks || {},
              toolProficiencies: tools || [],
              careers: careers || [],
              projects: firestoreLinks || [],
              categories: DEFAULT_CATEGORIES,
            });
            setIsLoadingLinks(false);
            return;
          }
        } catch (err) {
          console.warn("사용자 이름 기반 유저 조회 실패:", err);
        }

        // 유저를 찾지 못한 경우: 동적 라우팅 페이지에서는 404 처리
        if (isDynamicRoute) {
          setIsLoadingLinks(false);
          if (onUserNotFound) {
            onUserNotFound();
          } else {
            setIsNotFound(true);
          }
          return;
        }

        // 핸들 조회 실패 시 기본 샘플 표시
        const local = getDesignerProfile();
        setProfile(local);
        setIsLoadingLinks(false);
        return;
      }

      // 케이스 3: 본인 로그인 상태 (targetHandle 없음)
      // 최초 로그인 시 더미 데이터(Figma 95%, Toss 등) 없이 빈 상태로 초기화
      if (user) {
        setResolvedOwnerUid(user.uid);
        await fetchAndApplyLinks(user.uid);

        try {
          const [info, links, tools, careers] = await Promise.all([
            getProfileInfoFromFirestore(user.uid),
            getProfileLinksFromFirestore(user.uid),
            getToolsFromFirestore(user.uid),
            getCareersFromFirestore(user.uid),
          ]);

          // 1) 사용자 이름: 구글 이메일 @의 앞부분 (예: user123@gmail.com -> user123)
          const emailPrefix = user.email
            ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "")
            : user.uid.slice(0, 6);
          const userUsername =
            info?.username ||
            info?.handle ||
            userProfile?.username ||
            userProfile?.handle ||
            emailPrefix ||
            "user";

          // 2) 이름: 로그인 정보 중 이름 (Google displayName)
          const userName =
            info?.name ||
            userProfile?.displayName ||
            user.displayName ||
            (user.email ? user.email.split("@")[0] : "디자이너");

          setProfile((prev) => ({
            ...prev,
            name: userName,
            avatarUrl:
              info?.avatarUrl ||
              userProfile?.photoURL ||
              user.photoURL ||
              "",
            handle: userUsername,
            username: userUsername,
            roleTitle:
              info?.roleTitle || userProfile?.roleTitle || "",
            bio: info?.bio || userProfile?.bio || "",
            skills: info?.skills || [],
            // 이력서 URL이 없을 경우 빈 문자열 유지 (이력서 버튼 비노출)
            resumePdfUrl: links?.resumePdfUrl || "",
            socialLinks: {
              ...(links?.socialLinks || {}),
              email:
                links?.socialLinks?.email ||
                user.email ||
                "",
            },
            // Firestore에 저장된 정보가 없으면 빈 배열([]) 유지 (더미 데이터 제거)
            toolProficiencies: tools || [],
            careers: careers || [],
          }));
        } catch (err) {
          console.warn("본인 프로필 데이터 로드 오류:", err);
        }
        setIsLoadingLinks(false);
        return;
      }

      // 케이스 4: 비로그인 게스트
      const localData = getDesignerProfile();
      setProfile(localData);
      setIsLoadingLinks(false);
    };

    loadData();
  }, [user, userProfile, targetHandle, isDemo, fetchAndApplyLinks]);

  const handleResetData = () => {
    const data = resetDesignerProfile();
    setProfile(data);
    showToast("샘플 포트폴리오 데이터가 새로고침되었습니다.");
  };

  const handleResumeDownload = () => {
    if (profile.resumePdfUrl && profile.resumePdfUrl.trim()) {
      window.open(profile.resumePdfUrl, "_blank", "noopener,noreferrer");
      showToast("이력서 다운로드를 시작합니다.");
    } else {
      showToast("등록된 이력서 파일이 없습니다.");
    }
  };

  const savedTools = useMemo(() => {
    const projectTools = profile.projects.flatMap((p) => p.tools);
    const customTools = profile.customTools || [];
    return Array.from(new Set([...projectTools, ...customTools])).filter(Boolean);
  }, [profile.projects, profile.customTools]);

  const handleAddCategory = (newCategory: CategoryItem) => {
    setProfile((prev) => {
      const existingCats = prev.categories || DEFAULT_CATEGORIES;
      if (
        existingCats.some(
          (c) => c.id === newCategory.id || c.label === newCategory.label
        )
      ) {
        return prev;
      }
      const updated = {
        ...prev,
        categories: [...existingCats, newCategory],
      };
      saveDesignerProfile(updated);
      return updated;
    });
    showToast(`'${newCategory.label}' 카테고리가 추가되었습니다.`);
  };

  const handleOpenAddModal = () => {
    if (!user) {
      showToast("로그인 후 이용할 수 있습니다.");
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleAddProject = async (newProject: ProjectItem, newTools: string[]) => {
    setIsUpdating(true);
    setProfile((prev) => {
      const projectTools = newProject.tools || [];
      const combinedTools = Array.from(
        new Set([...(prev.customTools || []), ...projectTools, ...newTools])
      ).filter(Boolean);

      const existingCats = prev.categories || DEFAULT_CATEGORIES;
      const catExists = existingCats.some((c) => c.id === newProject.category);
      const updatedCats = catExists
        ? existingCats
        : [
            ...existingCats,
            { id: newProject.category, label: newProject.categoryLabel },
          ];

      const updated = {
        ...prev,
        categories: updatedCats,
        customTools: combinedTools,
        projects: [newProject, ...prev.projects.filter((p) => p.id !== newProject.id)],
      };
      saveDesignerProfile(updated);
      return updated;
    });

    if (searchQuery.trim()) {
      setSearchQuery("");
    }
    if (selectedCategory !== "all" && selectedCategory !== newProject.category) {
      setSelectedCategory("all");
    }

    try {
      const targetUid = user?.uid;
      await saveLinkToFirestore(newProject, targetUid);
      await fetchAndApplyLinks(targetUid, true);
      showToast("새 링크가 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("Firestore 저장 실패:", error);
      showToast("저장 중 문제가 발생했습니다.");
      setIsUpdating(false);
    }
  };

  const handleCardClick = (project: ProjectItem) => {
    // 0. 프리뷰 모드일 경우: 본인 프리뷰이므로 클릭수 집계 제외 + ?from=preview 파라미터로 상세 이동
    if (isPreview) {
      router.push(`/projects/${project.id}?from=preview`);
      return;
    }

    // 1. 소유자 본인의 클릭인지 확인 (로그인된 본인 클릭은 집계 제외)
    const isOwnerOrSelf = Boolean(
      isOwner || (user && resolvedOwnerUid && user.uid === resolvedOwnerUid)
    );

    // 본인이 아닌 방문자일 때만 프로젝트 클릭 카운트 증가 트래킹
    if (!isOwnerOrSelf) {
      trackProjectClick(project.id, resolvedOwnerUid || undefined);
    }

    // 2. 프로젝트 상세 페이지 이동 (소유자 식별자 쿼리 파라미터 전달)
    const query = new URLSearchParams();
    if (effectiveIdentifier) {
      query.set("u", effectiveIdentifier);
    } else if (resolvedOwnerUid) {
      query.set("owner", resolvedOwnerUid);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    router.push(`/projects/${project.id}${queryString}`);
  };

  const handleUpdateTools = async (newTools: ToolProficiency[]) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        toolProficiencies: newTools,
      };
      saveDesignerProfile(updated);
      return updated;
    });

    try {
      await saveToolsToFirestore(newTools, user?.uid);
    } catch (err) {
      console.warn("Firestore 도구 동기화 실패:", err);
    }
    showToast("도구 숙련도가 저장되었습니다.");
  };

  const handleUpdateCareers = async (newCareers: CareerItem[]) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        careers: newCareers,
      };
      saveDesignerProfile(updated);
      return updated;
    });

    try {
      await saveCareersToFirestore(newCareers, user?.uid);
    } catch (err) {
      console.warn("Firestore 경력 동기화 실패:", err);
    }
    showToast("경력 활동이 저장되었습니다.");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === "project") {
        const projectId = deleteTarget.data.id;
        try {
          await deleteLinkFromFirestore(projectId, user?.uid);
          await fetchAndApplyLinks(user?.uid, true);
        } catch (err) {
          console.warn("Firestore 프로젝트 삭제 에러:", err);
        }
        setProfile((prev) => {
          const updated = {
            ...prev,
            projects: prev.projects.filter((p) => p.id !== projectId),
          };
          saveDesignerProfile(updated);
          return updated;
        });
        showToast("프로젝트가 삭제되었습니다.");
      } else if (deleteTarget.type === "tool") {
        const targetToolName = deleteTarget.data.name;
        const updatedTools = profile.toolProficiencies.filter(
          (t) => t.name !== targetToolName
        );
        setProfile((prev) => {
          const updated = {
            ...prev,
            toolProficiencies: updatedTools,
          };
          saveDesignerProfile(updated);
          return updated;
        });
        try {
          await saveToolsToFirestore(updatedTools, user?.uid);
        } catch (err) {
          console.warn("Firestore 도구 삭제 동기화 에러:", err);
        }
        showToast(`'${targetToolName}' 도구가 삭제되었습니다.`);
      } else if (deleteTarget.type === "career") {
        const targetCareerId = deleteTarget.data.id;
        const updatedCareers = profile.careers.filter(
          (c) => c.id !== targetCareerId
        );
        setProfile((prev) => {
          const updated = {
            ...prev,
            careers: updatedCareers,
          };
          saveDesignerProfile(updated);
          return updated;
        });
        try {
          await saveCareersToFirestore(updatedCareers, user?.uid);
        } catch (err) {
          console.warn("Firestore 경력 삭제 동기화 에러:", err);
        }
        showToast("경력 항목이 삭제되었습니다.");
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredProjects = useMemo(() => {
    let list = profile.projects;

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tools.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [profile.projects, selectedCategory, searchQuery]);

  // 반응형 컨테이너 클래스 (웹 데스크톱에서도 680px 고정 프레임, radius 0)
  const containerClasses =
    "w-full max-w-[680px] my-0 sm:my-6 rounded-none border-0 sm:border border-[#E5E8EB] shadow-none bg-white flex flex-col pb-16 transition-all duration-300";

  if (isNotFound) {
    notFound();
  }

  // 동적 라우팅 된 공개 페이지나 프리뷰 화면에서는 클릭 수를 숨기고, 본인 관리 보드에서만 노출
  const showProjectClickCount = !isDynamicRoute && !isPreview && isOwner;

  // 헤더 노출 여부: 프리뷰 화면이거나, 비공개 관리 화면이거나, 소유자가 '?from=mypage'로 진입한 경우
  const shouldShowHeader = isPreview || !isPublicView || (fromMypage && isOwner);

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] text-[#191F28] flex flex-col items-center">
      {/* 갱신/업데이트 진행 중 플로팅 인디케이터 */}
      {isUpdating && (
        <aside
          aria-live="polite"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#191F28] text-white px-3.5 py-1.5 rounded-full border border-[#333D4B] shadow-none text-xs animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>저장 중...</span>
        </aside>
      )}

      {/* 모바일/웹 뷰포트 컨테이너 (웹 데스크톱에서도 태블릿 사이즈 680px 고정 프레임) */}
      <main className={containerClasses}>
        {/* 1. 상단 네비게이션 헤더 (프리뷰 모드이거나 소유자 관리 화면일 때 노출) */}
        {shouldShowHeader && (
          <TopNavHeader
            onShareClick={() => setIsShareModalOpen(true)}
            showToast={showToast}
            isPublicView={isPublicView}
            ownerName={profile.name}
            isOwner={isOwner}
            hideProfileMenu={isPreview ? false : (fromMypage ? false : (hideHeaderProfileMenu || isDynamicRoute))}
            isPreview={isPreview}
          />
        )}

        {/* 2. 프로필 상단 영역 (타인 열람 시 프로필 이미지 더 크게 표시) */}
        <ProfileHeader
          profile={profile}
          onResumeDownload={handleResumeDownload}
          isPublicView={isPublicView}
        />

        {/* 3. 검색 바 & 그리드/리스트 토글, 작업물 카테고리 뱃지 목록 (링크 아이콘 아래 충분한 여백 확보) */}
        <section className="px-4 sm:px-6 pt-7 sm:pt-9 pb-2 w-full space-y-3">
          {/* 1행: [검색바] [페이지 그리드 변경 토글] */}
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B95A1] pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="프로젝트, 기술 검색"
                className="pl-8.5 pr-10 h-8.5 bg-white border-[#E5E8EB] focus:border-[#191F28] rounded-xl text-xs w-full shadow-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#8B95A1] hover:text-[#191F28] cursor-pointer"
                >
                  지우기
                </button>
              )}
            </div>

            {/* 그리드/리스트 뷰 토글 (shrink-0으로 안전하게 고정) */}
            <div className="flex items-center shrink-0 rounded-xl bg-white border border-[#E5E8EB] p-0.5 shadow-none">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="그리드 뷰로 보기"
                aria-label="그리드 뷰"
                className={cn(
                  "flex h-7.5 w-7.5 items-center justify-center rounded-lg transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-[#191F28] text-white shadow-none"
                    : "text-[#8B95A1] hover:text-[#191F28]"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="리스트 뷰로 보기"
                aria-label="리스트 뷰"
                className={cn(
                  "flex h-7.5 w-7.5 items-center justify-center rounded-lg transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-[#191F28] text-white shadow-none"
                    : "text-[#8B95A1] hover:text-[#191F28]"
                )}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2행: [작업물 카테고리 뱃지들 나열] + [링크 추가 버튼] (동일 라인 배치) */}
          <div className="flex items-center justify-between gap-2 w-full">
            {/* 좌측: 카테고리 뱃지 가로 스크롤 */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 py-1 scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[
                { id: "all", label: "All" },
                ...(profile.categories || DEFAULT_CATEGORIES),
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as ProjectCategory)}
                    className={cn(
                      "h-8 shrink-0 rounded-full px-3 text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap",
                      isActive
                        ? "bg-[#191F28] text-white shadow-none"
                        : "bg-white text-[#4E5968] border border-[#E5E8EB] hover:border-[#D1D6DB] hover:text-[#191F28]"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* 우측: 링크 추가 버튼 (본인 계정일 때 동일 라인 우측에 배치) */}
            {isOwner && (
              <Button
                onClick={handleOpenAddModal}
                size="sm"
                className="h-8 shrink-0 text-xs font-semibold gap-1.5 bg-[#191F28] hover:bg-[#333D4B] text-white rounded-xl px-3 transition-all cursor-pointer shadow-none whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>링크 추가</span>
              </Button>
            )}
          </div>
        </section>

        {/* 4. 프로젝트 쇼케이스 목록 (태블릿 규격 고정 2열 그리드) */}
        <section className="px-4 sm:px-6 py-2 flex-1 w-full">

          {isLoadingLinks ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-3"
                  : "flex flex-col gap-3"
              }
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-white rounded-xl p-3 border border-[#E5E8EB] animate-pulse space-y-2.5"
                >
                  <div className="w-full h-28 bg-[#F2F4F6] rounded-lg" />
                  <div className="h-4 bg-[#F2F4F6] rounded w-3/4" />
                  <div className="h-3 bg-[#F2F4F6] rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-3"
                  : "flex flex-col gap-3"
              }
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  onClick={handleCardClick}
                  isOwner={showProjectClickCount}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center rounded-2xl bg-[#FAFAFA] border border-dashed border-[#D1D6DB]">
              <p className="text-xs font-medium text-[#4E5968]">
                {searchQuery
                  ? `'${searchQuery}' 검색 결과가 없습니다`
                  : "등록된 작업물이 없습니다"}
              </p>
              {isOwner && (
                <Button
                  onClick={handleOpenAddModal}
                  className="mt-3.5 h-8 text-xs font-semibold bg-[#191F28] hover:bg-[#333D4B] text-white rounded-xl gap-1.5 px-3.5 shadow-none cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 작업물 등록</span>
                </Button>
              )}
            </div>
          )}
        </section>

        {/* 구분선 1: 프로젝트와 사용 도구 숙련도 사이 */}
        {((profile.toolProficiencies && profile.toolProficiencies.length > 0) || isOwner) && (
          <div className="px-4 sm:px-6 my-7">
            <div className="border-t border-[#E5E8EB]" />
          </div>
        )}

        {/* 5. 디자이너 사용 도구 숙련도 */}
        {((profile.toolProficiencies && profile.toolProficiencies.length > 0) || isOwner) && (
          <section className="px-4 sm:px-6 w-full">
            <ToolProficiencyBars
              tools={profile.toolProficiencies || []}
              onUpdateTools={isOwner ? handleUpdateTools : undefined}
              onRequestDelete={
                isOwner
                  ? (tool) => setDeleteTarget({ type: "tool", data: tool })
                  : undefined
              }
              isReadOnly={!isOwner}
            />
          </section>
        )}

        {/* 구분선 2: 사용 도구 숙련도와 경력 및 활동 사이 */}
        {((profile.careers && profile.careers.length > 0) || isOwner) && (
          <div className="px-4 sm:px-6 my-7">
            <div className="border-t border-[#E5E8EB]" />
          </div>
        )}

        {/* 6. 경력 및 활동 타임라인 블록 */}
        <section className="px-4 sm:px-6 w-full">
          <CareerTimeline
            careers={profile.careers || []}
            onUpdateCareers={isOwner ? handleUpdateCareers : undefined}
            onRequestDelete={
              isOwner
                ? (career) => setDeleteTarget({ type: "career", data: career })
                : undefined
            }
            isReadOnly={!isOwner}
          />

          {/* 경력 및 활동 하단: 내 페이지 만들러가기 텍스트 버튼 (그레이스케일 80의 약간 흐릿한 컬러) */}
          {(showCreateProjectButton ?? (isDynamicRoute || isPublicView)) && (
            <div className="pt-6 pb-2 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-xs sm:text-sm font-medium text-[#8B95A1] hover:text-[#4E5968] hover:underline underline-offset-4 transition-colors py-2 px-3 flex items-center gap-1 cursor-pointer"
              >
                내 페이지 만들러가기
              </button>
            </div>
          )}
        </section>

        {/* 9. 심플 미니멀 푸터 */}
        <footer className="mt-12 mb-4 flex flex-col items-center justify-center text-center px-4 select-none">
          <span className="text-xs font-bold text-[#0A192F] font-['Syne',sans-serif]">
            My Portfolio
          </span>
          <p className="mt-1 text-[11px] text-[#64748B]">
            All-in-One Portfolio Hub · 나만의 포폴 링크를 큐레이션하다
          </p>
        </footer>
      </main>

      {/* 새 작업물 링크 추가 다이얼로그 모달 */}
      {isOwner && (
        <AddLinkModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          availableCategories={profile.categories || DEFAULT_CATEGORIES}
          onAddCategory={handleAddCategory}
          savedTools={savedTools}
          onAdd={handleAddProject}
          isSubmitting={isUpdating}
        />
      )}

      {/* 포트폴리오 공유 모달 (누구나 접근 가능) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        handle={profile.handle}
        name={profile.name}
        onCopied={(msg) => showToast(msg)}
      />

      {/* 통합 항목 삭제 확인 모달 (본인 전용) */}
      {isOwner && (
        <DeleteConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => !isDeleting && setDeleteTarget(null)}
          project={deleteTarget?.type === "project" ? deleteTarget.data : null}
          itemName={
            deleteTarget?.type === "tool"
              ? `${deleteTarget.data.name} (${deleteTarget.data.level}%)`
              : deleteTarget?.type === "career"
              ? `${deleteTarget.data.title} · ${deleteTarget.data.organization}`
              : deleteTarget?.data?.title
          }
          itemCategory={
            deleteTarget?.type === "tool"
              ? "도구 숙련도"
              : deleteTarget?.type === "career"
              ? "경력 및 활동"
              : deleteTarget?.data?.categoryLabel
          }
          itemDescription={
            deleteTarget?.type === "tool"
              ? deleteTarget.data.experience || `숙련도 레벨 ${deleteTarget.data.level}%`
              : deleteTarget?.type === "career"
              ? deleteTarget.data.description || deleteTarget.data.period
              : deleteTarget?.data?.summary
          }
          onConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* 플로팅 토스트 알림 */}
      <Toast message={toastMessage} />
    </div>
  );
}
