export type ProjectCategory = string;
export type ViewMode = 'grid' | 'list';
export type ProjectType = 'team' | 'solo';

export interface CategoryItem {
  id: string;
  label: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'uiux', label: 'UI/UX' },
  { id: 'branding', label: 'Branding' },
  { id: 'graphic', label: 'Graphic' },
  { id: 'motion', label: '3D/Motion' },
];

export interface SocialLinks {
  behance?: string;
  dribbble?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  instagram?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: ProjectCategory;
  categoryLabel: string; // 예: "UI/UX Design"
  projectType: ProjectType; // 'team' | 'solo'
  projectTypeLabel: string; // "팀 프로젝트" | "개인 프로젝트"
  summary: string;
  thumbnailUrl: string;
  detailImages?: string[];
  period: string; // 예: "2026.03 ~ 2026.05"
  role: string; // 예: "Product Lead (기여도 80%)"
  tools: string[]; // ["Figma", "Protopie"]
  description: string;
  externalLink?: {
    label: string; // 예: "Figma Prototype"
    url: string;
  };
  orderIndex: number;
}

export interface CareerItem {
  id: string;
  period: string; // 예: "2024 ~ Present"
  title: string; // 예: "Product Designer"
  organization: string; // 예: "Viva Republica (Toss)"
  description?: string;
}

export interface ToolProficiency {
  name: string;
  level: number; // 0 ~ 100%
  experience?: string; // 예: "고급 · 4년차"
  iconKey?: 'figma' | 'protopie' | 'adobe' | 'blender' | 'react';
}

export interface DesignerProfileData {
  handle: string; // "dohyun"
  name: string; // "이도현"
  roleTitle: string; // "Product & Visual Designer"
  bio: string; // "문제를 시각적으로 해결하는 4년차 프로덕트 디자이너입니다."
  avatarUrl: string;
  resumePdfUrl?: string; // 이력서 PDF 다운로드 링크
  socialLinks: SocialLinks;
  skills: string[]; // 태그 텍스트
  toolProficiencies: ToolProficiency[]; // 프로그레스 바 전용 도구 숙련도
  projects: ProjectItem[];
  careers: CareerItem[];
  categories?: CategoryItem[]; // 사용자가 추가한 커스텀 카테고리 포함
  customTools?: string[]; // 사용자가 추가한 커스텀 도구 목록 (추천용)
}
