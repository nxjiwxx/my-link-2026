"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowUpRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/icons";
import { Toast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 이미 로그인되어 있으면 메인(/)으로 리다이렉트
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  const handleGoogleLogin = async () => {
    if (isLoggingIn || user) return;
    setIsLoggingIn(true);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        showToast(`${loggedUser.displayName || "회원"}님 환영합니다!`);
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    } catch (err: unknown) {
      console.error("로그인 실패:", err);
      const errorObj = err as { code?: string };
      if (errorObj?.code === "auth/popup-closed-by-user") {
        showToast("로그인 창이 닫혔습니다.");
      } else {
        showToast("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-[#FF5A36]/30 border-t-[#FF5A36] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-[#0A192F] font-sans flex flex-col justify-between px-6 py-8 sm:py-12 antialiased selection:bg-[#FF5A36] selection:text-white">
      
      {/* 1. 상단 헤더: 로고 & 홈으로 링크 (카드 박스 없음) */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="font-['Syne',sans-serif] font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0A192F] flex items-center gap-1">
            myportfolio
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A36] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#0A192F] transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로</span>
        </Link>
      </header>

      {/* 2. 중앙 오픈 레이아웃 (카드 박스 디자인 완전 배제) */}
      <main className="w-full max-w-md mx-auto my-auto py-12 flex flex-col items-center text-center">
        
        {/* 타이틀 영역 */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0A192F] leading-tight">
          시작하기
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
          구글 계정으로 3초 만에 로그인하고<br />
          나만의 감각적인 포트폴리오를 만들어보세요.
        </p>

        {/* 심플 혜택 포인트 (선셋 오렌지 체크 아이콘) */}
        <div className="mt-8 mb-10 flex flex-col items-center gap-2.5 text-xs sm:text-sm text-[#475569] font-medium">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FF5A36]" />
            <span>나만의 고유 링크 선점 (@username)</span>
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FF5A36]" />
            <span>Figma, Behance, 이력서 원클릭 연동</span>
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FF5A36]" />
            <span>모바일 & 데스크톱 완벽 반응형 뷰 제공</span>
          </span>
        </div>

        {/* Google 로그인 버튼 (딥 네이비 솔리드) */}
        <div className="w-full max-w-xs">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full h-13 rounded-2xl bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer border-0 active:scale-[0.98]"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
              <GoogleIcon className="w-3.5 h-3.5" />
            </div>
            <span>{isLoggingIn ? "연결 중..." : "Google 계정으로 계속하기"}</span>
          </Button>
        </div>

        {/* 약관 안내 문구 */}
        <p className="mt-8 text-xs text-[#94A3B8] leading-relaxed max-w-xs">
          계속 진행하면 MyPortfolio의 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </main>

      {/* 3. 하단 미니멀 푸터 */}
      <footer className="w-full max-w-5xl mx-auto text-center pt-8 text-xs text-[#94A3B8]">
        <p>© {new Date().getFullYear()} MyPortfolio. All rights reserved.</p>
      </footer>

      <Toast message={toastMessage} />
    </div>
  );
}
