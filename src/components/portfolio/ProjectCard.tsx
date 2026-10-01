"use client";

import React from "react";
import { ArrowUpRight, Users, User } from "lucide-react";
import { ProjectItem, ViewMode } from "@/types/portfolio";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectItem;
  viewMode: ViewMode;
  onClick: (project: ProjectItem) => void;
}

export function ProjectCard({ project, viewMode, onClick }: ProjectCardProps) {
  const isTeam = project.projectType === "team";

  if (viewMode === "grid") {
    return (
      <div
        onClick={() => onClick(project)}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E8EB] bg-white tds-shadow-card tds-press-scale hover:border-[#D1D6DB] transition-all duration-200 cursor-pointer select-none"
      >
        {/* 그리드 썸네일 (4:3 비율) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2F4F6]">
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* 상단 좌측: 카테고리 뱃지 */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <Badge
              variant="neutral"
              size="sm"
              className="bg-white/90 backdrop-blur-xs text-[#191F28] font-bold text-[10px] shadow-2xs border border-[#E5E8EB]/80"
            >
              {project.categoryLabel}
            </Badge>
          </div>

          {/* 상단 우측: 팀/개인 프로젝트 구분 뱃지 */}
          <div className="absolute top-2 right-2">
            <Badge
              variant="neutral"
              size="sm"
              className={cn(
                "backdrop-blur-xs text-[10px] font-bold shadow-2xs flex items-center gap-1 border",
                isTeam
                  ? "bg-[#E8F3FF]/95 text-[#3182F6] border-[#3182F6]/30"
                  : "bg-white/90 text-[#4E5968] border-[#E5E8EB]/80"
              )}
            >
              {isTeam ? (
                <Users className="w-2.5 h-2.5" />
              ) : (
                <User className="w-2.5 h-2.5" />
              )}
              <span>{isTeam ? "팀" : "개인"}</span>
            </Badge>
          </div>
        </div>

        {/* 그리드 하단 정보 */}
        <div className="p-3 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-xs sm:text-[13px] font-bold text-[#191F28] group-hover:text-[#3182F6] transition-colors line-clamp-1 leading-snug">
              {project.title}
            </h3>
            <p className="text-[11px] text-[#4E5968] line-clamp-2 mt-1 leading-relaxed">
              {project.summary}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F2F4F6]">
            <div className="flex items-center gap-1 flex-wrap">
              {project.tools.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-medium text-[#8B95A1] bg-[#F2F4F6] px-1.5 py-0.5 rounded"
                >
                  {t}
                </span>
              ))}
            </div>

            <span className="text-[10px] text-[#8B95A1] font-mono">
              {project.projectTypeLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 리스트 뷰 (1열 와이드 카드)
  return (
    <div
      onClick={() => onClick(project)}
      className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-[#E5E8EB] bg-white tds-shadow-card tds-press-scale hover:border-[#D1D6DB] transition-all duration-200 cursor-pointer select-none"
    >
      {/* 리스트 썸네일 (16:9 와이드) */}
      <div className="relative w-full sm:w-44 shrink-0 aspect-[16/9] sm:aspect-auto overflow-hidden bg-[#F2F4F6]">
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5 sm:hidden flex items-center gap-1">
          <Badge
            variant="neutral"
            size="sm"
            className="bg-white/90 backdrop-blur-xs text-[#191F28] font-bold text-[10px] shadow-2xs border border-[#E5E8EB]/80"
          >
            {project.categoryLabel}
          </Badge>
          <Badge
            variant="neutral"
            size="sm"
            className={cn(
              "backdrop-blur-xs text-[10px] font-bold shadow-2xs border",
              isTeam
                ? "bg-[#E8F3FF]/95 text-[#3182F6] border-[#3182F6]/30"
                : "bg-white/90 text-[#4E5968] border-[#E5E8EB]/80"
            )}
          >
            {project.projectTypeLabel}
          </Badge>
        </div>
      </div>

      {/* 리스트 콘텐츠 정보 */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-[11px] font-bold text-[#3182F6]">
                {project.categoryLabel}
              </span>
              <span className="hidden sm:inline-block text-[#E5E8EB]">·</span>
              <span
                className={cn(
                  "hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold",
                  isTeam ? "text-[#3182F6]" : "text-[#4E5968]"
                )}
              >
                {isTeam ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {project.projectTypeLabel}
              </span>
            </div>
            <span className="text-[11px] text-[#8B95A1] font-mono">
              {project.period}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-[#191F28] group-hover:text-[#3182F6] transition-colors leading-snug">
            {project.title}
          </h3>

          <p className="text-xs text-[#4E5968] leading-relaxed mt-1 line-clamp-2">
            {project.summary}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F2F4F6]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.tools.map((t) => (
              <span
                key={t}
                className="text-[10px] font-semibold text-[#4E5968] bg-[#F2F4F6] px-2 py-0.5 rounded-md"
              >
                {t}
              </span>
            ))}
          </div>

          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#3182F6] group-hover:translate-x-0.5 transition-transform">
            상세보기
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
