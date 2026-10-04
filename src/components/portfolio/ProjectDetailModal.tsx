"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  ArrowUpRight,
  Clock,
  Award,
  Layers,
  ChevronDown,
  Users,
  User,
  Trash2,
} from "lucide-react";
import { ProjectItem } from "@/types/portfolio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onDelete,
}: ProjectDetailModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 스크롤 가능 여부 및 스크롤 진행률 계산
  const checkScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll > 15) {
      setCanScrollDown(scrollTop < maxScroll - 10);
      setScrollProgress(Math.min(100, Math.round((scrollTop / maxScroll) * 100)));
    } else {
      setCanScrollDown(false);
      setScrollProgress(100);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // 다이얼로그 열릴 때 스크롤 초기화 및 체크
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
        checkScrollState();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, project]);

  if (!project) return null;

  const isTeam = project.projectType === "team";

  const handleScrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 220, behavior: "smooth" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-[24px] p-0 border border-[#E5E8EB] bg-white shadow-2xl overflow-hidden">
        {/* 상단 미세 스크롤 진행률 바 (스크롤바 대신 읽은 위치를 시각화) */}
        <div className="absolute top-0 left-0 right-0 h-1 z-30 bg-[#F2F4F6]">
          <div
            className="h-full bg-[#3182F6] transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* 메인 스크롤 컨테이너: 브라우저 기본 스크롤바 완전 숨김 */}
        <div
          ref={scrollRef}
          onScroll={checkScrollState}
          className="max-h-[85vh] overflow-y-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* 모달 상단 대표 이미지 */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F2F4F6]">
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="h-full w-full object-cover"
            />
            {/* 좌측 상단 카테고리 뱃지 */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <Badge variant="primary" className="bg-[#3182F6] text-white shadow-xs">
                {project.categoryLabel}
              </Badge>
              {/* 팀 / 개인 프로젝트 구분 뱃지 */}
              <Badge
                variant="neutral"
                className="bg-black/60 backdrop-blur-md text-white border-0 shadow-xs flex items-center gap-1 text-[11px]"
              >
                {isTeam ? (
                  <Users className="w-3 h-3 text-[#3182F6]" />
                ) : (
                  <User className="w-3 h-3 text-[#EAFBF2]" />
                )}
                <span>{project.projectTypeLabel}</span>
              </Badge>
            </div>
          </div>

          {/* 모달 본문 콘텐츠 */}
          <div className="p-6 pt-4 space-y-4 pb-14">
            <DialogHeader className="text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#3182F6]">
                  {project.categoryLabel}
                </span>
                <span className="text-[#E5E8EB]">·</span>
                <span className="text-xs font-semibold text-[#4E5968] flex items-center gap-1">
                  {isTeam ? (
                    <Users className="w-3 h-3 text-[#3182F6]" />
                  ) : (
                    <User className="w-3 h-3 text-[#8B95A1]" />
                  )}
                  {project.projectTypeLabel}
                </span>
              </div>

              <DialogTitle className="text-xl font-bold text-[#191F28] leading-snug">
                {project.title}
              </DialogTitle>
              <p className="text-xs text-[#4E5968] leading-relaxed">
                {project.summary}
              </p>
            </DialogHeader>

            {/* 메타데이터 칩스 (기간, 역할 및 기여도) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F2F4F6]">
              <div className="flex items-center gap-1.5 rounded-lg bg-[#F2F4F6] px-2.5 py-1 text-xs text-[#4E5968]">
                <Clock className="w-3.5 h-3.5 text-[#8B95A1]" />
                <span className="font-mono">{project.period}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-[#E8F3FF] px-2.5 py-1 text-xs font-semibold text-[#3182F6]">
                <Award className="w-3.5 h-3.5" />
                <span>{project.role}</span>
              </div>
            </div>

            {/* 프로젝트 상세 배경 및 해결 과정 */}
            <div className="rounded-xl bg-[#F9FAFB] p-4 border border-[#E5E8EB]">
              <h4 className="text-xs font-bold text-[#191F28] mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#3182F6]" />
                디자인 배경 및 해결 과정
              </h4>
              <p className="text-xs text-[#4E5968] leading-relaxed break-keep whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* 서브 상세 이미지 목업 */}
            {project.detailImages && project.detailImages.length > 1 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[#8B95A1]">
                  프로젝트 목업 뷰 (Visual Mockups)
                </div>
                <div className="rounded-xl overflow-hidden border border-[#E5E8EB] aspect-[16/9]">
                  <img
                    src={project.detailImages[1]}
                    alt="상세 목업"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* 사용 도구 태그 */}
            <div>
              <div className="text-[11px] font-semibold text-[#8B95A1] mb-2">
                사용 도구 (Tools)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tools.map((tool) => (
                  <Badge
                    key={tool}
                    variant="neutral"
                    className="bg-[#F2F4F6] text-[#191F28] font-medium"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 하단 외부 원본 링크 액션 */}
            {project.externalLink && (
              <div className="pt-2">
                <a
                  href={project.externalLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full h-12 rounded-xl bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-xs sm:text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-xs">
                    <span>{project.externalLink.label}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            )}

            {/* 삭제 버튼 (로컬 상태 관리) */}
            {onDelete && (
              <div className="pt-1 pb-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`'${project.title}' 작업물을 삭제하시겠습니까?`)) {
                      onDelete(project.id);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8B95A1] hover:text-[#E8344E] transition-colors py-1 px-3 rounded-lg hover:bg-[#FEECEF]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>이 작업물 삭제하기</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 스크롤바 없는 환경을 위한 하단 그라디언트 페이드 및 인디케이터 */}
        {canScrollDown && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-2 z-20">
            <button
              type="button"
              onClick={handleScrollDown}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#191F28]/85 text-white text-[10px] font-semibold backdrop-blur-md shadow-md hover:bg-[#191F28] transition-all animate-bounce"
            >
              <span>아래로 스크롤하여 더 보기</span>
              <ChevronDown className="w-3 h-3 text-[#3182F6]" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
