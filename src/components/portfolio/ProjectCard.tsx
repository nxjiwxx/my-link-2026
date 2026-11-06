"use client";

import React from "react";
import { Users, User } from "lucide-react";
import { ProjectItem, ViewMode } from "@/types/portfolio";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: ProjectItem;
  viewMode: ViewMode;
  onClick: (project: ProjectItem) => void;
}

export function ProjectCard({ project, viewMode, onClick }: ProjectCardProps) {
  const isTeam = project.projectType === "team";

  // 표(그리드) 구조 (2~4열 타일 형태)
  if (viewMode === "grid") {
    return (
      <div
        onClick={() => onClick(project)}
        className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E5E8EB] bg-white hover:border-[#D1D6DB] transition-all duration-150 cursor-pointer select-none"
      >
        {/* 그리드 썸네일 (4:3 비율) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2F4F6]">
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-103"
          />
          {/* 상단 좌우 뱃지 (Auto layout: 겹침 방지 및 유동형 너비) */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1 pointer-events-none">
            <Badge
              variant="neutral"
              size="sm"
              className="bg-white/95 text-[#191F28] font-semibold text-[10px] shadow-2xs border border-[#E5E8EB] truncate max-w-[58%] pointer-events-auto"
            >
              {project.categoryLabel}
            </Badge>

            <Badge
              variant="neutral"
              size="sm"
              className="bg-white/95 text-[#4E5968] font-medium text-[10px] shadow-2xs border border-[#E5E8EB] flex items-center gap-1 shrink-0 pointer-events-auto"
            >
              {isTeam ? (
                <Users className="w-2.5 h-2.5 text-[#6B7684]" />
              ) : (
                <User className="w-2.5 h-2.5 text-[#6B7684]" />
              )}
              <span>{isTeam ? "팀" : "개인"}</span>
            </Badge>
          </div>
        </div>

        {/* 그리드 하단 정보 */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between min-w-0">
          <div className="min-w-0">
            <h3 className="text-xs sm:text-[14px] font-semibold text-[#191F28] transition-colors truncate leading-snug">
              {project.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#6B7684] line-clamp-2 mt-1 leading-relaxed break-words">
              {project.summary}
            </p>
          </div>

          {/* 하단 툴 정보 */}
          <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-[#F2F4F6] overflow-hidden flex-wrap">
            {project.tools.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] sm:text-[11px] font-medium text-[#4E5968] bg-[#F2F4F6] px-1.5 py-0.5 rounded truncate max-w-[70px] sm:max-w-[90px]"
              >
                {t}
              </span>
            ))}
            {project.tools.length > 2 && (
              <span className="text-[10px] sm:text-[11px] text-[#8B95A1] bg-[#F2F4F6] px-1.5 py-0.5 rounded shrink-0">
                +{project.tools.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 리스트 뷰 (1열 가로 카드)
  return (
    <div
      onClick={() => onClick(project)}
      className="group relative flex items-center overflow-hidden rounded-xl border border-[#E5E8EB] bg-white p-3 sm:p-4 gap-3 sm:gap-4 hover:border-[#D1D6DB] transition-all duration-150 cursor-pointer select-none"
    >
      {/* 썸네일 이미지 */}
      <div className="relative w-24 sm:w-36 md:w-44 shrink-0 aspect-[4/3] rounded-lg overflow-hidden bg-[#F2F4F6]">
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-103"
        />

        {/* 상단 우측: 팀/개인 작업 구분 뱃지 */}
        <div className="absolute top-1.5 right-1.5">
          <Badge
            variant="neutral"
            size="sm"
            className="bg-white/95 text-[#4E5968] font-medium text-[9px] sm:text-[10px] shadow-2xs border border-[#E5E8EB] flex items-center gap-1 py-0 px-1.5"
          >
            {isTeam ? (
              <Users className="w-2.5 h-2.5 text-[#6B7684]" />
            ) : (
              <User className="w-2.5 h-2.5 text-[#6B7684]" />
            )}
            <span>{isTeam ? "팀" : "개인"}</span>
          </Badge>
        </div>
      </div>

      {/* 이미지 오른쪽 텍스트 구조 */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div className="min-w-0">
          <div className="text-[11px] sm:text-xs font-semibold text-[#3182F6] leading-none mb-1">
            {project.categoryLabel}
          </div>
          <h3 className="text-xs sm:text-[15px] font-semibold text-[#191F28] leading-snug truncate">
            {project.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-[#6B7684] line-clamp-1 sm:line-clamp-2 mt-1 leading-normal break-words">
            {project.summary}
          </p>
        </div>

        {/* 프로젝트 사용 툴 */}
        <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-[#F2F4F6] overflow-hidden flex-wrap">
          {project.tools.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] sm:text-[11px] font-medium text-[#4E5968] bg-[#F2F4F6] px-1.5 py-0.5 rounded truncate max-w-[85px] sm:max-w-[120px]"
            >
              {t}
            </span>
          ))}
          {project.tools.length > 3 && (
            <span className="text-[10px] sm:text-[11px] text-[#8B95A1] bg-[#F2F4F6] px-1.5 py-0.5 rounded shrink-0">
              +{project.tools.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
