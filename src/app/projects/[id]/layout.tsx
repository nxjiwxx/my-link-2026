import type { Metadata } from "next";
import { getOgProjectData } from "@/lib/og";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getOgProjectData(resolvedParams?.id || "project");

  const title = `${project.title} | MyPortfolio`;
  const description =
    project.summary ||
    "디자이너의 작업물과 케이스 스터디를 MyPortfolio에서 확인해보세요.";

  return {
    title,
    description,
    alternates: { canonical: `/projects/${encodeURIComponent(project.id)}` },
    openGraph: {
      title,
      description,
      url: `/projects/${encodeURIComponent(project.id)}`,
      siteName: "MyPortfolio",
      type: "article",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
