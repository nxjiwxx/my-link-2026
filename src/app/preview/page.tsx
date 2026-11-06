"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PortfolioBoard } from "@/components/portfolio/PortfolioBoard";

export default function PreviewPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // 비로그인 접근 차단: 로그인 사용자만 본인 포트폴리오를 프리뷰할 수 있음
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || (!user && !isLoading)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-5 h-5 border-2 border-[#3182F6]/30 border-t-[#3182F6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PortfolioBoard
      isPreview={true}
      hideHeaderProfileMenu={false}
      showCreateProjectButton={false}
    />
  );
}
