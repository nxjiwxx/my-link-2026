"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { ProjectCategory, ViewMode } from "@/types/portfolio";
import { cn } from "@/lib/utils";

interface CategoryTabItem {
  id: ProjectCategory;
  label: string;
}

const CATEGORIES: CategoryTabItem[] = [
  { id: "all", label: "All" },
  { id: "uiux", label: "UI/UX" },
  { id: "branding", label: "Branding" },
  { id: "graphic", label: "Graphic" },
  { id: "motion", label: "3D/Motion" },
];

interface FilterAndToggleBarProps {
  selectedCategory: ProjectCategory;
  onSelectCategory: (cat: ProjectCategory) => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  className?: string;
}

export function FilterAndToggleBar({
  selectedCategory,
  onSelectCategory,
  viewMode,
  onToggleViewMode,
  className,
}: FilterAndToggleBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-4 py-2 border-b border-[#E5E8EB] bg-[#F9FAFB] select-none",
        className
      )}
    >
      {/* 좌측 카테고리 탭 (가로 스크롤 가능) */}
      <div
        className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs font-semibold tracking-tight transition-all",
                isActive
                  ? "bg-[#191F28] text-white shadow-xs"
                  : "bg-white text-[#4E5968] border border-[#E5E8EB] hover:border-[#D1D6DB] hover:text-[#191F28]"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 우측 뷰 모드 토글 (그리드 ⊞ ↔ 리스트 ☰) */}
      <div className="flex items-center shrink-0 rounded-xl bg-white border border-[#E5E8EB] p-0.5 shadow-xs">
        <button
          type="button"
          onClick={() => onToggleViewMode("grid")}
          title="그리드 뷰로 보기"
          aria-label="그리드 뷰"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
            viewMode === "grid"
              ? "bg-[#191F28] text-white shadow-xs"
              : "text-[#8B95A1] hover:text-[#191F28]"
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onToggleViewMode("list")}
          title="리스트 뷰로 보기"
          aria-label="리스트 뷰"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
            viewMode === "list"
              ? "bg-[#191F28] text-white shadow-xs"
              : "text-[#8B95A1] hover:text-[#191F28]"
          )}
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
