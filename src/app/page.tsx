"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LandingHero } from "@/components/landing/LandingHero";
import { PortfolioBoard } from "@/components/portfolio/PortfolioBoard";
import { Toast } from "@/components/ui/toast";

function MainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading, signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleGoogleLogin = async () => {
    if (user) {
      router.push("/mypage");
      return;
    }
    setIsLoggingIn(true);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        showToast(`${loggedUser.displayName || "회원"}님 환영합니다.`);
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

  // 1. 인증 초기화 대기 중
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-[#111827]/20 border-t-[#111827] rounded-full animate-spin" />
      </div>
    );
  }

  // 2. 쿼리 파라미터를 통해 타인의 링크 또는 데모를 열람하는 경우
  //    (로그인 없이 다이렉트로 타인의 링크 페이지를 볼 수 있도록 랜딩 페이지 건너뜀)
  const queryHandle = searchParams.get("u") || undefined;
  const queryUid = searchParams.get("user") || undefined;
  const isDemo = searchParams.get("demo") === "true";

  if (queryHandle || queryUid || isDemo) {
    return (
      <PortfolioBoard
        targetHandle={queryHandle}
        targetUid={queryUid}
        isDemo={isDemo}
      />
    );
  }

  // 3. 로그인을 하지 않은 사용자가 메인에 접근한 경우 (또는 landing=true 쿼리)
  //    -> 초기 랜딩페이지 표시 + Continue with Google CTA
  const isLandingRequested = searchParams.get("landing") === "true";
  if (!user || isLandingRequested) {
    return (
      <>
        <LandingHero
          onGoogleLogin={handleGoogleLogin}
          isLoggingIn={isLoggingIn}
        />
        <Toast message={toastMessage} />
      </>
    );
  }

  // 4. 로그인한 사용자 -> 본인의 맞춤 포트폴리오 관리/제작 보드 렌더링
  return <PortfolioBoard />;
}

export default function MainPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB]">
          <div className="w-5 h-5 border-2 border-[#FF5A36]/30 border-t-[#FF5A36] rounded-full animate-spin" />
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
