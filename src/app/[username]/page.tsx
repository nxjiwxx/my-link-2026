"use client";

import React, { use } from "react";
import { PortfolioBoard } from "@/components/portfolio/PortfolioBoard";

interface DynamicUsernamePageProps {
  params: Promise<{ username: string }>;
}

export default function DynamicUsernamePage({ params }: DynamicUsernamePageProps) {
  const resolvedParams = use(params);
  const rawUsername = resolvedParams?.username ? decodeURIComponent(resolvedParams.username) : "";
  const cleanUsername = rawUsername.replace(/^@/, "").trim();

  return (
    <PortfolioBoard
      targetUsername={cleanUsername}
      isDemo={cleanUsername === "demo"}
      isDynamicRoute={true}
      hideHeaderProfileMenu={true}
      showCreateProjectButton={true}
    />
  );
}
