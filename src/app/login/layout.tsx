import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 | MyPortfolio",
  description: "Google 계정으로 간편하게 로그인하고 나만의 포트폴리오를 관리하세요.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "로그인 | MyPortfolio",
    description: "Google 계정으로 간편하게 로그인하고 나만의 포트폴리오를 관리하세요.",
    url: "/login",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "로그인 | MyPortfolio",
    description: "Google 계정으로 간편하게 로그인하고 나만의 포트폴리오를 관리하세요.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
