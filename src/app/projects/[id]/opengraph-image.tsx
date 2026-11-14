import { ImageResponse } from "next/og";
import {
  OG_COLORS,
  OG_CONTENT_TYPE,
  OG_SIZE,
  getOgProjectData,
  loadLocalOgFonts,
} from "@/lib/og";

export const dynamic = "force-dynamic";
export const alt = "My Portfolio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const project = await getOgProjectData(resolvedParams?.id || "project");
  const fonts = await loadLocalOgFonts();

  const userId = project.username || "designer";
  const initialChar = userId.slice(0, 1).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: OG_COLORS.navy900,
          fontFamily: "Pretendard, sans-serif",
          padding: "76px 100px",
        }}
      >
        {/* 상단: My Portfolio */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 34,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
            }}
          >
            My Portfolio
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

        {/* 중앙: 프로필 사진 + 메인 타이틀 ([userid] 의 Portfolio) */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 48,
          }}
        >
          {/* 프로필 사진 */}
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: 9999,
              overflow: "hidden",
              border: `4px solid ${OG_COLORS.orange}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: OG_COLORS.navy800,
              flexShrink: 0,
            }}
          >
            {project.avatarDataUrl ? (
              <img
                src={project.avatarDataUrl}
                alt={userId}
                width={170}
                height={170}
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 9999,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Syne, sans-serif",
                  fontSize: 76,
                  fontWeight: 800,
                }}
              >
                {initialChar}
              </div>
            )}
          </div>

          {/* 메인 타이틀 : [userid] 의 Portfolio */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontSize: 66,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <span>{userId}</span>
              <span style={{ color: OG_COLORS.navy400 }}>&nbsp;의&nbsp;</span>
              <span style={{ color: OG_COLORS.orange }}>Portfolio</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: 30,
                fontWeight: 500,
                color: OG_COLORS.navy400,
              }}
            >
              {project.roleTitle}
            </div>
          </div>
        </div>

        {/* 하단 여백 및 미니멀 정돈 */}
        <div style={{ height: 20 }} />
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
