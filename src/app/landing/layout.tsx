import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MyPortfolio 소개 | 디자이너 포트폴리오 아카이빙 서비스",
  description: "작업물 링크, 케이스 스터디, 이력서를 한곳에 모아 나만의 포트폴리오 페이지로 공유하세요.",
  alternates: { canonical: "/landing" },
  openGraph: {
    title: "MyPortfolio 소개 | 디자이너 포트폴리오 아카이빙 서비스",
    description: "작업물 링크, 케이스 스터디, 이력서를 한곳에 모아 나만의 포트폴리오 페이지로 공유하세요.",
    url: "/landing",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyPortfolio 소개 | 디자이너 포트폴리오 아카이빙 서비스",
    description: "작업물 링크, 케이스 스터디, 이력서를 한곳에 모아 나만의 포트폴리오 페이지로 공유하세요.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
