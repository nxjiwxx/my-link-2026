---
version: 2.0.0
name: MyPortfolio Design System
description: 마이포폴(MyPortfolio) 공식 디자인 시스템 — 딥 네이비(80%)의 신뢰감과 묵직한 타이포그래피를 베이스로, 선셋 오렌지(20%)의 감각적인 크리에이터 포인트를 결합한 디자이너 특화 올인원 포트폴리오 아카이빙 플랫폼 디자인 가이드.

colors:
  # Primary Brand (20% 포인트 컬러)
  primary: "#FF5A36"              # Sunset Orange — 메인 브랜드 액센트, CTA, 화살표 포인트
  primary-hover: "#E84E2B"        # Pressed / Hover Orange
  primary-weak: "#FFF2EE"         # Soft Orange Surface / Badge Background
  
  # Secondary Brand (네이비 컬러 시스템)
  secondary: "#0A192F"            # Deep Navy — 보조 버튼, 묵직한 구조체, 로고
  secondary-hover: "#1E293B"      # Pressed / Hover Navy
  on-secondary: "#ffffff"         # Text on Secondary

  # Base & Text (80% 주조색)
  navy-900: "#0A192F"             # Deepest Navy — 메인 디스플레이 타이틀, 묵직한 버튼, 로고
  navy-800: "#1E293B"             # Navy Slate — 서브헤드라인, 주요 텍스트
  navy-700: "#334155"             # Secondary Text — 본문 강조
  navy-600: "#475569"             # Body Text — 기본 본문 텍스트
  navy-500: "#64748B"             # Muted Text — 설명문, 서브 메타데이터
  navy-400: "#94A3B8"             # Captions & Footers — 푸터, 약관 텍스트
  
  # Canvas & Surface
  canvas: "#ffffff"               # Pure White — 메인 캔버스 (카드 박스 스타일 배제)
  surface-subtle: "#F8FAFC"       # Very Soft Surface — 배경 칩, 필터 탭
  surface-muted: "#F1F5F9"        # Muted Surface — 디바이더, 구분선
  border-subtle: "#E2E8F0"        # Hairline Border — 얇고 정갈한 경계선
  
  # Semantic Accents
  accent-green: "#04C05E"         # Success / Active status
  accent-red: "#F04452"           # Danger / Remove

typography:
  display-hero:
    fontFamily: "Syne, sans-serif"
    fontSize: "96px"
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: "-0.04em"
    use: "히어로 메인 타이틀 (My Portfolio)"
  title-display:
    fontFamily: "Syne, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    letterSpacing: "-0.02em"
    use: "앱 로고타입 (myportfolio)"
  heading-hero-sub:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.2
    use: "히어로 서브 타이틀 (나만의 포폴 링크를 큐레이션하다)"
  heading-1:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "48px"
    fontWeight: 900
    lineHeight: 1.15
    use: "대단락 섹션 헤더 (On what we offer / For all creators)"
  heading-2:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
    use: "핵심 기능 타이틀 (3분 초간편 아카이빙 등)"
  body-lg:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
    use: "히어로 리드문"
  body-md:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    use: "기본 본문 텍스트"
  body-sm:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    use: "카드 설명, 서브 텍스트"
  caption:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    use: "뱃지, 캡션, 메타 정보"

rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  section: "96px"
---

# 마이포폴 (MyPortfolio) — 디자인 시스템 가이드

## 1. 개요 및 디자인 철학 (Design Philosophy)
**마이포폴 (MyPortfolio)**은 디자이너와 크리에이터의 작업물이 가장 돋보이도록 설계된 올인원 포트폴리오 아카이빙 플랫폼입니다.

- **80:20 배색의 미학**: 80%의 **딥 네이비 (`#0A192F`)**가 서비스의 신뢰도와 묵직한 타이포그래피의 중심을 잡고, 20%의 **선셋 오렌지 (`#FF5A36`)**가 창의적인 크리에이터의 에너지를 시각적 포인트로 전달합니다.
- **오픈 캔버스 (Open Canvas)**: 답답한 카드 박스(Box) 형태를 걷어내고, 여백과 텍스트 위계 중심의 미니멀하고 자유로운 레이아웃을 지향합니다.
- **감각적인 타이포그래피 (Sensory Typography)**: 브랜드 로고 및 영문 대형 디스플레이 타이틀에는 기하학적 형태미가 돋보이는 `Syne` 폰트를, 국문 헤드라인과 본문 전반에는 완벽한 가독성의 `Pretendard` 가변 폰트를 조합합니다.

---

## 2. 컬러 시스템 (Color System)

### 2.1 메인 컬러 팔레트 (Primary & Base)
| 토큰명 | Hex | 비율 | 역할 및 용도 |
| :--- | :--- | :--- | :--- |
| **선셋 오렌지 (Sunset Orange)** | `#FF5A36` | **20%** | 브랜드 포인트, 메인 CTA 버튼(하단), 로고 화살표, 텍스트 하이라이트 |
| **선셋 호버 (Sunset Hover)** | `#E84E2B` | - | 오렌지 버튼 인터랙션 호버 상태 |
| **소프트 오렌지 (Soft Orange)** | `#FFF2EE` | - | 인디케이터 배지 배경, 활성화 칩 서피스 |
| **딥 네이비 (Deep Navy)** | `#0A192F` | **80%** | 메인 디스플레이 타이틀, 헤더/히어로 CTA 버튼, 묵직한 구조체 |
| **네이비 슬레이트 (Navy Slate)** | `#1E293B` | - | 서브타이틀, 주요 헤드라인 |
| **네이비 그레이 (Navy Grey)** | `#475569` | - | 기본 본문 텍스트, 설명문 |
| **뮤티드 슬레이트 (Muted Slate)** | `#94A3B8` | - | 푸터 저작권, 약관 문구, 비활성 텍스트 |
| **순수 화이트 (Pure White)** | `#FFFFFF` | - | 기본 캔버스 배경 (카드 박스 없음) |

---

## 3. 타이포그래피 계층 (Typography Scale)

| 레벨 | 폰트 패밀리 | 웨이트 & 크기 | 사용처 |
| :--- | :--- | :--- | :--- |
| **Hero Display H1** | `Syne` | **ExtraBold (800)** · 48px~128px | 메인 히어로 타이틀 (**My Portfolio**) |
| **Brand Logo** | `Syne` | **ExtraBold (800)** · 24px~30px | 서비스 로고타입 (**myportfolio ↗**) |
| **Hero Subtitle** | `Pretendard` | **Bold (700)** · 24px~36px | 히어로 서브 카피 (**나만의 포폴 링크를 큐레이션하다.**) |
| **Section H2** | `Pretendard` | **Black (900)** · 32px~56px | 섹션 대제목 (**On what we offer**, **For all creators**) |
| **Feature H3** | `Pretendard` | **Bold (700)** · 20px~28px | 핵심 기능 제목 (**3분 초간편 아카이빙**, **그리드 & 리스트 뷰**) |
| **Body Text** | `Pretendard` | **Regular (400)** · 14px~16px | 기능 설명문 및 본문 텍스트 |
| **Badge / Caption** | `Pretendard` | **SemiBold (600)** · 11px~13px | 인디케이터 배지, 태그 칩 |

---

## 4. UI 컴포넌트 원칙 (Component Principles)

1. **CTA 버튼 (Call To Action)**:
   - **히어로 중앙 CTA**: 딥 네이비 솔리드 (`bg-[#0A192F] text-white`)로 묵직한 집중감 형성 (내부 아이콘도 화이트로 일체화).
   - **하단 최종 전환 CTA**: 선셋 오렌지 솔리드 (`bg-[#FF5A36] text-white`)로 강렬한 행동 유도.
   - **상단 헤더**: 번잡함을 줄이기 위해 우측 CTA 버튼을 배제하고 브랜드 로고와 메타 정보에 집중.
2. **오픈 캔버스 & 텍스트 위계**:
   - 네모난 카드 박스 테두리를 사용하지 않고, 큼직한 기하학 심볼과 시원한 여백으로 정보 블록을 구성.
3. **선셋 오렌지 하이라이트**:
   - 서브 카피 내의 핵심 단어("큐레이션")에 선셋 오렌지 웨이비 밑줄을 더해 시각적 리듬감 부여.
