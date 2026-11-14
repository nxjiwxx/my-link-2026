import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "미리보기 | MyPortfolio",
  description: "포트폴리오 페이지가 방문자에게 어떻게 보이는지 미리 확인합니다.",
  alternates: { canonical: "/preview" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "미리보기 | MyPortfolio",
    description: "포트폴리오 페이지가 방문자에게 어떻게 보이는지 미리 확인합니다.",
    url: "/preview",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "미리보기 | MyPortfolio",
    description: "포트폴리오 페이지가 방문자에게 어떻게 보이는지 미리 확인합니다.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
