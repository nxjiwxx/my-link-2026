"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Link2, FolderGit2, CheckCircle2 } from "lucide-react";
import { GoogleIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface GuestNoticeCardProps {
  onLoginSuccess?: () => void;
  showToast?: (msg: string) => void;
}

export function GuestNoticeCard({ onLoginSuccess, showToast }: GuestNoticeCardProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        showToast?.(`${user.displayName || "회원"}님, 로그인되었습니다! 🎉`);
        onLoginSuccess?.();
      }
    } catch (err: unknown) {
      console.error("로그인 실패:", err);
      const errorObj = err as { code?: string };
      if (errorObj?.code === "auth/popup-closed-by-user") {
        showToast?.("로그인 창이 닫혔습니다.");
      } else {
        showToast?.("Google 로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="px-4 py-4 select-none animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-white to-[#F2F8FF] border border-[#D5E4F7] p-5 shadow-none">
        {/* 장식용 배경 블러 원 */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF5A36]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-[#FF5A36]/10 rounded-full blur-2xl pointer-events-none" />

        {/* 상단 뱃지 */}
        <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-[#FFF2EE] border border-[#FF5A36]/20 text-[#FF5A36] text-[11px] font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Google 소셜 로그인 안내</span>
        </div>

        {/* 메인 타이틀 & 설명 */}
        <h2 className="text-lg font-bold text-[#191F28] tracking-tight leading-snug">
          로그인하고 나만의 맞춤 포트폴리오 링크를 관리하세요
        </h2>
        <p className="mt-2 text-xs text-[#4E5968] leading-relaxed break-keep">
          MyPortfolio(마이포폴)는 디자이너를 위한 올인원 포트폴리오 아카이빙 플랫폼입니다.
          Google 계정으로 로그인하시면 개인 클라우드 저장소
          <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-[#D1D6DB] text-[#FF5A36] font-mono font-semibold text-[11px]">
            users/{`{user.uid}`}/links
          </code>
          에 작업물과 프로필 정보가 안전하게 저장되어 언제 어디서나 수정하고 공유할 수 있습니다.
        </p>

        {/* 핵심 특징 3가지 */}
        <div className="mt-4 space-y-2 pt-2 border-t border-[#E5E8EB]/80">
          <div className="flex items-start gap-2.5 text-xs text-[#333D4B]">
            <div className="w-5 h-5 rounded-full bg-[#FFF2EE] text-[#FF5A36] flex items-center justify-center shrink-0 mt-0.5">
              <Link2 className="w-3 h-3" />
            </div>
            <div>
              <span className="font-bold text-[#191F28]">작업물 링크 아카이빙 : </span>
              Figma, Behance, GitHub 등 분산된 프로젝트를 썸네일과 함께 한곳에 정리합니다.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-[#333D4B]">
            <div className="w-5 h-5 rounded-full bg-[#FFF2EE] text-[#FF5A36] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <div>
              <span className="font-bold text-[#191F28]">개인화 클라우드 동기화 : </span>
              내 Google UID 기반으로 전용 Firestore 경로에 안전하게 영구 저장됩니다.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-[#333D4B]">
            <div className="w-5 h-5 rounded-full bg-[#FFF2EE] text-[#FF5A36] flex items-center justify-center shrink-0 mt-0.5">
              <FolderGit2 className="w-3 h-3" />
            </div>
            <div>
              <span className="font-bold text-[#191F28]">도구 숙련도 & 경력 관리 : </span>
              스킬 프로그레스 바와 경력 타임라인까지 모두 자유롭게 편집할 수 있습니다.
            </div>
          </div>
        </div>

        {/* 구글 로그인 CTA 버튼 */}
        <div className="mt-5">
          <Button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-[#FF5A36] hover:bg-[#E84E2B] text-white font-bold text-sm shadow-none flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-none">
              <GoogleIcon className="w-3.5 h-3.5" />
            </div>
            <span>{isLoading ? "Google 로그인 연결 중..." : "Google 계정으로 3초 만에 시작하기"}</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Button>

          <p className="mt-2 text-center text-[11px] text-[#8B95A1]">
            별도 가입 절차 없이 기존 Google 계정으로 즉시 이용할 수 있습니다.
          </p>

          <div className="mt-3 text-center">
            <Link
              href="/landing"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF5A36] hover:underline"
            >
              <span>MyPortfolio(마이포폴) 기능 및 디자이너 특장점 자세히 보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
