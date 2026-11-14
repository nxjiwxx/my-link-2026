import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지 | MyPortfolio",
  description: "내 포트폴리오 링크와 프로젝트를 관리합니다.",
  alternates: { canonical: "/mypage" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "마이페이지 | MyPortfolio",
    description: "내 포트폴리오 링크와 프로젝트를 관리합니다.",
    url: "/mypage",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "마이페이지 | MyPortfolio",
    description: "내 포트폴리오 링크와 프로젝트를 관리합니다.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
