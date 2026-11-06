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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ProjectInlineEditCard } from "@/components/portfolio/ProjectInlineEditCard";
import { DeleteConfirmModal } from "@/components/portfolio/DeleteConfirmModal";
import { DeviceViewportBar, DeviceMode } from "@/components/common/DeviceViewportBar";
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

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(
    searchParams.get("edit") === "true"
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // 프로젝트 데이터 로드 (로컬스토리지 우선 로드 후 Firestore 동기화)
  useEffect(() => {
    const profile = getDesignerProfile();
    const foundLocal = profile.projects.find((p) => p.id === projectId);
    if (foundLocal) {
      setProject(foundLocal);
      setIsLoading(false);
    }

    // Firestore에서 최신 정보 조회 시도 (users/{user.uid}/links)
    getLinksFromFirestore(user?.uid)
      .then((firestoreLinks) => {
        const foundFs = firestoreLinks.find((p) => p.id === projectId);
        if (foundFs) {
          setProject(foundFs);
        } else if (!foundLocal) {
          setProject(null);
        }
      })
      .catch((err) => {
        console.warn("Firestore에서 프로젝트 상세 로드 실패:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectId, user]);

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
            <span>목록으로</span>
          </Link>

          <span className="text-xs sm:text-sm font-bold text-[#191F28] max-w-[220px] truncate">
            {isEditing ? "프로젝트 수정" : project.title}
          </span>

          <div className="w-16" />
        </header>

        {/* 페이지 본문 영역 */}
        <div className="p-4 sm:p-6 flex-1">
          {isEditing ? (
            /* 인라인 편집 모드 (해당 페이지 내에서 직접 편집) */
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
          ) : (
            /* 일반 상세 뷰 모드: Linear/Notion 스타일 */
            <div className="space-y-4">
              {/* 대표 썸네일 이미지 */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#E5E8EB] bg-[#F2F4F6] shadow-xs">
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 뱃지 및 메타 태그 */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="neutral"
                  className="bg-[#F2F4F6] text-[#191F28] border border-[#E5E8EB] text-xs font-semibold px-2.5 py-1"
                >
                  {project.categoryLabel}
                </Badge>
                <Badge
                  variant="neutral"
                  className="bg-[#F2F4F6] text-[#4E5968] border border-[#E5E8EB] text-xs font-medium px-2.5 py-1 flex items-center gap-1"
                >
                  {isTeam ? (
                    <Users className="w-3 h-3 text-[#6B7684]" />
                  ) : (
                    <User className="w-3 h-3 text-[#6B7684]" />
                  )}
                  <span>{project.projectTypeLabel}</span>
                </Badge>
              </div>

              {/* 제목 및 한 줄 요약 */}
              <div className="bg-white rounded-2xl border border-[#E5E8EB] p-4 sm:p-5 space-y-1.5 shadow-2xs">
                <h1 className="text-lg sm:text-xl font-bold text-[#191F28] leading-tight">
                  {project.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#4E5968] leading-relaxed break-words">
                  {project.summary}
                </p>
              </div>

              {/* 기간 및 담당 역할 카드 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white rounded-xl border border-[#E5E8EB] p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7684] mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#6B7684]" />
                    <span>작업 기간</span>
                  </div>
                  <div className="text-xs font-semibold text-[#191F28] truncate font-mono">
                    {project.period || "2026"}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E8EB] p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7684] mb-1">
                    <User className="w-3.5 h-3.5 text-[#6B7684]" />
                    <span>담당 역할</span>
                  </div>
                  <div className="text-xs font-semibold text-[#191F28] truncate">
                    {project.role || "Creator"}
                  </div>
                </div>
              </div>

              {/* 사용 도구 목록 */}
              <div className="bg-white rounded-2xl border border-[#E5E8EB] p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#191F28] mb-2.5">
                  <Wrench className="w-3.5 h-3.5 text-[#4E5968]" />
                  <span>사용 도구 (Tools)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.tools.map((t) => (
                    <Badge
                      key={t}
                      variant="neutral"
                      className="bg-[#F2F4F6] text-[#191F28] font-medium text-xs px-2.5 py-1 border border-[#E5E8EB]"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 상세 설명 */}
              <div className="bg-white rounded-2xl border border-[#E5E8EB] p-4 sm:p-5 shadow-2xs space-y-2">
                <div className="text-xs font-bold text-[#191F28]">
                  프로젝트 상세 설명
                </div>
                <div className="text-xs sm:text-sm text-[#4E5968] leading-relaxed whitespace-pre-line break-words">
                  {project.description || project.summary}
                </div>
              </div>

              {/* 외부 원본 링크 이동 버튼 */}
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

              {/* 하단 보조 액션 버튼 바 */}
              <div className="pt-4 flex items-center justify-center gap-3 border-t border-[#F2F4F6]">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#4E5968] hover:text-[#191F28] py-1.5 px-3 rounded-lg hover:bg-[#F2F4F6] transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>이 작업물 수정하기</span>
                </button>
                <span className="text-[#E5E8EB]">|</span>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8B95A1] hover:text-[#EF4444] py-1.5 px-3 rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>이 작업물 삭제하기</span>
                </button>
              </div>
            </div>
          )}
        </div>
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
