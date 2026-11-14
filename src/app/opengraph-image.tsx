import { ImageResponse } from "next/og";
import { OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, loadLocalOgFonts } from "@/lib/og";

export const alt = "My Portfolio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpenGraphImage() {
  const fonts = await loadLocalOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#FFFFFF",
          fontFamily: "Pretendard, sans-serif",
          padding: "0 100px",
        }}
      >
        {/* 서비스 로고 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: OG_COLORS.navy900,
              letterSpacing: "-0.03em",
            }}
          >
            myportfolio
          </span>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={OG_COLORS.orange}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>

        {/* 메인 타이틀 : My Portfolio */}
        <div
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 108,
            fontWeight: 800,
            color: OG_COLORS.navy900,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            marginBottom: 28,
            display: "flex",
          }}
        >
          My Portfolio
        </div>

        {/* 서브 타이틀 : 나만의 포폴 링크를 큐레이션하다. */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: OG_COLORS.navy700,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          <span>나만의 포폴 링크를&nbsp;</span>
          <span style={{ color: OG_COLORS.orange }}>큐레이션</span>
          <span>하다.</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
