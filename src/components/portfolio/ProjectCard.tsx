"use client";

import React from "react";
import { Users, User } from "lucide-react";
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

  // 표(그리드) 구조 (2열 타일 형태)
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

          {/* 상단 우측: 팀/개인 프로젝트 구분 뱃지 (단독 노출) */}
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

          {/* 하단 툴 정보 (팀/개인 중복 텍스트 삭제 및 최대 2개 표기) */}
          <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-[#F2F4F6]">
            {project.tools.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] font-medium text-[#8B95A1] bg-[#F2F4F6] px-1.5 py-0.5 rounded truncate max-w-[75px]"
              >
                {t}
              </span>
            ))}
            {project.tools.length > 2 && (
              <span className="text-[10px] text-[#8B95A1] bg-[#F2F4F6] px-1 py-0.5 rounded shrink-0">
                +{project.tools.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 리스트 뷰 (1열 가로 카드: 좌측 이미지, 우측 지정 텍스트 계층 구조)
  return (
    <div
      onClick={() => onClick(project)}
      className="group relative flex items-center overflow-hidden rounded-2xl border border-[#E5E8EB] bg-white p-3 gap-3 tds-shadow-card tds-press-scale hover:border-[#D1D6DB] transition-all duration-200 cursor-pointer select-none"
    >
      {/* 썸네일 이미지 (좌측 고정 비율) */}
      <div className="relative w-28 sm:w-32 shrink-0 aspect-[4/3] rounded-xl overflow-hidden bg-[#F2F4F6]">
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* 상단 우측: 팀/개인 작업 구분 뱃지 (표 구조와 동일한 위치 및 형태) */}
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

      {/* 이미지 오른쪽 텍스트 구조 */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          {/* 1. 작업종류 (ex. UIUX, Branding) */}
          <div className="text-[11px] font-bold text-[#3182F6] leading-none mb-1">
            {project.categoryLabel}
          </div>

          {/* 2. 작업제목 */}
          <h3 className="text-xs sm:text-[13px] font-bold text-[#191F28] group-hover:text-[#3182F6] transition-colors leading-snug truncate">
            {project.title}
          </h3>

          {/* 3. 작업 한 줄 소개 */}
          <p className="text-[11px] text-[#4E5968] line-clamp-1 mt-1 leading-normal">
            {project.summary}
          </p>
        </div>

        {/* 4. 프로젝트 사용 툴 최대 2개 (나머지 상세보기처리) */}
        <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-[#F2F4F6] overflow-hidden">
          {project.tools.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] font-medium text-[#4E5968] bg-[#F2F4F6] px-1.5 py-0.5 rounded truncate max-w-[80px]"
            >
              {t}
            </span>
          ))}
          {project.tools.length > 2 && (
            <span className="text-[10px] text-[#8B95A1] bg-[#F2F4F6] px-1 py-0.5 rounded shrink-0">
              +{project.tools.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
