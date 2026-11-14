import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로필 편집 | MyPortfolio",
  description: "프로필 정보와 경력, 스킬을 편집합니다.",
  alternates: { canonical: "/profile/edit" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "프로필 편집 | MyPortfolio",
    description: "프로필 정보와 경력, 스킬을 편집합니다.",
    url: "/profile/edit",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "프로필 편집 | MyPortfolio",
    description: "프로필 정보와 경력, 스킬을 편집합니다.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
