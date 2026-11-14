import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통계 | MyPortfolio",
  description: "내 포트폴리오의 방문 및 클릭 통계를 확인합니다.",
  alternates: { canonical: "/stats" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "통계 | MyPortfolio",
    description: "내 포트폴리오의 방문 및 클릭 통계를 확인합니다.",
    url: "/stats",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "통계 | MyPortfolio",
    description: "내 포트폴리오의 방문 및 클릭 통계를 확인합니다.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
