import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "MyPortfolio | 디자이너를 위한 올인원 포트폴리오 아카이빙",
  description: "디자이너를 위한 올인원 포트폴리오 아카이빙 서비스입니다. 작업물 링크, 케이스 스터디 및 이력서를 간편하게 관리하세요.",
  openGraph: {
    title: "MyPortfolio | 디자이너 포트폴리오 아카이빙",
    description: "Google 로그인으로 나만의 작업물 링크와 포트폴리오를 클라우드에 안전하게 보관하세요.",
    type: "website",
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
      <body className="min-h-full flex flex-col bg-[#F2F4F6] text-[#191F28] antialiased selection:bg-[#FF5A36] selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
