"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { BannerBlock } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BannerBlockCardProps {
  block: BannerBlock;
  className?: string;
}

export function BannerBlockCard({ block, className }: BannerBlockCardProps) {
  return (
    <a
      href={block.targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl border border-[#E5E8EB] bg-white tds-shadow-card tds-press-scale transition-all duration-200 select-none",
        className
      )}
    >
      {/* 배너 이미지 컨테이너 */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[2.4/1] overflow-hidden bg-[#F2F4F6]">
        <img
          src={block.imageUrl}
          alt={block.altText || block.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* 좌측 상단 뱃지 */}
        {block.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant="dark" size="sm" className="bg-black/50 backdrop-blur-md text-white border-0">
              {block.badge}
            </Badge>
          </div>
        )}

        {/* 배너 타이틀 및 화살표 오버레이 */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <p className="text-sm sm:text-base font-bold tracking-tight drop-shadow-sm line-clamp-1 pr-2">
            {block.title}
          </p>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-white group-hover:text-[#191F28] transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
