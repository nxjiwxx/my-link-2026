import React from "react";

export default function Home() {
  const profile = {
    name: "나지우",
    enName: "Jiwoo Na",
    role: "Visual & Brand Designer",
    headline: "시각적 질서와 감각적인 디테일로 본질을 전달합니다.",
    bio: "브랜드의 고유한 이야기와 디지털 경험을 잇는 시각 디자이너 나지우입니다. 타이포그래피의 균형과 정제된 그래픽 언어로 메시지를 선명하게 드러내며, 보는 이의 일상에 자연스럽게 스며드는 시각적 경험을 설계합니다.",
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
        subtitle: "브랜딩 & 그래픽 디자인 주요 프로젝트",
        icon: "🎨",
        url: "https://behance.net",
        highlight: true,
      },
      {
        title: "Design Archive (Instagram)",
        subtitle: "시각적 영감, 무드보드 및 작업 과정",
        icon: "📸",
        url: "https://instagram.com",
        highlight: false,
      },
      {
        title: "Resume & Portfolio PDF",
        subtitle: "상세 이력서 및 작업 기술서 확인",
        icon: "📄",
        url: "#",
        highlight: false,
      },
      {
        title: "Collaboration & Contact",
        subtitle: "외주 의뢰, 협업 및 커피챗 문의하기",
        icon: "✉️",
        url: "mailto:contact@jiwoo.design",
        highlight: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex justify-center px-4 py-12 md:py-20 selection:bg-neutral-900 selection:text-white">
      <main className="w-full max-w-lg flex flex-col items-center">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center w-full">
          {/* Avatar Graphic */}
          <div className="relative mb-5 group">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-700 to-neutral-400 p-[2px] shadow-sm transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-serif tracking-tighter text-neutral-900 font-bold select-none">
                  JN
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-neutral-900 text-[10px] text-white tracking-widest uppercase px-2 py-0.5 rounded-full font-mono border-2 border-white shadow-sm">
              Designer
            </div>
          </div>

          {/* Name & Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {profile.name}
              </h1>
              <span className="text-sm text-neutral-400 font-medium">
                {profile.enName}
              </span>
            </div>
            <p className="text-sm font-semibold tracking-wider text-neutral-600 uppercase font-mono">
              {profile.role}
            </p>
          </div>

          {/* Bio Section */}
          <div className="mt-5 px-3 py-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs max-w-md">
            <p className="text-xs font-semibold text-neutral-500 mb-1.5 font-mono tracking-wide">
              {profile.headline}
            </p>
            <p className="text-[13px] leading-relaxed text-neutral-700 font-normal break-keep">
              {profile.bio}
            </p>
          </div>

          {/* Specialties / Tags */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-md">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-12 h-px bg-neutral-200 my-8" />

        {/* Link List */}
        <section className="w-full space-y-3">
          {profile.links.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`group flex items-center justify-between w-full p-4 rounded-xl transition-all duration-200 border ${
                link.highlight
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-sm hover:bg-neutral-800 hover:-translate-y-0.5"
                  : "bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400 hover:shadow-sm hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center gap-3.5 text-left">
                <span className="text-2xl" role="img" aria-hidden="true">
                  {link.icon}
                </span>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">
                    {link.title}
                  </h2>
                  <p
                    className={`text-xs mt-0.5 ${
                      link.highlight ? "text-neutral-300" : "text-neutral-500"
                    }`}
                  >
                    {link.subtitle}
                  </p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${
                  link.highlight ? "text-neutral-400" : "text-neutral-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-neutral-400 font-mono">
          <p>© {new Date().getFullYear()} {profile.enName}. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
