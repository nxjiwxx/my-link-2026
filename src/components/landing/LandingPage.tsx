"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";

interface LandingPageProps {
  onGoogleLogin?: () => Promise<void>;
  isLoggingIn?: boolean;
}

export function LandingPage({}: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<string>("UI/UX 디자이너");

  const roles = [
    {
      title: "UI/UX 디자이너",
      desc: "피그마 프로토타입과 사용자 중심의 화면 설계 인터랙션을 직관적으로 정리하세요.",
    },
    {
      title: "그래픽 & 브랜딩",
      desc: "비주얼 아이덴티티, 로고, 타이포그래피 작업물을 고해상도 썸네일로 돋보이게 아카이빙하세요.",
    },
    {
      title: "3D & 모션 아티스트",
      desc: "Blender, C4D, After Effects 작업물을 한눈에 들어오는 그리드로 쇼케이스하세요.",
    },
    {
      title: "프로덕트 빌더",
      desc: "깃허브, 라이브 데모, 프로젝트 기여도와 이력서를 하나의 세련된 링크로 전달하세요.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-[#0A192F] antialiased selection:bg-[#FF5A36] selection:text-white overflow-x-hidden font-sans">
      
      {/* =========================================================================
          1. HERO SECTION: 순백의 화이트 배경 & 딥 네이비(80%) + 선셋 오렌지(20%) 포인트
          ========================================================================= */}
      <section className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-between bg-white">
        
        {/* 상단 미니멀 네비게이션 헤더 바 */}
        <header className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-6 sm:pt-8 flex items-center justify-between">
          {/* Logo (Syne 폰트 딥 네이비 + 선셋 오렌지 화살표) */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="font-['Syne',sans-serif] font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0A192F] flex items-center gap-1">
              myportfolio
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A36] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </Link>

          {/* Center Meta Info (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm font-medium text-[#475569] tracking-wide font-sans">
            <span>All-in-One Portfolio Hub</span>
            <span className="text-[#CBD5E1]">|</span>
            <span className="text-[#FF5A36] font-semibold">For Designers & Creators</span>
          </div>
        </header>

        {/* 히어로 중앙 타이포그래피 (타이틀: My Portfolio) */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 my-auto text-center flex flex-col items-center">
          
          {/* 선셋 오렌지 미니 인디케이터 배지 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FF5A36]/20 text-[#FF5A36] text-xs font-bold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] animate-pulse" />
            <span>디자이너를 위한 올인원 포트폴리오</span>
          </div>

          {/* H1 Display: 감각적인 Syne 폰트의 압도적인 딥 네이비 타이포그래피 */}
          <h1 className="font-['Syne',sans-serif] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-[#0A192F] leading-none select-none">
            My Portfolio
          </h1>

          {/* Subtitle H2: 딥 네이비 + 선셋 오렌지 키워드 하이라이트 */}
          <p className="font-sans mt-5 sm:mt-7 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1E293B] tracking-tight max-w-2xl leading-snug">
            나만의 포폴 링크를{" "}
            <span className="text-[#FF5A36] underline decoration-[#FF5A36]/30 decoration-wavy decoration-2 underline-offset-4">
              큐레이션
            </span>
            하다.
          </p>

          {/* Body Description */}
          <p className="font-sans mt-3.5 sm:mt-5 text-sm sm:text-base md:text-lg text-[#475569] font-normal max-w-lg leading-relaxed">
            흩어져 있던 피그마, 비핸스, 이력서를 3분 만에 하나의 링크로 모아보세요.
          </p>

          {/* 중앙 네이비 메인 CTA 버튼 (아이콘 포함 전면 화이트) */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-xl bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-sm sm:text-base tracking-tight shadow-sm hover:shadow-md transition-all active:scale-95 group font-sans"
            >
              <span>지금 시작하기</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="w-full h-10 sm:h-16" />
      </section>


      {/* =========================================================================
          2. CORE FEATURES SECTION: 딥 네이비(80%) + 선셋 오렌지(20%) 그래픽 심볼
          ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-32 font-sans border-t border-[#F1F5F9]">
        
        {/* 섹션 헤더 */}
        <div className="max-w-2xl">
          <span className="text-xs font-bold tracking-wider text-[#FF5A36] uppercase">
            Core Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#0A192F] leading-tight mt-1.5">
            On what we offer
          </h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg font-normal text-[#475569] leading-relaxed">
            채용 담당자와 클라이언트의 눈길을 사로잡을 수 있도록, 포트폴리오의 본질에 꼭 맞춘 3가지 핵심 경험을 제공합니다.
          </p>
        </div>

        {/* 3대 핵심 기능 (네이비 바디 + 선셋 오렌지 포인트 심볼) */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-10 lg:gap-14">
          
          {/* 기능 1: 화살표 심볼 (↗) with 선셋 오렌지 액센트 */}
          <div className="flex flex-col items-start group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0A192F] to-[#FF5A36] p-0.5 mb-6 sm:mb-8 group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-tr from-[#0A192F] to-[#1E3A5F] flex items-center justify-center text-white">
                  <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-[#FF5A36]" />
                </div>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#0A192F]">
              3분 초간편 아카이빙
            </h3>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base font-normal text-[#475569] leading-relaxed">
              복잡한 코딩이나 무거운 웹 빌더 없이, 썸네일과 설명, 사용 툴(#Figma) 태그만 입력하면 즉시 감각적인 포트폴리오가 완성됩니다.
            </p>
          </div>

          {/* 기능 2: 링 심볼 (◎) with 선셋 오렌지 액센트 */}
          <div className="flex flex-col items-start group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0A192F] to-[#FF5A36] p-0.5 mb-6 sm:mb-8 group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-[6px] sm:border-[8px] border-[#0A192F] bg-transparent flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#FF5A36]" />
                </div>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#0A192F]">
              그리드 & 리스트 듀얼 뷰
            </h3>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base font-normal text-[#475569] leading-relaxed">
              한눈에 프로젝트를 훑어보는 카드 그리드 뷰와 설명 중심의 리스트 뷰를 방문자의 선호에 맞춰 원클릭으로 전환할 수 있습니다.
            </p>
          </div>

          {/* 기능 3: 플러스 심볼 (+) with 선셋 오렌지 액센트 */}
          <div className="flex flex-col items-start group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0A192F] to-[#FF5A36] p-0.5 mb-6 sm:mb-8 group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center">
                  <div className="absolute w-8 sm:w-10 h-2.5 sm:h-3 rounded-full bg-[#0A192F]" />
                  <div className="absolute h-8 sm:h-10 w-2.5 sm:w-3 rounded-full bg-[#FF5A36]" />
                </div>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#0A192F]">
              원클릭 이력서 & 외부 링크
            </h3>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base font-normal text-[#475569] leading-relaxed">
              페이지를 벗어나지 않고 상세 모달에서 기여도를 확인하며, Figma 프로토타입 원본 및 최신 PDF 이력서 다운로드로 바로 연결됩니다.
            </p>
          </div>
        </div>
      </section>


      {/* =========================================================================
          3. AUDIENCE SECTION: For all creators
          ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 border-t border-[#F1F5F9] font-sans">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#FF5A36] uppercase">
            Audience
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#0A192F] leading-tight mt-1.5">
            For all creators
          </h2>

          {/* 롤(Role) 선택 칩 바 */}
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-2.5">
            {roles.map((role) => {
              const isSelected = selectedRole === role.title;
              return (
                <button
                  key={role.title}
                  type="button"
                  onClick={() => setSelectedRole(role.title)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#0A192F] text-white shadow-xs"
                      : "bg-[#F8FAFC] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0A192F]"
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36]" />}
                  <span>{role.title}</span>
                </button>
              );
            })}
          </div>

          {/* 선택된 롤에 따른 대형 메시지 */}
          <div className="mt-8 sm:mt-12 max-w-4xl">
            <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#0A192F] leading-snug sm:leading-tight">
              {roles.find((r) => r.title === selectedRole)?.desc}
            </p>
          </div>
        </div>
      </section>


      {/* =========================================================================
          4. BOTTOM CTA BANNER & FOOTER
          ========================================================================= */}
      <section className="w-full bg-white text-[#0A192F] py-20 sm:py-28 px-5 sm:px-8 lg:px-12 font-sans border-t border-[#F1F5F9]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A192F]">
              나만의 포트폴리오를 지금 시작하세요.
            </h3>
            <p className="mt-2 text-sm sm:text-base font-normal text-[#475569]">
              3분이면 채용 담당자의 눈길을 사로잡는 링크가 완성됩니다.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#FF5A36] hover:bg-[#E84E2B] text-white font-bold text-sm sm:text-base tracking-tight transition-all active:scale-95 shrink-0 shadow-sm hover:shadow-md group"
          >
            <span className="text-white">시작하기</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#94A3B8]">
          <p>© {new Date().getFullYear()} MyPortfolio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[#FF5A36] transition-colors">
              로그인
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
