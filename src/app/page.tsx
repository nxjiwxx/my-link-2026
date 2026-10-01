import React from "react";

export default function Home() {
  const profile = {
    name: "나지우",
    enName: "Jiwoo Na",
    role: "Visual & Brand Designer",
    status: "Available for new projects",
    // 고화질 Unsplash 이미지 (디자이너 포트폴리오 감성)
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    headline: "시각적 질서와 감각적인 디테일로 본질을 전달합니다.",
    bio: "브랜드의 고유한 이야기와 디지털 경험을 잇는 시각 디자이너 나지우입니다. 타이포그래피의 균형과 정제된 그래픽 언어로 메시지를 선명하게 드러내며, 일상에 자연스럽게 스며드는 시각적 경험을 설계합니다.",
    tags: [
      "Brand Identity",
      "Typography",
      "Editorial Design",
      "Visual System",
      "Art Direction",
    ],
    links: [
      {
        title: "Behance Portfolio",
        subtitle: "브랜딩 & 그래픽 디자인 주요 프로젝트 모음",
        icon: "🎨",
        url: "https://behance.net",
        highlight: true,
      },
      {
        title: "Design Archive (Instagram)",
        subtitle: "일상의 시각적 영감, 무드보드 및 작업 노트",
        icon: "📸",
        url: "https://instagram.com",
        highlight: false,
      },
      {
        title: "Resume & Portfolio PDF",
        subtitle: "경력 기술서 및 작업 이력 상세 보기",
        icon: "📄",
        url: "#",
        highlight: false,
      },
      {
        title: "Collaboration & Contact",
        subtitle: "프로젝트 외주 의뢰, 협업 및 커피챗 문의",
        icon: "✉️",
        url: "mailto:contact@jiwoo.design",
        highlight: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-neutral-900 selection:text-white">
      {/* 
        반응형 컨테이너:
        - 모바일 (360px~): w-full, p-5
        - 태블릿 (768px~): max-w-lg (약 512px), p-8
        - 데스크탑 (1024px~): max-w-xl (약 576px), 부드러운 그림자 및 호버 효과
      */}
      <main className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-3xl overflow-hidden shadow-xl shadow-neutral-200/60 border border-neutral-200/80 transition-all duration-300">
        
        {/* 1. 상단 커버 이미지 배너 */}
        <div className="relative h-36 sm:h-44 md:h-52 w-full overflow-hidden bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.coverUrl}
            alt="Cover background"
            className="w-full h-full object-cover object-center opacity-85 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

          {/* 작업 가능 상태 뱃지 */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-medium text-neutral-800 shadow-xs border border-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{profile.status}</span>
          </div>
        </div>

        {/* 2. 프로필 본문 영역 */}
        <div className="px-5 sm:px-7 md:px-9 pb-8 md:pb-10 pt-0">
          {/* 원형 아바타 (커버 이미지와 오버랩) */}
          <div className="relative -mt-16 sm:-mt-20 mb-4 flex justify-between items-end">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-neutral-900 text-white text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
                PRO
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="inline-block text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-semibold">
                Visual Archive 2026
              </span>
            </div>
          </div>

          {/* 이름 & 직책 */}
          <div className="space-y-1 mb-4">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                {profile.name}
              </h1>
              <span className="text-sm sm:text-base font-semibold text-neutral-400">
                {profile.enName}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-neutral-600 uppercase font-mono">
              {profile.role}
            </p>
          </div>

          {/* 소개글 카드 (Bio) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/70 mb-5">
            <p className="text-xs font-semibold text-neutral-500 mb-1.5 font-mono tracking-wide">
              {profile.headline}
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-700 font-normal break-keep">
              {profile.bio}
            </p>
          </div>

          {/* 전문 분야 태그 */}
          <div className="flex flex-wrap gap-1.5 mb-7">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-white text-neutral-600 border border-neutral-200 shadow-2xs hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 링크 목록 (세로 카드 형태) */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono mb-2">
              Featured Links
            </h2>
            {profile.links.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`group flex items-center justify-between w-full p-4 sm:p-4.5 rounded-2xl transition-all duration-200 border ${
                  link.highlight
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-md shadow-neutral-900/15 hover:bg-neutral-800 hover:-translate-y-0.5"
                    : "bg-white text-neutral-900 border-neutral-200/90 shadow-2xs hover:border-neutral-400 hover:shadow-sm hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center gap-3.5 text-left">
                  <span
                    className="text-2xl sm:text-3xl transition-transform group-hover:scale-110 duration-200"
                    role="img"
                    aria-hidden="true"
                  >
                    {link.icon}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold tracking-tight">
                      {link.title}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${
                        link.highlight ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {link.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    link.highlight
                      ? "bg-white/10 group-hover:bg-white/20 text-white"
                      : "bg-neutral-100 group-hover:bg-neutral-200 text-neutral-700"
                  }`}
                >
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </section>

          {/* 푸터 */}
          <footer className="mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400 font-mono">
            <p>© {new Date().getFullYear()} {profile.enName}. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
