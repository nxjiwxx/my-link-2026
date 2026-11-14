"use client";

import React from "react";
import { LandingPage } from "./LandingPage";

interface LandingHeroProps {
  onGoogleLogin?: () => Promise<void>;
  isLoggingIn?: boolean;
}

export function LandingHero(props: LandingHeroProps) {
  return <LandingPage {...props} />;
}
