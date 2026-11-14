import type { Metadata } from "next";
import { getOgUserProfile } from "@/lib/og";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getOgUserProfile(resolvedParams?.username || "designer");

  const title = `${profile.username}의 Portfolio | MyPortfolio`;
  const description =
    profile.bio ||
    `${profile.username}님의 ${profile.roleTitle} 포트폴리오를 한눈에 확인해보세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/${encodeURIComponent(profile.username)}` },
    openGraph: {
      title,
      description,
      url: `/${encodeURIComponent(profile.username)}`,
      siteName: "MyPortfolio",
      type: "profile",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function UsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
