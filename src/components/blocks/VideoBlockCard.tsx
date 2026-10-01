"use client";

import React from "react";
import { YoutubeIcon } from "@/components/ui/icons";
import { VideoBlock } from "@/types/profile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VideoBlockCardProps {
  block: VideoBlock;
}

export function VideoBlockCard({ block }: VideoBlockCardProps) {
  // YouTube URL 변환 헬퍼 (단축 링크, 일반 링크를 embed용으로 변환)
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes("embed/")) return url;
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes("watch?v=")) {
        const id = new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(block.videoUrl);

  return (
    <Card className="overflow-hidden border border-[#E5E8EB] bg-white rounded-2xl">
      <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <YoutubeIcon className="w-5 h-5 text-[#F04452]" />
          <CardTitle className="text-sm font-bold text-[#191F28]">
            {block.title}
          </CardTitle>
        </div>
        <Badge variant="neutral" size="sm">
          영상
        </Badge>
      </CardHeader>

      <CardContent className="p-4 pt-1">
        {/* 16:9 반응형 동영상 플레이어 */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#191F28] shadow-inner">
          <iframe
            src={embedUrl}
            title={block.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {block.description && (
          <p className="mt-2.5 text-xs text-[#4E5968] leading-relaxed">
            {block.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
