"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { ProjectCategory, ViewMode, CategoryItem, DEFAULT_CATEGORIES } from "@/types/portfolio";
import { cn } from "@/lib/utils";

interface FilterAndToggleBarProps {
  categories?: CategoryItem[];
  selectedCategory: ProjectCategory;
  onSelectCategory: (cat: ProjectCategory) => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  className?: string;
}

export function FilterAndToggleBar({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onToggleViewMode,
  className,
}: FilterAndToggleBarProps) {
  const allTabs = [
    { id: "all", label: "All" },
    ...categories,
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-2.5 border-b border-[#E5E8EB] bg-[#F9FAFB] select-none w-full",
        className
      )}
    >
      {/* 좌측 카테고리 탭 (Auto Layout: min-w-0 flex-1로 모바일 가로 스크롤 시 우측 토글 밀림 방지) */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 py-0.5 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allTabs.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
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

      {/* 우측 뷰 모드 토글 (그리드 ⊞ ↔ 리스트 ☰) */}
      <div className="flex items-center shrink-0 rounded-xl bg-white border border-[#E5E8EB] p-0.5 shadow-none">
        <button
          type="button"
          onClick={() => onToggleViewMode("grid")}
          title="그리드 뷰로 보기"
          aria-label="그리드 뷰"
          className={cn(
            "flex h-7 w-7 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-lg transition-all cursor-pointer",
            viewMode === "grid"
              ? "bg-[#191F28] text-white shadow-none"
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
            "flex h-7 w-7 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-lg transition-all cursor-pointer",
            viewMode === "list"
              ? "bg-[#191F28] text-white shadow-none"
              : "text-[#8B95A1] hover:text-[#191F28]"
          )}
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
