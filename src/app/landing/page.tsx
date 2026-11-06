"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LandingHero } from "@/components/landing/LandingHero";
import { Toast } from "@/components/ui/toast";

export default function LandingRoutePage() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleGoogleLogin = async () => {
    if (user) {
      router.push("/");
      return;
    }
    setIsLoggingIn(true);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        showToast(`${loggedUser.displayName || "회원"}님 환영합니다.`);
        setTimeout(() => {
          router.push("/");
        }, 400);
      }
    } catch (err: unknown) {
      console.error("로그인 실패:", err);
      const errorObj = err as { code?: string };
      if (errorObj?.code === "auth/popup-closed-by-user") {
        showToast("로그인 창이 닫혔습니다.");
      } else {
        showToast("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <LandingHero
        onGoogleLogin={handleGoogleLogin}
        isLoggingIn={isLoggingIn}
      />
      <Toast message={toastMessage} />
    </>
  );
}
