"use client";

import React, { useState } from "react";
import {
  MapPin,
  Copy,
  Navigation,
  Check,
  Clock,
  Phone,
} from "lucide-react";
import { MapBlock } from "@/types/profile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MapBlockCardProps {
  block: MapBlock;
  onCopyAddress?: (address: string) => void;
}

export function MapBlockCard({ block, onCopyAddress }: MapBlockCardProps) {
  const { mapInfo } = block;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mapInfo.address);
    }
    setCopied(true);
    if (onCopyAddress) {
      onCopyAddress(mapInfo.address);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirections = () => {
    const url =
      mapInfo.kakaoMapUrl ||
      `https://map.kakao.com/link/to/${encodeURIComponent(
        mapInfo.placeName
      )},${mapInfo.lat},${mapInfo.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="overflow-hidden border border-[#E5E8EB] bg-white rounded-2xl select-none">
      <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F3FF] text-[#3182F6]">
            <MapPin className="w-4 h-4" />
          </div>
          <CardTitle className="text-sm font-bold text-[#191F28]">
            {block.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 space-y-3">
        {/* 장소 및 주소 정보 */}
        <div className="rounded-xl bg-[#F9FAFB] p-3 border border-[#E5E8EB]">
          <div className="text-sm font-bold text-[#191F28] mb-1">
            {mapInfo.placeName}
          </div>
          <div className="text-xs text-[#4E5968] leading-snug">
            {mapInfo.address}
          </div>
          {mapInfo.detailAddress && (
            <div className="text-[11px] text-[#8B95A1] mt-0.5">
              {mapInfo.detailAddress}
            </div>
          )}

          {(mapInfo.openingHours || mapInfo.contact) && (
            <div className="mt-2.5 pt-2 border-t border-[#E5E8EB] space-y-1">
              {mapInfo.openingHours && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#4E5968]">
                  <Clock className="w-3 h-3 text-[#8B95A1]" />
                  <span>{mapInfo.openingHours}</span>
                </div>
              )}
              {mapInfo.contact && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#4E5968]">
                  <Phone className="w-3 h-3 text-[#8B95A1]" />
                  <span>{mapInfo.contact}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 지도 비주얼 뷰 (모바일 최적화된 성수 쇼룸 맵 UI) */}
        <div className="relative h-44 w-full rounded-xl overflow-hidden border border-[#E5E8EB] bg-[#E8EFF6]">
          {/* 가상 지도 그리드 패턴 & 성수동 지도 디자인 */}
          <div className="absolute inset-0 bg-[#E8EFF6] flex items-center justify-center">
            {/* 도로망 시각화 */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#FFFFFF" strokeWidth="12" />
              <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#D1DEEE" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#FFFFFF" strokeWidth="16" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#D1DEEE" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#FFFFFF" strokeWidth="8" />
              <rect x="15%" y="45%" width="28%" height="35%" fill="#DDE7F0" rx="8" />
              <rect x="58%" y="10%" width="32%" height="20%" fill="#DDE7F0" rx="8" />
              <rect x="58%" y="45%" width="32%" height="45%" fill="#DDE7F0" rx="8" />
            </svg>

            {/* 지하철역 뱃지 */}
            <div className="absolute top-4 left-4 bg-white/95 px-2 py-1 rounded-md text-[10px] font-bold text-[#04C05E] border border-[#E5E8EB] shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#04C05E]" />
              2호선 성수역 3번출구
            </div>

            {/* 마커 핀 */}
            <div className="relative z-10 flex flex-col items-center animate-bounce duration-1000">
              <div className="rounded-full bg-[#3182F6] text-white p-2.5 shadow-lg border-2 border-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="bg-[#191F28] text-white text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 shadow-md whitespace-nowrap">
                {mapInfo.placeName}
              </div>
            </div>

            {/* 카카오맵 워터마크 안내 */}
            <div className="absolute bottom-2 right-2 text-[10px] text-[#8B95A1] bg-white/80 px-1.5 py-0.5 rounded font-mono">
              Kakao Maps
            </div>
          </div>
        </div>

        {/* 2개 액션 버튼: 주소 복사 & 길찾기 */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCopy}
            className="w-full h-11 rounded-xl text-xs font-bold text-[#191F28] bg-[#F2F4F6] hover:bg-[#E5E8EB] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#04C05E]" />
                <span className="text-[#04C05E]">복사 완료</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#4E5968]" />
                <span>주소 복사</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={handleDirections}
            className="w-full h-11 rounded-xl text-xs font-bold text-white bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Navigation className="w-4 h-4" />
            <span>길찾기</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
