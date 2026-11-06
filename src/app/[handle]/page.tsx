"use client";

import React, { use } from "react";
import { PortfolioBoard } from "@/components/portfolio/PortfolioBoard";

interface DynamicHandlePageProps {
  params: Promise<{ handle: string }>;
}

export default function DynamicHandlePage({ params }: DynamicHandlePageProps) {
  const resolvedParams = use(params);
  const rawHandle = resolvedParams?.handle ? decodeURIComponent(resolvedParams.handle) : "";
  const cleanHandle = rawHandle.replace(/^@/, "");

  return <PortfolioBoard targetHandle={cleanHandle} isDemo={cleanHandle === "demo"} />;
}
