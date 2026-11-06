"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/icons";
import {
  DeviceViewportBar,
  DeviceMode,
} from "@/components/common/DeviceViewportBar";

interface LandingHeroProps {
  onGoogleLogin: () => Promise<void>;
  isLoggingIn?: boolean;
}

export function LandingHero({
  onGoogleLogin,
  isLoggingIn = false,
}: LandingHeroProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("responsive");
  const [customWidth, setCustomWidth] = useState<number | undefined>(undefined);

  const handleModeChange = (mode: DeviceMode) => {
    setDeviceMode(mode);
    setCustomWidth(undefined);
  };

  // 컨테이너 클래스: 웹 데스크톱에서도 태블릿 사이즈(680px) 고정 프레임 적용
  const containerClasses = customWidth
    ? "w-full my-0 sm:my-6 rounded-none sm:rounded-2xl border-0 sm:border border-[#E5E8EB] shadow-none sm:shadow-sm bg-white flex flex-col items-center justify-between transition-all duration-300 min-h-[580px]"
    : deviceMode === "mobile"
    ? "w-full max-w-[390px] my-0 sm:my-6 rounded-none sm:rounded-3xl border-0 sm:border border-[#E5E8EB] shadow-none sm:shadow-2xl bg-white flex flex-col items-center justify-between overflow-hidden transition-all duration-300 min-h-[580px]"
    : "w-full max-w-[680px] my-0 sm:my-6 rounded-none sm:rounded-2xl border-0 sm:border border-[#E5E8EB] shadow-none sm:shadow-sm bg-white flex flex-col items-center justify-between transition-all duration-300 min-h-[580px]";

  const containerStyle = customWidth ? { maxWidth: `${customWidth}px` } : undefined;

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] text-[#191F28] flex flex-col items-center">
      {/* 0. 화면 크기 모바일/웹 리사이징 뷰포트 컨트롤 바 */}
      <DeviceViewportBar
        currentMode={deviceMode}
        onModeChange={handleModeChange}
        customWidth={customWidth}
        onCustomWidthChange={setCustomWidth}
      />

      <div className={containerClasses} style={containerStyle}>
        {/* 상단 여백 (헤더 완전 삭제된 깔끔한 상태) */}
        <div className="w-full pt-12 sm:pt-16" />

        {/* 중앙 메인 컨텐츠: Linear/Notion 스타일의 단정하고 모던한 미니멀 디자인 */}
        <main className="w-full max-w-md mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center select-none">
          {/* 서비스 타이틀 */}
          <div className="mb-4">
            <span className="text-xs font-semibold tracking-wider text-[#6B7684] uppercase">
              My Link
            </span>
          </div>

          {/* 헤드라인 */}
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#191F28] tracking-tight leading-[1.25]">
              Development in One Link.
            </h1>
            <p className="text-sm sm:text-base font-medium text-[#4E5968] tracking-tight">
              Showcase your git, blog, and more.
            </p>
          </div>

          {/* CTA 버튼: [ G Continue with Google ] */}
          <div className="mt-8 sm:mt-10 w-full max-w-xs">
            <Button
              type="button"
              onClick={onGoogleLogin}
              disabled={isLoggingIn}
              className="w-full h-11 sm:h-12 rounded-xl bg-[#191F28] hover:bg-[#333D4B] text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer border border-[#191F28]"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                <GoogleIcon className="w-3.5 h-3.5" />
              </div>
              <span>{isLoggingIn ? "연결 중..." : "Continue with Google"}</span>
              <ArrowRight className="w-4 h-4 ml-0.5 text-white/70" />
            </Button>
          </div>
        </main>

        {/* 심플 미니멀 푸터 */}
        <footer className="w-full py-6 text-center select-none border-t border-[#F2F4F6]">
          <p className="text-xs text-[#8B95A1]">
            © My Link
          </p>
        </footer>
      </div>
    </div>
  );
}
