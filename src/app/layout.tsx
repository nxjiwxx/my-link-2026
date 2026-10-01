import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이도현 (@dohyun) | 마이링크 (MyLink) 포트폴리오",
  description: "Product & Visual Designer 이도현의 올인원 포트폴리오 아카이빙 페이지입니다. 프로젝트 케이스 스터디 및 이력서를 확인하세요.",
  openGraph: {
    title: "이도현 (@dohyun) | Product & Visual Designer 포트폴리오",
    description: "사용자 경험과 심미성의 균형을 탐구하는 4년차 프로덕트 디자이너 이도현입니다.",
    type: "profile",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F2F4F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F2F4F6] text-[#191F28] antialiased selection:bg-[#3182F6] selection:text-white">
        {children}
      </body>
    </html>
  );
}
