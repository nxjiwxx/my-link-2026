"use client";

import React from "react";
import {
  Calendar,
  ShoppingBag,
  Mail,
  FileText,
  Globe,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { YoutubeIcon, InstagramIcon } from "@/components/ui/icons";
import { LinkBlock, LinkItem } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LinkBlockCardProps {
  block: LinkBlock | LinkItem;
  className?: string;
  onClick?: () => void;
}

export function LinkBlockCard({ block, className, onClick }: LinkBlockCardProps) {
  // 아이콘 맵
  const renderIcon = (iconName?: string) => {
    const iconProps = { className: "w-5 h-5 text-[#3182F6]" };
    switch (iconName?.toLowerCase()) {
      case "calendar":
        return <Calendar {...iconProps} />;
      case "shoppingbag":
      case "shopping":
        return <ShoppingBag {...iconProps} />;
      case "youtube":
        return <YoutubeIcon className="w-5 h-5 text-[#F04452]" />;
      case "instagram":
        return <InstagramIcon className="w-5 h-5 text-[#E1306C]" />;
      case "mail":
        return <Mail {...iconProps} />;
      case "filetext":
      case "notion":
        return <FileText {...iconProps} />;
      case "sparkles":
        return <Sparkles {...iconProps} />;
      default:
        return <Globe {...iconProps} />;
    }
  };

  // 뱃지 스타일 매핑
  const renderBadge = (badgeText?: string) => {
    if (!badgeText) return null;

    if (badgeText === "BEST") {
      return <Badge variant="best">{badgeText}</Badge>;
    }
    if (badgeText === "NEW") {
      return <Badge variant="new">{badgeText}</Badge>;
    }
    if (badgeText === "사전예약") {
      return <Badge variant="default">{badgeText}</Badge>;
    }

    return <Badge variant="neutral">{badgeText}</Badge>;
  };

  return (
    <a
      href={block.url}
      target={block.url.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between w-full p-4 bg-white rounded-2xl border border-[#E5E8EB] tds-shadow-card tds-press-scale hover:border-[#D1D6DB] hover:bg-[#FAFAFA] transition-all duration-200 select-none",
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        {/* 좌측 아이콘 컨테이너 */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2F4F6] group-hover:bg-[#E8F3FF] transition-colors duration-200">
          {renderIcon(block.icon)}
        </div>

        {/* 중앙 텍스트 영역 */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-bold text-[#191F28] group-hover:text-[#3182F6] transition-colors truncate">
              {block.title}
            </span>
            {renderBadge(block.badge)}
          </div>
          {block.subtitle && (
            <p className="text-[13px] text-[#4E5968] font-normal leading-normal truncate mt-0.5">
              {block.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 우측 링크 열기 화살표 아이콘 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#B0B8C1] group-hover:text-[#3182F6] group-hover:bg-[#F2F4F6] transition-all">
        <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
}
