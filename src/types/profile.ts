export type BlockType = 'link' | 'video' | 'banner' | 'text' | 'calendar' | 'map';

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  email?: string;
  blog?: string;
}

export interface ThemeConfig {
  preset: 'toss_light' | 'modern_dark' | 'pastel_pink' | 'gradient_ocean';
  bgColor?: string;
  bgGradient?: string;
  buttonStyle: 'square' | 'rounded' | 'pill';
  buttonVariant: 'solid' | 'outline' | 'glass';
  fontFamily: 'Pretendard' | 'TossSans' | 'Serif';
}

export interface CalendarEventItem {
  id: string;
  title: string;
  category: 'collab' | 'live' | 'event' | 'notice';
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  linkUrl?: string;
  description?: string;
}

export interface MapMetadata {
  placeName: string;
  address: string;
  detailAddress?: string;
  lat: number;
  lng: number;
  kakaoMapUrl?: string;
  openingHours?: string;
  contact?: string;
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  title: string;
  isActive: boolean;
  orderIndex: number;
}

export interface LinkBlock extends BaseBlock {
  type: 'link';
  url: string;
  icon?: string;
  subtitle?: string;
  category?: 'shopping' | 'media' | 'social' | 'event' | 'contact';
  badge?: string;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  videoUrl: string; // YouTube URL
  description?: string;
}

export interface BannerBlock extends BaseBlock {
  type: 'banner';
  imageUrl: string;
  targetUrl: string;
  altText?: string;
  badge?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  align: 'left' | 'center';
  badge?: string;
}

export interface CalendarBlock extends BaseBlock {
  type: 'calendar';
  events: CalendarEventItem[];
  defaultView: 'calendar' | 'agenda';
}

export interface MapBlock extends BaseBlock {
  type: 'map';
  mapInfo: MapMetadata;
}

export type Block = LinkBlock | VideoBlock | BannerBlock | TextBlock | CalendarBlock | MapBlock;

export interface ProfileData {
  handle: string; // 예: "seoyun"
  displayName: string;
  subTitle?: string;
  bio: string;
  avatarUrl: string;
  isVerified?: boolean;
  socialLinks: SocialLinks;
  theme: ThemeConfig;
  blocks: Block[];
}

export interface LinkItem {
  id: string;
  type: 'link';
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  category?: 'shopping' | 'media' | 'social' | 'event' | 'contact';
  badge?: string;
  isActive: boolean;
  orderIndex: number;
}
