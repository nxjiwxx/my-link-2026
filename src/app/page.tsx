"use client";

import React, { useState, useEffect, useRef } from "react";

// Web Audio API를 활용한 가벼운 8-bit 복고풍 효과음 유틸리티
class PixelSound {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playBlip(freq = 440, type: OscillatorType = "square", duration = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext 비활성화 환경 대비 안전 처리
    }
  }

  playWater() {
    if (!this.enabled) return;
    this.playBlip(320, "triangle", 0.06);
    setTimeout(() => this.playBlip(580, "sine", 0.1), 50);
  }

  playCoin() {
    if (!this.enabled) return;
    this.playBlip(523.25, "square", 0.07);
    setTimeout(() => this.playBlip(659.25, "square", 0.12), 60);
  }

  playPowerup() {
    if (!this.enabled) return;
    [260, 330, 392, 523, 660].forEach((f, i) => {
      setTimeout(() => this.playBlip(f, "sawtooth", 0.07), i * 50);
    });
  }
}

const sfx = new PixelSound();

// 재미있는 픽셀 식물 진화 단계
const PLANT_STAGES = [
  { level: 1, name: "말린 도토리 씨앗", icon: "🌰", desc: "흙 속에서 잠자는 중... 물이 고파요!" },
  { level: 2, name: "파릇파릇 새싹", icon: "🌱", desc: "초록빛 영감을 광합성하는 중!" },
  { level: 3, name: "이끼 품은 덩굴", icon: "🌿", desc: "픽셀 줄기가 마구 뻗어나가는 중!" },
  { level: 4, name: "야생 해바라기", icon: "🌻", desc: "태양을 향해 디자인 만개 완료!" },
  { level: 5, name: "전설의 버섯나무", icon: "🍄", desc: "시각적 혼돈과 자연의 완성체!" },
  { level: 6, name: "황금 열매 세계수", icon: "🌳", desc: "더 이상 자랄 곳이 없는 마스터 나무!" },
];

// 디자이너의 혼돈과 인간미가 느껴지는 오늘의 영감 슬롯
const INSPIRATION_QUOTES = [
  "☕ 현재 카페인 농도 89%: 눈으로 픽셀을 세는 경지",
  "🍄 숲속에서 버섯 채집하다가 영감 얻음 (진짜임)",
  "⌨️ 'Ctrl+Z' 누르다 키캡 날아감. 본능으로 디자인 중",
  "🐞 이건 버그가 아니라 자연이 준 유기적 패턴입니다",
  "🌿 흙 냄새 맡으며 0.5px 커닝 미세 조정 중...",
  "🎨 최종_진짜최종_이거아님퇴사.psd 안전 보관됨",
  "🐸 풀숲의 개구리가 오늘 레이아웃을 컨펌해줬음",
  "🔥 완벽한 대칭보다는 삐딱한 손맛이 진정한 예술!",
];

export default function PixelGardenPage() {
  const [waterCount, setWaterCount] = useState(1);
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [stamps, setStamps] = useState<Array<{ id: number; x: number; y: number; icon: string }>>([]);
  const [avatarFace, setAvatarFace] = useState<"happy" | "cool" | "chaos">("happy");
  const stampIdRef = useRef(0);

  // 사운드 토글
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isSoundOn;
    setIsSoundOn(next);
    sfx.enabled = next;
    if (next) sfx.playCoin();
  };

  // 물주기 인터랙션
  const handleWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playWater();
    setWaterCount((prev) => {
      const next = prev + 1;
      if (next % 3 === 0) {
        setTimeout(() => sfx.playPowerup(), 120);
      }
      return next;
    });
  };

  // 영감 슬롯 돌리기
  const handleRollInspiration = (e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playCoin();
    setCurrentQuoteIdx((prev) => (prev + 1) % INSPIRATION_QUOTES.length);
  };

  // 화면 아무데나 클릭 시 픽셀 꽃/나뭇잎 도장 스탬프 생성
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 버튼이나 링크 클릭 시 도장 방지
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;

    const icons = ["🌱", "🌸", "🍄", "🌿", "🍀", "🐞", "✨", "🌰", "🌼"];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    sfx.playBlip(300 + Math.random() * 400, "triangle", 0.05);

    const rect = e.currentTarget.getBoundingClientRect();
    const newStamp = {
      id: ++stampIdRef.current,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      icon: randomIcon,
    };

    setStamps((prev) => [...prev.slice(-15), newStamp]);
  };

  // 현재 식물 단계 계산
  const currentPlant = PLANT_STAGES[Math.min(Math.floor((waterCount - 1) / 3), PLANT_STAGES.length - 1)];

  return (
    <div
      onClick={handleScreenClick}
      className="relative min-h-screen w-full overflow-x-hidden py-8 px-3 sm:px-6 flex flex-col items-center justify-start select-none cursor-crosshair"
    >
      {/* 화면 클릭 시 찍히는 픽셀 자연 스탬프들 */}
      {stamps.map((stamp) => (
        <span
          key={stamp.id}
          style={{ left: stamp.x - 12, top: stamp.y - 12 }}
          className="pointer-events-none absolute text-2xl animate-pixel-bounce z-50 transition-opacity duration-1000"
        >
          {stamp.icon}
        </span>
      ))}

      {/* 1. 상단 레트로 OS 윈도우 헤더 바 */}
      <header className="w-full max-w-xl mb-4 bg-[#233118] text-[#b8f038] px-3 py-2 pixel-border pixel-shadow flex items-center justify-between z-20">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
          <span className="w-3 h-3 bg-[#b8f038] inline-block animate-pixel-blink" />
          <span className="tracking-wider">🌿 NATURE_OS v2.6 [JIWOO.EXE]</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 사운드 토글 버튼 */}
          <button
            onClick={toggleSound}
            className="px-2 py-0.5 text-xs bg-[#f5eedb] text-[#1b2612] pixel-border-sm hover:bg-[#b8f038] active:translate-x-0.5 active:translate-y-0.5 font-bold"
          >
            {isSoundOn ? "🔊 BGM:ON" : "🔇 BGM:OFF"}
          </button>
          <div className="flex gap-1 text-[11px] font-mono text-[#f5eedb]">
            <span className="px-1.5 py-0.2 bg-[#3a4d25] border border-[#1b2612]">_</span>
            <span className="px-1.5 py-0.2 bg-[#e76f51] border border-[#1b2612]">X</span>
          </div>
        </div>
      </header>

      {/* 2. 극단적이고 혼란스러운 카오스 레이아웃 본체 */}
      <div className="w-full max-w-xl relative flex flex-col items-center gap-6 pb-20">
        
        {/* 혼란 1: 화면 밖으로 삐져나온 장난스러운 경고 테이프 */}
        <div className="absolute -top-3 -right-3 sm:-right-8 bg-[#ffd166] text-[#1b2612] px-3 py-1 font-bold text-xs sm:text-sm pixel-border pixel-shadow-sm rotate-6 z-30 animate-pixel-wiggle">
          ⚠️ 픽셀 수작업 100% 함유!
        </div>

        <div className="absolute -top-2 -left-4 sm:-left-8 bg-[#e76f51] text-white px-2.5 py-0.5 font-bold text-xs pixel-border pixel-shadow-sm -rotate-6 z-30">
          🌱 클릭하면 풀 자람!
        </div>

        {/* 3. 메인 프로필 윈도우 (기울어진 카오스 카드) */}
        <section className="w-full bg-[#fcf8ec] pixel-border-thick pixel-shadow-lg p-5 sm:p-7 relative -rotate-1 transition-transform hover:rotate-0 duration-200">
          
          {/* 상단 윈도우 바 */}
          <div className="border-b-4 border-[#1b2612] -mx-5 -mt-5 mb-5 px-4 py-2 bg-[#8eed32] text-[#1b2612] flex justify-between items-center font-bold text-xs sm:text-sm">
            <span className="flex items-center gap-1.5">
              <span>🍄</span> USER_PROFILE: NA_JIWOO
            </span>
            <span className="text-[11px] bg-[#1b2612] text-[#8eed32] px-2 py-0.5 font-mono">
              LEVEL 99 DESIGNER
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* 픽셀 아바타 (자연 모자 쓴 인터랙티브 캐릭터) */}
            <div className="relative group shrink-0">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  sfx.playBlip(700, "square", 0.08);
                  setAvatarFace((prev) => (prev === "happy" ? "cool" : prev === "cool" ? "chaos" : "happy"));
                }}
                className="w-28 h-28 sm:w-32 sm:h-32 bg-[#e5dab9] pixel-border-thick pixel-shadow flex flex-col items-center justify-center cursor-pointer hover:bg-[#b8f038] transition-colors relative"
              >
                {/* 픽셀 아트 모티브 캐릭터 그래픽 */}
                <div className="text-5xl sm:text-6xl animate-pixel-bounce">
                  {avatarFace === "happy" ? "🧑‍🌾" : avatarFace === "cool" ? "😎" : "🤪"}
                </div>
                <div className="absolute bottom-1 bg-[#1b2612] text-[#b8f038] text-[9px] px-1 font-mono tracking-widest uppercase">
                  TAP TO CHANGE!
                </div>
              </div>
              <div className="absolute -bottom-2 -left-2 bg-[#1b2612] text-white text-[10px] px-2 py-0.5 font-bold rotate-[-8deg] pixel-border-sm">
                ← 진짜 나임!
              </div>
            </div>

            {/* 과장되고 장난스러운 타이포그래피 영역 */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-block bg-[#1b2612] text-[#8eed32] px-2 py-0.5 text-xs font-mono font-bold mb-1.5 -rotate-2">
                # VISUAL & BRAND DESIGNER
              </div>

              {/* 글자마다 삐뚤빼뚤 춤추는 이름 */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1b2612] flex justify-center sm:justify-start items-baseline gap-1 my-1">
                <span className="inline-block -rotate-6 text-[#1b2612] hover:text-[#e76f51] transition-colors">나</span>
                <span className="inline-block rotate-3 text-[#3a4d25] hover:text-[#b8f038] transition-colors">지</span>
                <span className="inline-block -rotate-3 text-[#1b2612] hover:text-[#e76f51] transition-colors">우</span>
                <span className="text-base sm:text-lg text-[#647b34] font-mono ml-2">/ JIWOO NA</span>
              </h1>

              {/* 강렬한 대비의 한 줄 카피 배너 */}
              <div className="mt-2 bg-[#b8f038] text-[#1b2612] px-3 py-1 font-extrabold text-xs sm:text-sm pixel-border-sm pixel-shadow-sm inline-block rotate-1">
                "픽셀 하나하나 손수 깎아 본질을 만듭니다!"
              </div>

              {/* 소개글 픽셀 양피지 박스 */}
              <div className="mt-3.5 p-3 bg-[#e8dfc5] pixel-border-sm text-[#1b2612] text-xs sm:text-sm leading-relaxed font-sans">
                <p className="break-keep font-medium">
                  자연의 비정형 곡선과 픽셀의 디지털 질서를 뒤섞는 시각 디자이너 나지우입니다. 
                  틀에 갇힌 반듯함보다는, <strong>살아 숨쉬는 인간미와 위트 있는 시각 경험</strong>을 짓습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 태그 모음 (제각기 기울어진 스티커들) */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t-3 border-dashed border-[#cbb994] justify-center sm:justify-start">
            {[
              { text: "#브랜딩", color: "bg-[#ffd166] text-[#1b2612] rotate-2" },
              { text: "#픽셀아트", color: "bg-[#8eed32] text-[#1b2612] -rotate-3" },
              { text: "#타이포그래피", color: "bg-[#e76f51] text-white rotate-1" },
              { text: "#카오스_레이아웃", color: "bg-[#2a9d8f] text-white -rotate-2" },
              { text: "#인간미100%", color: "bg-[#f4a261] text-[#1b2612] rotate-3" },
            ].map((tag) => (
              <span
                key={tag.text}
                className={`${tag.color} px-2.5 py-1 text-xs font-bold pixel-border-sm pixel-shadow-sm hover:rotate-0 hover:scale-110 transition-transform cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation();
                  sfx.playCoin();
                }}
              >
                {tag.text}
              </span>
            ))}
          </div>
        </section>

        {/* 4. 재미있는 인터랙션 섹션: 식물 키우기 & 영감 슬롯 (극단적 대비의 2열) */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 인터랙션 1: 자연 충전소 (식물 물주기 게임) */}
          <div className="bg-[#3a4d25] text-[#f5eedb] p-4 pixel-border-thick pixel-shadow rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between border-b-2 border-[#b8f038] pb-1.5 mb-2.5">
              <span className="font-bold text-xs text-[#b8f038] flex items-center gap-1">
                <span>💧</span> 픽셀 정원 가꾸기
              </span>
              <span className="text-[11px] font-mono bg-[#1b2612] text-[#b8f038] px-1.5 py-0.5">
                LV.{currentPlant.level}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-4xl sm:text-5xl animate-pixel-bounce p-1 bg-[#233118] pixel-border-sm">
                {currentPlant.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-[#8eed32]">{currentPlant.name}</div>
                <div className="text-[11px] text-[#e5dab9] leading-tight mt-0.5">{currentPlant.desc}</div>
                <div className="text-[10px] text-[#b8f038] font-mono mt-1">
                  물 준 횟수: {waterCount}회 💦
                </div>
              </div>
            </div>

            <button
              onClick={handleWater}
              className="mt-3 w-full py-2 bg-[#b8f038] text-[#1b2612] font-extrabold text-xs pixel-border-sm pixel-shadow-sm hover:bg-[#8eed32] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
            >
              <span>💦</span> [CLIK!] 물 주기 (성장시키기)
            </button>
          </div>

          {/* 인터랙션 2: 영감 주사위 슬롯머신 */}
          <div className="bg-[#ffd166] text-[#1b2612] p-4 pixel-border-thick pixel-shadow -rotate-2 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between border-b-2 border-[#1b2612] pb-1.5 mb-2.5">
              <span className="font-bold text-xs flex items-center gap-1">
                <span>🎲</span> 디자이너 영감 슬롯
              </span>
              <span className="text-[10px] bg-[#1b2612] text-[#ffd166] px-1.5 py-0.5 font-bold">
                RANDOM
              </span>
            </div>

            <div className="min-h-[56px] flex items-center p-2.5 bg-white pixel-border-sm text-xs font-bold leading-relaxed break-keep">
              {INSPIRATION_QUOTES[currentQuoteIdx]}
            </div>

            <button
              onClick={handleRollInspiration}
              className="mt-3 w-full py-2 bg-[#1b2612] text-[#ffd166] font-extrabold text-xs pixel-border-sm pixel-shadow-sm hover:bg-[#3a4d25] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
            >
              <span>🎲</span> 다른 영감 뽑기! [ROLL]
            </button>
          </div>
        </section>

        {/* 5. 혼란스러운 링크 목록 (각각 다른 각도로 삐뚤빼뚤 튀어나온 카드들) */}
        <section className="w-full flex flex-col gap-3.5 mt-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs sm:text-sm font-extrabold bg-[#1b2612] text-[#b8f038] px-2.5 py-1 pixel-border-sm rotate-1">
              📂 MY_FAVORITE_LINKS.LNK
            </span>
            <span className="text-xs font-mono text-[#3a4d25] font-bold">
              (터치하면 즉시 이동 🚀)
            </span>
          </div>

          {/* 링크 1: 포트폴리오 */}
          <a
            href="https://behance.net"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sfx.playCoin()}
            className="group relative block p-4 bg-[#b8f038] text-[#1b2612] pixel-border-thick pixel-shadow-lg -rotate-1 hover:rotate-0 hover:scale-[1.02] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl group-hover:scale-125 transition-transform">🎨</span>
                <div>
                  <div className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                    BEHANCE PORTFOLIO
                    <span className="text-[10px] bg-[#1b2612] text-white px-1.5 py-0.5">BEST!</span>
                  </div>
                  <div className="text-xs text-[#2a3c1a] font-medium font-sans">
                    정성스럽게 깎아둔 시각 & 브랜드 디자인 모음집
                  </div>
                </div>
              </div>
              <span className="text-xl font-extrabold group-hover:translate-x-1 transition-transform">▶▶</span>
            </div>
            <div className="absolute -top-2.5 right-6 bg-[#e76f51] text-white text-[10px] font-bold px-2 py-0.5 pixel-border-sm rotate-3">
              ★ 강력 추천
            </div>
          </a>

          {/* 링크 2: 인스타그램 아카이브 */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sfx.playCoin()}
            className="group relative block p-4 bg-[#fcf8ec] text-[#1b2612] pixel-border-thick pixel-shadow-lg rotate-2 hover:rotate-0 hover:scale-[1.02] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl group-hover:rotate-12 transition-transform">📸</span>
                <div>
                  <div className="text-base sm:text-lg font-extrabold tracking-tight">
                    INSTAGRAM ARCHIVE
                  </div>
                  <div className="text-xs text-[#55693c] font-medium font-sans">
                    매일매일 채집하는 자연과 그래픽 디자인 낙서장
                  </div>
                </div>
              </div>
              <span className="text-xl font-extrabold text-[#647b34] group-hover:translate-x-1 transition-transform">▶▶</span>
            </div>
          </a>

          {/* 링크 3: 이력서 / 노션 */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sfx.playCoin();
              alert("📄 이력서 및 포트폴리오 PDF가 준비 중입니다! 곧 업데이트됩니다 🌱");
            }}
            className="group relative block p-4 bg-[#e5dab9] text-[#1b2612] pixel-border-thick pixel-shadow-lg -rotate-2 hover:rotate-0 hover:scale-[1.02] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl group-hover:scale-110 transition-transform">📄</span>
                <div>
                  <div className="text-base sm:text-lg font-extrabold tracking-tight">
                    RESUME & WORK HISTORY
                  </div>
                  <div className="text-xs text-[#4b5e28] font-medium font-sans">
                    작업 프로세스 및 디자이너의 경력 기술서
                  </div>
                </div>
              </div>
              <span className="text-xl font-extrabold text-[#1b2612] group-hover:translate-x-1 transition-transform">▶▶</span>
            </div>
            <div className="absolute -bottom-2 right-8 bg-[#ffd166] text-[#1b2612] text-[10px] font-bold px-2 py-0.5 pixel-border-sm rotate-[-4deg]">
              다운로드 가능
            </div>
          </a>

          {/* 링크 4: 협업 & 이메일 문의 */}
          <a
            href="mailto:contact@jiwoo.design"
            onClick={() => sfx.playWater()}
            className="group relative block p-4 bg-[#233118] text-[#b8f038] pixel-border-thick pixel-shadow-lg rotate-1 hover:rotate-0 hover:scale-[1.02] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl group-hover:animate-pixel-bounce">✉️</span>
                <div>
                  <div className="text-base sm:text-lg font-extrabold tracking-tight text-[#8eed32]">
                    PROJECT COLLABORATION
                  </div>
                  <div className="text-xs text-[#e5dab9] font-medium font-sans">
                    외주 의뢰, 협업 프로젝트, 커피챗 언제든 환영해요!
                  </div>
                </div>
              </div>
              <span className="text-xl font-extrabold text-[#b8f038] group-hover:translate-x-1 transition-transform">▶▶</span>
            </div>
          </a>
        </section>

        {/* 6. 재미있는 인간미 낙서 푸터 */}
        <footer className="w-full mt-6 p-4 bg-[#e8dfc5] pixel-border-sm text-center text-xs font-mono text-[#3a4d25] relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1b2612] text-[#b8f038] px-3 py-0.5 text-[11px] font-bold pixel-border-sm">
            🌾 END OF FILE 🌾
          </div>
          <p className="mt-1 font-bold">
            © 2026 NA JIWOO. HANDMADE WITH 💚 & PIXELS.
          </p>
          <p className="text-[10px] text-[#647b34] mt-1">
            "버그 없는 세상보다 재미있는 오류가 있는 세상을 사랑합니다."
          </p>
        </footer>

      </div>
    </div>
  );
}
