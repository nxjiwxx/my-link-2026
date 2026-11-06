"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Copy, BarChart2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GoogleIcon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";

interface TopNavHeaderProps {
  onShareClick?: () => void;
  onLoginSuccess?: () => void;
  onLogoutSuccess?: () => void;
  showToast?: (message: string) => void;
  isPublicView?: boolean;
  ownerName?: string;
  isOwner?: boolean;
  hideProfileMenu?: boolean;
}

export function TopNavHeader({
  onShareClick,
  onLoginSuccess,
  onLogoutSuccess,
  showToast,
  isPublicView = false,
  ownerName,
  isOwner = true,
  hideProfileMenu = false,
}: TopNavHeaderProps) {
  const { user, userProfile, isLoading, signInWithGoogle, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        showToast?.(`${loggedUser.displayName || "회원"}님 환영합니다.`);
        onLoginSuccess?.();
      }
    } catch (err: unknown) {
      console.error("구글 로그인 실패:", err);
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code === "auth/popup-closed-by-user") {
        showToast?.("로그인 창이 닫혔습니다.");
      } else if (errorObj?.code === "auth/network-request-failed") {
        showToast?.("네트워크 연결을 확인해주세요.");
      } else {
        showToast?.("Google 로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast?.("로그아웃 되었습니다.");
      onLogoutSuccess?.();
    } catch (err) {
      console.error("로그아웃 실패:", err);
      showToast?.("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleCopyLink = () => {
    setIsDropdownOpen(false);
    const username =
      userProfile?.username ||
      userProfile?.handle ||
      (user?.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") : "user");
    const cleanUsername = username.replace(/^@/, "");
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/${cleanUsername}`
        : `http://localhost:3000/${cleanUsername}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    showToast?.(`내 링크 주소가 복사되었습니다: /${cleanUsername}`);
  };

  const displayName = userProfile?.displayName || user?.displayName || "디자이너";
  const userPhoto = userProfile?.photoURL || user?.photoURL || "";

  return (
    <nav
      aria-label="상단 헤더 바"
      className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 bg-white border-b border-[#E5E8EB] sticky top-0 z-30 select-none"
    >
      {/* 좌측: My Link 페이지 명만 깔끔하게 유지 */}
      <Link
        href="/"
        className="text-[17px] sm:text-lg font-bold text-[#191F28] tracking-tight hover:opacity-80 transition-opacity"
      >
        My Link
      </Link>

      {/* 우측: 사용자 프로필 아바타 (드롭다운) 또는 비로그인 로그인 버튼 (라우팅 페이지 등에서 숨김 가능) */}
      {!hideProfileMenu ? (
        <div className="relative" ref={dropdownRef}>
          {isLoading ? (
            <div className="h-8 w-8 bg-[#F2F4F6] rounded-full animate-pulse" />
          ) : user ? (
            /* 로그인된 상태: 아바타 아이콘 ➔ 클릭 시 드롭다운 */
            <>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-label="프로필 메뉴 열기"
                className="flex items-center justify-center rounded-full ring-2 ring-transparent hover:ring-[#E5E8EB] focus:outline-none transition-all cursor-pointer"
              >
                <Avatar
                  src={userPhoto}
                  alt={displayName}
                  fallback={displayName.slice(0, 1)}
                  size="sm"
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5"
                />
              </button>

              {/* 프로필 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white border border-[#E5E8EB] shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* 유저 정보 요약 */}
                  <div className="px-3 py-2 border-b border-[#F2F4F6] mb-1">
                    <p className="text-xs font-semibold text-[#191F28] truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#6B7684] truncate">
                      {userProfile?.username || userProfile?.handle ? `@${(userProfile?.username || userProfile?.handle || "").replace(/^@/, "")}` : user.email}
                    </p>
                  </div>

                  {/* 내 공개 페이지 바로가기 */}
                  <Link
                    href={`/${(userProfile?.username || userProfile?.handle || (user?.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") : "")).replace(/^@/, "")}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#3182F6] hover:bg-[#F2F4F6] transition-colors"
                  >
                    <span>내 페이지 보기</span>
                    <span className="text-[10px] font-mono text-[#8B95A1]">
                      /{((userProfile?.username || userProfile?.handle || (user?.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") : "")).replace(/^@/, ""))}
                    </span>
                  </Link>

                  {/* 통계 대시보드 */}
                  <Link
                    href="/stats"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-[#3182F6]" />
                    <span>통계 대시보드</span>
                  </Link>

                  {/* 프로필 편집 */}
                  <Link
                    href="/profile/edit"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#6B7684]" />
                    <span>프로필 편집</span>
                  </Link>

                  {/* 링크 복사 */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors cursor-pointer text-left"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#6B7684]" />
                    <span>링크 복사</span>
                  </button>

                  <div className="my-1 border-t border-[#F2F4F6]" />

                  {/* 로그아웃 */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#F04452] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#F04452]" />
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* 비로그인 상태 */
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#191F28] hover:bg-[#333D4B] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? "연결 중..." : "Google 로그인"}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="w-8" />
      )}
    </nav>
  );
}
