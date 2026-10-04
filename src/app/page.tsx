"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Sparkles, RefreshCw, Layers, Plus } from "lucide-react";
import {
  DesignerProfileData,
  ProjectCategory,
  ViewMode,
  ProjectItem,
  CategoryItem,
  DEFAULT_CATEGORIES,
} from "@/types/portfolio";
import {
  getDesignerProfile,
  resetDesignerProfile,
  saveDesignerProfile,
  INITIAL_DESIGNER_PROFILE,
} from "@/lib/portfolioStorage";
import { ProfileHeader } from "@/components/portfolio/ProfileHeader";
import { FilterAndToggleBar } from "@/components/portfolio/FilterAndToggleBar";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ToolProficiencyBars } from "@/components/portfolio/ToolProficiencyBars";
import { ProjectDetailModal } from "@/components/portfolio/ProjectDetailModal";
import { AddLinkModal } from "@/components/portfolio/AddLinkModal";
import { CareerTimeline } from "@/components/portfolio/CareerTimeline";
import { ShareModal } from "@/components/profile/ShareModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";

export default function DesignerPortfolioPage() {
  const [profile, setProfile] = useState<DesignerProfileData>(
    INITIAL_DESIGNER_PROFILE
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 로컬스토리지에서 디자이너 프로필 데이터 로드
  useEffect(() => {
    setIsMounted(true);
    const data = getDesignerProfile();
    setProfile(data);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleResetData = () => {
    const data = resetDesignerProfile();
    setProfile(data);
    showToast("기본 포트폴리오 데이터로 초기화되었어요");
  };

  const handleResumeDownload = () => {
    if (profile.resumePdfUrl) {
      window.open(profile.resumePdfUrl, "_blank", "noopener,noreferrer");
      showToast("이력서 PDF 다운로드를 시작합니다");
    } else {
      showToast("등록된 이력서 파일이 없습니다");
    }
  };

  // 이전에 사용했던 도구 목록 (프로젝트 도구 및 유저 등록 도구 통합)
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
    showToast(`'${newCategory.label}' 카테고리가 추가되었어요`);
  };

  const handleAddProject = (newProject: ProjectItem, newTools: string[]) => {
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
        projects: [newProject, ...prev.projects],
      };
      saveDesignerProfile(updated);
      return updated;
    });

    // 추가된 프로젝트가 바로 노출되도록 필터 및 검색어 조정
    if (searchQuery.trim()) {
      setSearchQuery("");
    }
    if (selectedCategory !== "all" && selectedCategory !== newProject.category) {
      setSelectedCategory("all");
    }

    showToast("새 작업물 링크가 성공적으로 추가되었어요!");
  };

  const handleDeleteProject = (projectId: string) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        projects: prev.projects.filter((p) => p.id !== projectId),
      };
      saveDesignerProfile(updated);
      return updated;
    });
    showToast("작업물이 삭제되었어요");
  };

  // 프로젝트 필터링 및 검색 로직
  const filteredProjects = useMemo(() => {
    let list = profile.projects;

    // 카테고리 필터
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tools.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [profile.projects, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen w-full bg-[#F2F4F6] text-[#191F28] flex flex-col items-center">
      {/* 모바일 & 데스크톱 반응형 뷰어 컨테이너 (최대 너비 480px) */}
      <main className="w-full max-w-[480px] min-h-screen bg-[#F9FAFB] flex flex-col shadow-xs border-x border-[#E5E8EB]/60 pb-16">
        {/* 1. 디자이너 프로필 헤더 (아바타, 직함, 공식 로고 버튼 바, 이력서 CTA) */}
        <ProfileHeader
          profile={profile}
          onShareClick={() => setIsShareModalOpen(true)}
          onResumeDownload={handleResumeDownload}
        />

        {/* 2. 프로젝트 카테고리 필터 & 뷰 모드 토글 바 (그리드 ⊞ ↔ 리스트 ☰) */}
        <section className="mt-1 sticky top-0 z-20 bg-[#F9FAFB]/95 backdrop-blur-xs">
          <FilterAndToggleBar
            categories={profile.categories || DEFAULT_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
          />
        </section>

        {/* 3. 빠른 프로젝트 검색창 */}
        <section className="px-4 mt-3 mb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-[#8B95A1] pointer-events-none z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트명, 사용 툴(Figma, Blender 등) 검색"
              className="pl-9 pr-14 h-10 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-xs text-[#8B95A1] hover:text-[#191F28] z-10"
              >
                지우기
              </button>
            )}
          </div>
        </section>

        {/* 4. 프로젝트 쇼케이스 목록 (그리드 2열 ↔ 리스트 1열) */}
        <section className="px-4 py-2 flex-1">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#191F28]">
              <Layers className="w-3.5 h-3.5 text-[#3182F6]" />
              <span>선별 작업물</span>
              <span className="text-[#3182F6] font-mono">
                ({filteredProjects.length})
              </span>
            </div>

            {/* 링크 추가 버튼 */}
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="outline"
              size="sm"
              className="h-7 text-xs font-semibold gap-1 text-[#3182F6] border-[#3182F6]/30 hover:bg-[#E8F3FF] rounded-lg px-2.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>링크 추가</span>
            </Button>
          </div>

          {filteredProjects.length > 0 ? (
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
                  onClick={(p) => setSelectedProject(p)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center select-none">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F6] text-[#8B95A1] mb-2.5">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#191F28]">
                {profile.projects.length === 0
                  ? "등록된 작업물이 없어요"
                  : "조건에 맞는 프로젝트가 없어요"}
              </p>
              <p className="text-xs text-[#8B95A1] mt-1">
                {profile.projects.length === 0
                  ? "새로운 작업물이나 외부 링크를 추가해보세요."
                  : "다른 검색어를 입력하거나 카테고리 필터를 변경해보세요."}
              </p>
              {profile.projects.length === 0 ? (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3.5 h-9 text-xs font-bold bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-xl gap-1.5 px-4 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>첫 번째 링크 추가하기</span>
                </Button>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-3.5 text-xs font-semibold text-[#3182F6] hover:underline"
                >
                  전체 프로젝트 다시보기
                </button>
              )}
            </div>
          )}
        </section>

        {/* 5. 디자이너 사용 도구 숙련도 프로그레스 바 (프로젝트 카드와 경력 카드 사이 위치) */}
        {profile.toolProficiencies && profile.toolProficiencies.length > 0 && (
          <section className="px-4 mt-6">
            <ToolProficiencyBars tools={profile.toolProficiencies} />
          </section>
        )}

        {/* 6. 경력 및 활동 타임라인 블록 */}
        <section className="px-4 mt-4">
          <CareerTimeline careers={profile.careers} />
        </section>

        {/* 7. 데이터 초기화 버튼 */}
        {isMounted && (
          <div className="mt-8 px-4 flex justify-center">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] text-[#8B95A1] hover:text-[#4E5968] rounded-full hover:bg-white/80 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>기본 포트폴리오 데이터 새로고침</span>
            </button>
          </div>
        )}

        {/* 8. TDS 푸터: Made with MyLink 바이럴 뱃지 */}
        <footer className="mt-6 mb-4 flex flex-col items-center justify-center text-center px-4 select-none">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E8EB] text-xs font-semibold text-[#4E5968] hover:text-[#191F28] hover:border-[#D1D6DB] transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3182F6]" />
            <span>
              Made with <strong className="font-bold text-[#191F28]">MyLink</strong>
            </span>
          </a>
          <p className="mt-2 text-[11px] text-[#B0B8C1]">
            디자이너를 위한 올인원 포트폴리오 아카이빙 서비스
          </p>
        </footer>
      </main>

      {/* 새 작업물 링크 추가 다이얼로그 모달 */}
      <AddLinkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        availableCategories={profile.categories || DEFAULT_CATEGORIES}
        onAddCategory={handleAddCategory}
        savedTools={savedTools}
        onAdd={handleAddProject}
      />

      {/* 프로젝트 상세 하이브리드 모달 */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        onDelete={handleDeleteProject}
      />

      {/* 포트폴리오 공유 모달 */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        handle={profile.handle}
        name={profile.name}
        onCopied={(msg) => showToast(msg)}
      />

      {/* TDS 플로팅 토스트 알림 */}
      <Toast message={toastMessage} />
    </div>
  );
}
