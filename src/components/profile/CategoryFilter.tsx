"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CategoryOption {
  id: string;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "전체" },
  { id: "event", label: "팝업예약" },
  { id: "shopping", label: "공구마켓" },
  { id: "media", label: "영상/VLOG" },
  { id: "social", label: "소셜" },
  { id: "contact", label: "제휴문의" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  className?: string;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  className,
}: CategoryFilterProps) {
  return (
    <nav
      aria-label="카테고리 탐색"
      className={cn(
        "flex items-center justify-center flex-wrap gap-y-1.5 py-2 px-2 text-xs select-none",
        className
      )}
    >
      {CATEGORIES.map((cat, idx) => {
        const isActive = selectedCategory === cat.id;
        return (
          <React.Fragment key={cat.id}>
            {idx > 0 && (
              <span className="text-[#E5E8EB] mx-2 select-none font-light">|</span>
            )}
            <button
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "transition-all duration-150 py-0.5",
                isActive
                  ? "text-[#3182F6] font-bold underline underline-offset-4 decoration-2"
                  : "text-[#4E5968] font-medium hover:text-[#191F28]"
              )}
            >
              {cat.label}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
