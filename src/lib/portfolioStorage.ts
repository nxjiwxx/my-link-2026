import { DesignerProfileData } from '@/types/portfolio';

export const STORAGE_KEY = 'mylink_designer_portfolio';

export const INITIAL_DESIGNER_PROFILE: DesignerProfileData = {
  handle: 'dohyun',
  name: '이도현',
  roleTitle: 'Product & Visual Designer',
  bio: '사용자 경험과 심미성의 균형을 탐구하는 4년차 프로덕트 디자이너입니다.\n복잡한 문제를 직관적인 비주얼 시스템으로 해결합니다.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  resumePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  socialLinks: {
    behance: 'https://behance.net/sample_designer',
    linkedin: 'https://linkedin.com/in/sample_designer',
    github: 'https://github.com/sample_designer',
    instagram: 'https://instagram.com/sample_designer',
    dribbble: 'https://dribbble.com/sample_designer',
    email: 'dohyun.design@sample.kr',
  },
  skills: [
    'Figma',
    'Protopie',
    'Adobe CC',
    'Blender 3D',
    'Design System',
    'React & CSS',
  ],
  toolProficiencies: [
    {
      name: 'Figma',
      level: 95,
      experience: '디자인 시스템 & 오토레이아웃 마스터',
      iconKey: 'figma',
    },
    {
      name: 'Protopie',
      level: 88,
      experience: '센서 & 변수 연동 마이크로 인터랙션',
      iconKey: 'protopie',
    },
    {
      name: 'Adobe CC (Ps/Ai)',
      level: 90,
      experience: '브랜딩 에셋 & 고해상도 그래픽',
      iconKey: 'adobe',
    },
    {
      name: 'Blender 3D',
      level: 78,
      experience: '글래스모피즘 & 3D 에셋 모델링',
      iconKey: 'blender',
    },
    {
      name: 'React & CSS',
      level: 72,
      experience: '컴포넌트 설계 및 프론트엔드 협업',
      iconKey: 'react',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Toss 클론 디자인 시스템 & 모바일 뱅킹 UX',
      category: 'uiux',
      categoryLabel: 'UI/UX Design',
      projectType: 'solo',
      projectTypeLabel: '개인 프로젝트',
      summary: '토스 디자인 시스템(TDS) 가이드라인 기반의 결제 및 송금 마이크로 인터랙션 재설계',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      detailImages: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      ],
      period: '2026.01 ~ 2026.03',
      role: 'Lead Product Designer (기여도 100%)',
      tools: ['Figma', 'Protopie'],
      description: '토스의 핵심 철학인 "은행에 다니는 유능한 친구" 톤앤매너를 반영하여 복잡한 송금 절차를 2개 스텝으로 단순화하고, 모바일 햅틱 피드백과 부드러운 스프링 인터랙션을 정교하게 프로토타이핑했습니다.\n\n디자인 시스템의 컴포넌트 변형(Variant) 구조를 확립하고 실제 앱 사용자와의 사용성 테스트(UT)를 거쳐 송금 오류율을 42% 감소시키는 인터랙션을 구축했습니다.',
      externalLink: {
        label: 'Figma 프로토타입 확인하기',
        url: 'https://figma.com/@sample-proto',
      },
      orderIndex: 0,
    },
    {
      id: 'proj-2',
      title: '성수 로스터리 카페 브랜딩 & 친환경 패키지',
      category: 'branding',
      categoryLabel: 'Branding',
      projectType: 'team',
      projectTypeLabel: '팀 프로젝트',
      summary: '성수동 스페셜티 커피 브랜드의 BI/CI 아이덴티티 및 100% 생분해 패키지 큐레이션',
      thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
      detailImages: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      ],
      period: '2025.10 ~ 2025.12',
      role: 'Brand Designer (디자이너 3인 중 리드, 기여도 85%)',
      tools: ['Illustrator', 'Photoshop'],
      description: '성수동의 붉은 벽돌과 원두의 유기적 곡선을 모티브로 심볼릭 타이포 로고타입을 개발했습니다. 브랜드 스토리북 및 커피 패키지, 굿즈 세트 전반을 일관된 미학으로 디렉팅했습니다.\n\n소이 잉크 인쇄 감리 및 친환경 크라프트 지기 구조 설계를 주도하여 성수 로컬 팝업에서 초도 물량 완판을 달성했습니다.',
      externalLink: {
        label: 'Behance 케이스스터디 보기',
        url: 'https://behance.net/gallery/sample-branding',
      },
      orderIndex: 1,
    },
    {
      id: 'proj-3',
      title: 'AI 기반 여행 플래너 모바일 앱 기획 & UI',
      category: 'uiux',
      categoryLabel: 'UI/UX Design',
      projectType: 'team',
      projectTypeLabel: '팀 프로젝트',
      summary: '사용자 맞춤형 일정 추천 및 실시간 동행 탐색 기능을 담은 차세대 여행 테크 앱',
      thumbnailUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
      detailImages: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      ],
      period: '2025.07 ~ 2025.09',
      role: 'UI Designer (기획자 1인, 개발자 2인, 디자이너 1인, 기여도 70%)',
      tools: ['Figma', 'React'],
      description: '복잡한 여행 동선을 드래그 앤 드롭으로 재배치하는 인터랙티브 캔버스 뷰를 디자인하여, 여행 일정 생성 완료율을 기존 대비 38% 향상시켰습니다.\n\n디자인 토큰 시스템을 도입하여 프론트엔드 개발자와의 핸드오프 소통 시간을 50% 단축시켰습니다.',
      externalLink: {
        label: 'Figma 프로토타입 확인하기',
        url: 'https://figma.com/@travel-ai-sample',
      },
      orderIndex: 2,
    },
    {
      id: 'proj-4',
      title: '3D 스플라인 인터랙티브 오브젝트 팩 30종',
      category: 'motion',
      categoryLabel: '3D / Motion',
      projectType: 'solo',
      projectTypeLabel: '개인 프로젝트',
      summary: '웹 및 모바일 앱 마이크로 인터랙션을 위한 글래스모피즘 3D 아이콘 에셋 세트',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      detailImages: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      ],
      period: '2025.04 ~ 2025.06',
      role: '3D Artist & Motion Designer (개인 작업, 기여도 100%)',
      tools: ['Blender 3D', 'Spline'],
      description: '반투명한 아크릴과 유리 질감을 수학적 굴절률(IOR)로 계산하여 Blender로 모델링하고, 웹 브라우저에서 60fps로 매끄럽게 돌아가는 Spline 에셋으로 최적화했습니다.\n\n마우스 호버 시 실시간 물리 반사가 일어나는 반응형 인터랙션을 완성했습니다.',
      externalLink: {
        label: 'Spline 3D 인터랙티브 뷰어',
        url: 'https://spline.design/sample-viewer',
      },
      orderIndex: 3,
    },
    {
      id: 'proj-5',
      title: '2026 타이포그래피 포스터 시리즈 [무한과 질서]',
      category: 'graphic',
      categoryLabel: 'Graphic Design',
      projectType: 'solo',
      projectTypeLabel: '개인 프로젝트',
      summary: '한글 모음과 라틴 활자의 조형적 균형을 실험한 6점의 아트워크 포스터 에디션',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
      detailImages: [
        'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      ],
      period: '2025.01 ~ 2025.03',
      role: 'Graphic Designer (개인 창작, 기여도 100%)',
      tools: ['InDesign', 'Illustrator'],
      description: '한글의 기하학적 그리드와 스위스 국제 타이포그래피 양식을 접목하여 서울 디자인 페스티벌 영디자이너 섹션에 전시된 포스터 연작입니다.\n\n활자의 획 두께와 네거티브 스페이스(여백)의 긴장감을 극대화했습니다.',
      externalLink: {
        label: 'Behance 케이스스터디 보기',
        url: 'https://behance.net/gallery/typography-poster-series',
      },
      orderIndex: 4,
    },
  ],
  careers: [
    {
      id: 'car-1',
      period: '2024 ~ Present',
      title: 'Senior Product Designer',
      organization: 'Viva Republica (Toss)',
      description: '토스 디자인 시스템(TDS) 컴포넌트 확장 및 결제/송금 도메인 사용자 경험 리드',
    },
    {
      id: 'car-2',
      period: '2022 ~ 2024',
      title: 'Product & Brand Designer',
      organization: 'Studio Vibe',
      description: '초기 스타트업 15개사 BI 구축 및 웹/모바일 MVP 제품 디자인 총괄',
    },
    {
      id: 'car-3',
      period: '2021',
      title: 'Korea Design Award 디지털 미디어 부문 은상',
      organization: '디자인하우스 (월간 디자인)',
      description: '인터랙티브 웹 다큐멘터리 프로젝트 디자인 수상',
    },
  ],
};

export function getDesignerProfile(): DesignerProfileData {
  if (typeof window === 'undefined') {
    return INITIAL_DESIGNER_PROFILE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DESIGNER_PROFILE));
      return INITIAL_DESIGNER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    // ensure toolProficiencies and projectType exist even if old cache exists
    if (!parsed.toolProficiencies || parsed.toolProficiencies.length === 0) {
      parsed.toolProficiencies = INITIAL_DESIGNER_PROFILE.toolProficiencies;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to get designer profile:', error);
    return INITIAL_DESIGNER_PROFILE;
  }
}

export function saveDesignerProfile(data: DesignerProfileData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save designer profile:', error);
  }
}

export function resetDesignerProfile(): DesignerProfileData {
  if (typeof window === 'undefined') return INITIAL_DESIGNER_PROFILE;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DESIGNER_PROFILE));
  } catch (error) {
    console.error('Failed to reset designer profile:', error);
  }
  return INITIAL_DESIGNER_PROFILE;
}
