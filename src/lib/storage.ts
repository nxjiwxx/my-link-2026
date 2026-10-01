import { ProfileData, LinkItem } from '@/types/profile';

export const STORAGE_KEY = 'mylink_profile_data';

export const DUMMY_LINKS: LinkItem[] = [
  {
    id: 'link-1',
    type: 'link',
    title: '성수 쇼룸 팝업 사전 예약하기',
    subtitle: '네이버 단독 예약 & 현장 10% 추가 할인 쿠폰 증정',
    url: 'https://booking.naver.com/booking/popup-sample',
    icon: 'Calendar',
    category: 'event',
    badge: '사전예약',
    isActive: true,
    orderIndex: 1,
  },
  {
    id: 'link-2',
    type: 'link',
    title: '2026 S/S 단독 최저가 공동구매 마켓',
    subtitle: '오픈 3일간 무료배송 & 한정 수량 패키지',
    url: 'https://smartstore.naver.com/sample-market',
    icon: 'ShoppingBag',
    category: 'shopping',
    badge: 'BEST',
    isActive: true,
    orderIndex: 2,
  },
  {
    id: 'link-3',
    type: 'link',
    title: '유튜브 | 봄 맞이 룸투어 & 데스크테리어 VLOG',
    subtitle: '매주 목요일 저녁 8시 신규 영상 업로드',
    url: 'https://youtube.com/@sample_creator',
    icon: 'Youtube',
    category: 'media',
    badge: 'NEW',
    isActive: true,
    orderIndex: 4,
  },
  {
    id: 'link-4',
    type: 'link',
    title: '인스타그램 공식 데일리 피드',
    subtitle: '@sample_creator · 일상 및 비하인드 컷',
    url: 'https://instagram.com/sample_creator',
    icon: 'Instagram',
    category: 'social',
    isActive: true,
    orderIndex: 5,
  },
  {
    id: 'link-5',
    type: 'link',
    title: '비즈니스 제휴 및 강연·협업 문의',
    subtitle: 'contact@creator-sample.kr (확인 후 24시간 내 회신)',
    url: 'mailto:contact@creator-sample.kr',
    icon: 'Mail',
    category: 'contact',
    isActive: true,
    orderIndex: 8,
  },
  {
    id: 'link-6',
    type: 'link',
    title: '노션(Notion) 작업물 포트폴리오 & 이력서',
    subtitle: '브랜드 디자인 프로젝트 아카이브 및 경력 소개',
    url: 'https://notion.so/sample-portfolio',
    icon: 'FileText',
    category: 'media',
    isActive: true,
    orderIndex: 9,
  },
];

export const INITIAL_PROFILE_DATA: ProfileData = {
  handle: 'seoyun',
  displayName: '박서윤',
  subTitle: 'SEO YUN · 뷰티 & 라이프스타일 크리에이터',
  bio: '성수동 쇼룸 팝업 & 데일리 뷰티/패션 큐레이션 ✨\n공구 일정과 쇼룸 위치를 한곳에서 확인하세요.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  isVerified: true,
  socialLinks: {
    instagram: 'https://instagram.com/sample_creator',
    youtube: 'https://youtube.com/@sample_creator',
    tiktok: 'https://tiktok.com/@sample_creator',
    email: 'contact@creator-sample.kr',
  },
  theme: {
    preset: 'toss_light',
    buttonStyle: 'rounded',
    buttonVariant: 'solid',
    fontFamily: 'Pretendard',
  },
  blocks: [
    {
      id: 'text-1',
      type: 'text',
      title: '공지사항',
      content: '📢 2026 S/S 시즌 성수 쇼룸 팝업 & 온라인 마켓이 오픈되었습니다! 사전 예약 시 10% 추가 혜택을 드려요.',
      align: 'left',
      badge: '공지',
      isActive: true,
      orderIndex: 0,
    },
    {
      id: 'link-1',
      type: 'link',
      title: '성수 쇼룸 팝업 사전 예약하기',
      subtitle: '네이버 단독 예약 & 현장 10% 추가 할인 쿠폰 증정',
      url: 'https://booking.naver.com/booking/popup-sample',
      icon: 'Calendar',
      category: 'event',
      badge: '사전예약',
      isActive: true,
      orderIndex: 1,
    },
    {
      id: 'link-2',
      type: 'link',
      title: '2026 S/S 단독 최저가 공동구매 마켓',
      subtitle: '오픈 3일간 무료배송 & 한정 수량 패키지',
      url: 'https://smartstore.naver.com/sample-market',
      icon: 'ShoppingBag',
      category: 'shopping',
      badge: 'BEST',
      isActive: true,
      orderIndex: 2,
    },
    {
      id: 'banner-1',
      type: 'banner',
      title: '2026 S/S 컬렉션 화보 보러가기',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      targetUrl: 'https://smartstore.naver.com/sample-market',
      altText: '2026 S/S 컬렉션 화보 룩북',
      badge: 'LOOKBOOK',
      isActive: true,
      orderIndex: 3,
    },
    {
      id: 'link-3',
      type: 'link',
      title: '유튜브 | 봄 맞이 룸투어 & 데스크테리어 VLOG',
      subtitle: '매주 목요일 저녁 8시 신규 영상 업로드',
      url: 'https://youtube.com/@sample_creator',
      icon: 'Youtube',
      category: 'media',
      badge: 'NEW',
      isActive: true,
      orderIndex: 4,
    },
    {
      id: 'video-1',
      type: 'video',
      title: '이번 주 추천 룸투어 VLOG 🎬',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: '인테리어 소품과 따스한 봄 무드 데스크테리어 팁',
      isActive: true,
      orderIndex: 5,
    },
    {
      id: 'calendar-1',
      type: 'calendar',
      title: '팝업스토어 & 공구 일정 캘린더',
      defaultView: 'calendar',
      isActive: true,
      orderIndex: 6,
      events: [
        {
          id: 'ev-1',
          title: '2026 S/S 단독 뷰티 마켓 오픈',
          category: 'collab',
          date: '2026-10-05',
          time: '19:00',
          description: '스마트스토어 단독 3일간 무료배송 & 사은품 증정',
          linkUrl: 'https://smartstore.naver.com/sample-market',
        },
        {
          id: 'ev-2',
          title: '인스타 라이브 Q&A & 룩북 소개',
          category: 'live',
          date: '2026-10-08',
          time: '20:30',
          description: '신상 착장 라이브 시연 및 실시간 쿠폰 추첨',
          linkUrl: 'https://instagram.com/sample_creator',
        },
        {
          id: 'ev-3',
          title: '성수 쇼룸 플래그십 팝업 위크',
          category: 'event',
          date: '2026-10-12',
          time: '11:00 - 20:00',
          description: '성수동 쇼룸 오프라인 방문객 선착순 굿즈 증정',
          linkUrl: 'https://booking.naver.com/booking/popup-sample',
        },
      ],
    },
    {
      id: 'map-1',
      type: 'map',
      title: '성수 쇼룸 팝업 오시는 길',
      isActive: true,
      orderIndex: 7,
      mapInfo: {
        placeName: '스튜디오 서윤 성수 쇼룸',
        address: '서울 성동구 연무장길 45 (성수동2가)',
        detailAddress: '지하철 2호선 성수역 3번 출구 도보 5분',
        lat: 37.5445,
        lng: 127.0560,
        kakaoMapUrl: 'https://map.kakao.com/link/to/스튜디오서윤성수쇼룸,37.5445,127.0560',
        openingHours: '화-일 12:00 ~ 20:00 (월요일 휴무)',
        contact: '02-1234-5678',
      },
    },
    {
      id: 'link-4',
      type: 'link',
      title: '인스타그램 공식 데일리 피드',
      subtitle: '@sample_creator · 일상 및 비하인드 컷',
      url: 'https://instagram.com/sample_creator',
      icon: 'Instagram',
      category: 'social',
      isActive: true,
      orderIndex: 8,
    },
    {
      id: 'link-5',
      type: 'link',
      title: '비즈니스 제휴 및 강연·협업 문의',
      subtitle: 'contact@creator-sample.kr (확인 후 24시간 내 회신)',
      url: 'mailto:contact@creator-sample.kr',
      icon: 'Mail',
      category: 'contact',
      isActive: true,
      orderIndex: 9,
    },
    {
      id: 'link-6',
      type: 'link',
      title: '노션(Notion) 작업물 포트폴리오 & 이력서',
      subtitle: '브랜드 디자인 프로젝트 아카이브 및 경력 소개',
      url: 'https://notion.so/sample-portfolio',
      icon: 'FileText',
      category: 'media',
      isActive: true,
      orderIndex: 10,
    },
  ],
};

/**
 * SSR 안전하게 localStorage에서 프로필 데이터를 조회합니다.
 * 저장된 데이터가 없으면 초기 Mock 데이터를 저장 후 반환합니다.
 */
export function getProfileData(): ProfileData {
  if (typeof window === 'undefined') {
    return INITIAL_PROFILE_DATA;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFILE_DATA));
      return INITIAL_PROFILE_DATA;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    console.error('Failed to load profile data from localStorage:', error);
    return INITIAL_PROFILE_DATA;
  }
}

/**
 * 로컬스토리지에 프로필 데이터를 저장합니다.
 */
export function saveProfileData(data: ProfileData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save profile data to localStorage:', error);
  }
}

/**
 * 기본 Mock 데이터로 초기화합니다.
 */
export function resetProfileData(): ProfileData {
  if (typeof window === 'undefined') return INITIAL_PROFILE_DATA;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFILE_DATA));
  } catch (error) {
    console.error('Failed to reset profile data in localStorage:', error);
  }
  return INITIAL_PROFILE_DATA;
}
