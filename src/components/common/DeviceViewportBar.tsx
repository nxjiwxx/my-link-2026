"use client";

import React from "react";
import { Smartphone, Tablet, Monitor, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeviceMode = "mobile" | "tablet" | "desktop" | "responsive";

interface DeviceViewportBarProps {
  currentMode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
  customWidth?: number;
  onCustomWidthChange?: (width: number) => void;
}

export function DeviceViewportBar({
  currentMode,
  onModeChange,
  customWidth,
  onCustomWidthChange,
}: DeviceViewportBarProps) {
  return (
    <aside
      aria-label="화면 뷰포트 크기 전환 바"
      className="sticky top-0 z-50 w-full bg-[#191F28] text-white border-b border-[#333D4B] shadow-sm select-none transition-all"
    >
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* 좌측 라벨 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-200 tracking-tight">
            화면 크기 리사이징
          </span>
          <span className="hidden sm:inline-block text-[11px] text-gray-400 font-mono">
            {customWidth
              ? `(${customWidth}px · 사용자 지정)`
              : currentMode === "mobile"
              ? "(390px · 모바일 버전)"
              : currentMode === "tablet"
              ? "(680px · 태블릿 고정)"
              : currentMode === "desktop"
              ? "(680px · 데스크톱 프레임)"
              : "(680px · 태블릿 프레임 맞춤)"}
          </span>
        </div>

        {/* 중앙: 모바일 / 태블릿 / 데스크톱(태블릿 고정) / 반응형 전환 버튼 그룹 */}
        <div className="flex items-center bg-[#333D4B] p-1 rounded-xl border border-gray-700/60 gap-1">
          {/* 1. 모바일 버전 (390px) */}
          <button
            type="button"
            onClick={() => onModeChange("mobile")}
            title="모바일 버전 (390px)"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              currentMode === "mobile" && !customWidth
                ? "bg-white text-[#191F28] font-semibold shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">모바일</span>
            <span className="text-[10px] opacity-75 font-mono hidden md:inline">390px</span>
          </button>

          {/* 2. 태블릿 버전 (680px) */}
          <button
            type="button"
            onClick={() => onModeChange("tablet")}
            title="태블릿 버전 (680px 고정)"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              currentMode === "tablet" && !customWidth
                ? "bg-white text-[#191F28] font-semibold shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            )}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">태블릿</span>
            <span className="text-[10px] opacity-75 font-mono hidden md:inline">680px</span>
          </button>

          {/* 3. 웹/데스크톱 버전 (태블릿 사이즈 고정 프레임) */}
          <button
            type="button"
            onClick={() => onModeChange("desktop")}
            title="웹/데스크톱 (태블릿 프레임 고정 680px)"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              currentMode === "desktop" && !customWidth
                ? "bg-white text-[#191F28] font-semibold shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            )}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">웹/데스크톱</span>
            <span className="text-[10px] opacity-75 font-mono hidden md:inline">680px</span>
          </button>

          {/* 4. 창 맞춤 자동 반응형 */}
          <button
            type="button"
            onClick={() => onModeChange("responsive")}
            title="화면 맞춤 반응형 (최대 680px)"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              currentMode === "responsive" && !customWidth
                ? "bg-white text-[#191F28] font-semibold shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            )}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">자동 맞춤</span>
          </button>
        </div>

        {/* 우측 슬라이더 (너비 미세 조절: 360px ~ 960px) */}
        {onCustomWidthChange && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
            <span className="text-[11px] font-mono w-14 text-right">
              {customWidth || (currentMode === "mobile" ? 390 : 680)}px
            </span>
            <input
              type="range"
              min={360}
              max={960}
              step={10}
              value={customWidth || (currentMode === "mobile" ? 390 : 680)}
              onChange={(e) => onCustomWidthChange(Number(e.target.value))}
              aria-label="가로 너비 슬라이더 조절"
              className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
