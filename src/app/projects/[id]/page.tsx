"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  User,
  Users,
  Wrench,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { ProjectItem, DEFAULT_CATEGORIES } from "@/types/portfolio";
import {
  getDesignerProfile,
  saveDesignerProfile,
} from "@/lib/portfolioStorage";
import {
  getLinksFromFirestore,
  updateLinkInFirestore,
  deleteLinkFromFirestore,
} from "@/lib/firestoreLinks";
import { findUserIdByUsername } from "@/lib/firestoreProfile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ProjectInlineEditCard } from "@/components/portfolio/ProjectInlineEditCard";
import { DeleteConfirmModal } from "@/components/portfolio/DeleteConfirmModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const queryUsername = searchParams.get("u") || "";
  const queryOwnerUid = searchParams.get("owner") || "";

  const [resolvedOwnerUid, setResolvedOwnerUid] = useState<string | null>(
    queryOwnerUid || null
  );

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(
    searchParams.get("edit") === "true"
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // 소유자 여부 판단
  const isOwner = Boolean(
    user && (resolvedOwnerUid ? user.uid === resolvedOwnerUid : true)
  );

  // 프로젝트 데이터 로드 (소유자 식별 및 Firestore 동기화)
  useEffect(() => {
    let isCancelled = false;

    async function loadProject() {
      // 1. 로컬스토리지 우선 확인
      const profile = getDesignerProfile();
      const foundLocal = profile.projects.find((p) => p.id === projectId);
      if (foundLocal && !isCancelled) {
        setProject(foundLocal);
      }

      // 2. 소유자 UID 식별 (쿼리 파라미터 u 또는 owner 기반)
      let ownerUid = queryOwnerUid;
      if (!ownerUid && queryUsername) {
        try {
          const match = await findUserIdByUsername(queryUsername);
          if (match?.uid) {
            ownerUid = match.uid;
            if (!isCancelled) {
              setResolvedOwnerUid(match.uid);
            }
          }
        } catch (err) {
          console.warn("사용자 이름 기반 소유자 조회 실패:", err);
        }
      }

      const effectiveUid = ownerUid || user?.uid;
      if (effectiveUid && !isCancelled) {
        setResolvedOwnerUid(effectiveUid);
      }

      // 3. Firestore에서 최신 정보 조회 시도
      try {
        const firestoreLinks = await getLinksFromFirestore(effectiveUid || undefined);
        const foundFs = firestoreLinks.find((p) => p.id === projectId);
        if (!isCancelled) {
          if (foundFs) {
            setProject(foundFs);
          } else if (!foundLocal) {
            setProject(null);
          }
        }
      } catch (err) {
        console.warn("Firestore에서 프로젝트 상세 로드 실패:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      isCancelled = true;
    };
  }, [projectId, user, queryOwnerUid, queryUsername]);

  // 수정 저장 핸들러
  const handleSave = async (updatedProject: ProjectItem, newTools: string[]) => {
    setIsSaving(true);
    try {
      // 1. UI 및 로컬 스토리지 업데이트
      const profile = getDesignerProfile();
      const projectTools = updatedProject.tools || [];
      const combinedTools = Array.from(
        new Set([...(profile.customTools || []), ...projectTools, ...newTools])
      ).filter(Boolean);

      const existingCats = profile.categories || DEFAULT_CATEGORIES;
      const catExists = existingCats.some((c) => c.id === updatedProject.category);
      const updatedCats = catExists
        ? existingCats
        : [
            ...existingCats,
            { id: updatedProject.category, label: updatedProject.categoryLabel },
          ];

      const updatedProjects = profile.projects.map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      );
      if (!profile.projects.some((p) => p.id === updatedProject.id)) {
        updatedProjects.unshift(updatedProject);
      }

      saveDesignerProfile({
        ...profile,
        categories: updatedCats,
        customTools: combinedTools,
        projects: updatedProjects,
      });

      // 2. 파이어베이스(Firestore users/{user.uid}/links) 업데이트
      await updateLinkInFirestore(updatedProject, user?.uid);

      setProject(updatedProject);
      setIsEditing(false);
      showToast("프로젝트가 성공적으로 수정되었어요! ✨");
    } catch (error) {
      console.error("프로젝트 수정 중 에러 발생:", error);
      showToast("저장 중 오류가 발생했으나 로컬에 저장되었습니다.");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  // 삭제 확정 핸들러
  const handleConfirmDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      // 1. Firestore 삭제 (users/{user.uid}/links)
      await deleteLinkFromFirestore(project.id, user?.uid);
    } catch (error) {
      console.warn("Firestore 삭제 에러:", error);
    }

    // 2. 로컬 스토리지 삭제
    const profile = getDesignerProfile();
    saveDesignerProfile({
      ...profile,
      projects: profile.projects.filter((p) => p.id !== project.id),
    });

    setIsDeleting(false);
    setIsDeleteModalOpen(false);

    // 메인 화면으로 이동
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F2F4F6] flex flex-col items-center">
        <main className="w-full max-w-[480px] min-h-screen bg-[#F9FAFB] flex flex-col border-x border-[#E5E8EB]/60 p-4">
          <div className="animate-pulse space-y-4 pt-12">
            <div className="h-6 bg-[#E5E8EB] rounded w-24 mb-6" />
            <div className="w-full aspect-[16/9] bg-[#E5E8EB] rounded-2xl" />
            <div className="h-6 bg-[#E5E8EB] rounded w-3/4" />
            <div className="h-4 bg-[#E5E8EB] rounded w-1/2" />
            <div className="h-20 bg-[#E5E8EB] rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen w-full bg-[#F2F4F6] flex flex-col items-center">
        <main className="w-full max-w-[480px] min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center border-x border-[#E5E8EB]/60 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F2F4F6] flex items-center justify-center text-[#8B95A1] mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#191F28] mb-1">
            프로젝트를 찾을 수 없습니다
          </h2>
          <p className="text-xs text-[#8B95A1] mb-5">
            삭제되었거나 올바르지 않은 프로젝트 주소입니다.
          </p>
          <Link href="/">
            <Button className="h-9 px-4 text-xs font-bold bg-[#191F28] hover:bg-[#333D4B] text-white rounded-xl">
              홈으로 돌아가기
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const isTeam = project.projectType === "team";

  const containerClasses =
    "w-full max-w-[680px] my-0 sm:my-6 rounded-none sm:rounded-2xl border-0 sm:border border-[#E5E8EB] shadow-none sm:shadow-sm bg-white flex flex-col pb-16 transition-all duration-300";

  const backHref = queryUsername
    ? `/@${queryUsername}`
    : queryOwnerUid
    ? `/?owner=${queryOwnerUid}`
    : "/";

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] text-[#191F28] flex flex-col items-center">
      <main className={containerClasses}>
        {/* 상단 네비게이션 헤더 */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#E5E8EB] flex items-center justify-between select-none">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4E5968] hover:text-[#191F28] transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-[#F2F4F6]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로</span>
          </Link>

          <span className="text-xs sm:text-sm font-bold text-[#191F28] max-w-[220px] truncate">
            {isEditing ? "프로젝트 수정" : project.title}
          </span>

          <div className="w-16" />
        </header>

        {/* 페이지 본문 영역 */}
        {isEditing ? (
          /* 인라인 편집 모드 (해당 페이지 내에서 직접 편집) */
          <div className="p-4 sm:p-6 flex-1">
            <ProjectInlineEditCard
              project={project}
              availableCategories={
                getDesignerProfile().categories || DEFAULT_CATEGORIES
              }
              savedTools={project.tools}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              isSaving={isSaving}
            />
          </div>
        ) : (
          /* 일반 상세 뷰 모드: 프레임 채움 이미지 & 미니멀 타이포그래피 */
          <div className="flex-1 flex flex-col">
            {/* 1. 프레임을 가득 채우는 대표 이미지 (카드 형식 탈피) */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] overflow-hidden bg-[#F2F4F6] border-b border-[#E5E8EB]">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 2. 카드 형식 대신 세련되고 정돈된 타이포그래피 콘텐츠 */}
            <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-6">
              {/* 카테고리 & 프로젝트 구분 뱃지 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#3182F6] bg-[#3182F6]/10 px-2.5 py-1 rounded-md">
                  {project.categoryLabel}
                </span>
                <span className="text-xs font-medium text-[#6B7684] bg-[#F2F4F6] px-2.5 py-1 rounded-md flex items-center gap-1">
                  {isTeam ? (
                    <Users className="w-3 h-3 text-[#3182F6]" />
                  ) : (
                    <User className="w-3 h-3 text-[#6B7684]" />
                  )}
                  <span>{project.projectTypeLabel}</span>
                </span>
              </div>

              {/* 프로젝트 제목과 한 줄 소개 (카드 테두리 없는 깔끔한 디자인) */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191F28] tracking-tight leading-snug">
                  {project.title}
                </h1>
                <p className="text-sm sm:text-base text-[#4E5968] leading-relaxed break-keep font-normal">
                  {project.summary}
                </p>
              </div>

              {/* 메타데이터 (기간, 역할, 도구) - 박스형 카드 대신 깔끔한 미니멀 사양 바 */}
              <div className="py-4 border-y border-[#E5E8EB] grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-[11px] font-semibold text-[#8B95A1] mb-1">
                    작업 기간
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#191F28] font-mono">
                    {project.period || "2026"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#8B95A1] mb-1">
                    담당 역할
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#191F28]">
                    {project.role || "Creator"}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-[11px] font-semibold text-[#8B95A1] mb-1">
                    사용 도구
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tools && project.tools.length > 0 ? (
                      project.tools.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center text-[11px] font-medium text-[#4E5968] bg-[#F2F4F6] px-2 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#8B95A1]">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 프로젝트 상세 설명 */}
              {project.description && (
                <div className="space-y-2 pt-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B95A1]">
                    상세 설명
                  </h2>
                  <div className="text-sm sm:text-[15px] text-[#333D4B] leading-relaxed whitespace-pre-line break-words">
                    {project.description}
                  </div>
                </div>
              )}

              {/* 외부 원본 링크 이동 버튼 (외부 링크 클릭 시 카운트 미포함) */}
              {project.externalLink?.url && (
                <div className="pt-2">
                  <a
                    href={project.externalLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full h-11 sm:h-12 rounded-xl bg-[#191F28] hover:bg-[#333D4B] text-white font-semibold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                      <span>{project.externalLink.label || "외부 링크 바로가기"}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              )}

              {/* 하단 보조 액션 버튼 바 (페이지 주인만 노출) */}
              {isOwner && (
                <div className="pt-6 pb-2 flex items-center justify-center gap-3 border-t border-[#F2F4F6]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#4E5968] hover:text-[#191F28] py-1.5 px-3 rounded-lg hover:bg-[#F2F4F6] transition-colors cursor-pointer font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>이 작업물 수정하기</span>
                  </button>
                  <span className="text-[#E5E8EB]">|</span>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#8B95A1] hover:text-[#EF4444] py-1.5 px-3 rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>이 작업물 삭제하기</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 삭제 확인 모달 (요청된 스펙 적용) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        project={project}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* TDS 플로팅 토스트 알림 */}
      <Toast message={toastMessage} />
    </div>
  );
}
