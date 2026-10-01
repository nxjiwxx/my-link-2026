import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나지우 🌱 픽셀 포레스트 마이링크",
  description: "픽셀 아트 & 자연 감성의 카오틱 비주얼 디자이너 프로필",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col font-pixel pixel-grid-bg text-[#1b2612] selection:bg-[#b8f038] selection:text-[#1b2612]">
        {children}
      </body>
    </html>
  );
}
