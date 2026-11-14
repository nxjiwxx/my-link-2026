"use client";

import React from "react";
import { Megaphone } from "lucide-react";
import { TextBlock } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TextBlockCardProps {
  block: TextBlock;
  className?: string;
}

export function TextBlockCard({ block, className }: TextBlockCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-[#E5E8EB] bg-[#FFFFFF] p-4 shadow-none select-none",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF2EE] text-[#FF5A36]">
          <Megaphone className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-[#191F28]">{block.title}</span>
        {block.badge && (
          <Badge variant="default" size="sm">
            {block.badge}
          </Badge>
        )}
      </div>

      <p
        className={cn(
          "text-[13px] text-[#4E5968] leading-relaxed break-keep",
          block.align === "center" ? "text-center" : "text-left"
        )}
      >
        {block.content}
      </p>
    </div>
  );
}
