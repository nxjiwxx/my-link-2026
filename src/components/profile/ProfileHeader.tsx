"use client";

import React from "react";
import { Check, Share2, QrCode } from "lucide-react";
import { ProfileData } from "@/types/profile";
import { Avatar } from "@/components/ui/avatar";
import {
  InstagramIcon,
  YoutubeIcon,
  TiktokIcon,
  MailIcon,
} from "@/components/ui/icons";

interface ProfileHeaderProps {
  profile: ProfileData;
  onShareClick?: () => void;
  onQrClick?: () => void;
}

export function ProfileHeader({
  profile,
  onShareClick,
  onQrClick,
}: ProfileHeaderProps) {
  const { displayName, subTitle, bio, avatarUrl, isVerified, socialLinks } = profile;

  return (
    <header className="relative flex flex-col items-center text-center pt-8 pb-5 px-4 select-none">
      {/* 우측 상단 공유 & QR 버튼 */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        {onQrClick && (
          <button
            onClick={onQrClick}
            aria-label="QR 코드 보기"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 border border-[#E5E8EB] text-[#4E5968] hover:text-[#191F28] hover:bg-white active:scale-95 transition-all shadow-xs"
          >
            <QrCode className="w-4 h-4" />
          </button>
        )}
        {onShareClick && (
          <button
            onClick={onShareClick}
            aria-label="프로필 공유하기"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 border border-[#E5E8EB] text-[#4E5968] hover:text-[#191F28] hover:bg-white active:scale-95 transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 96x96px 원형 아바타 (화이트 링 테두리 & 은은한 섀도우) */}
      <div className="relative mb-3.5">
        <Avatar
          src={avatarUrl}
          alt={displayName}
          fallback={displayName.slice(0, 1)}
          size="xl"
          className="w-24 h-24 shadow-md ring-4 ring-white"
        />
        {isVerified && (
          <div
            title="인증된 크리에이터"
            className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#3182F6] text-white ring-2 ring-white shadow-xs"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}
      </div>

      {/* 닉네임 및 서브 타이틀 */}
      <h1 className="text-xl font-bold tracking-tight text-[#191F28] flex items-center justify-center gap-1.5">
        <span>{displayName}</span>
        <span className="text-xs font-semibold text-[#8B95A1] font-mono">
          @{profile.handle}
        </span>
      </h1>

      {subTitle && (
        <p className="text-xs font-medium text-[#8B95A1] mt-0.5">
          {subTitle}
        </p>
      )}

      {/* 한 줄 바이오 (TDS grey-700, 14px, 행간 1.5, 줄바꿈 유지) */}
      <div className="mt-3 max-w-sm text-[14px] text-[#4E5968] leading-relaxed whitespace-pre-line break-keep font-normal">
        {bio}
      </div>

      {/* 소셜 공식 로고 버튼 바 (각 소셜의 로고가 들어있는 원형 버튼) */}
      <nav aria-label="공식 소셜 채널" className="mt-4 flex items-center justify-center gap-2.5">
        {socialLinks.instagram && (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            title="인스타그램 공식 채널"
            aria-label="인스타그램"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#E1306C] hover:text-[#E1306C] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        )}

        {socialLinks.youtube && (
          <a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
            title="유튜브 채널"
            aria-label="유튜브"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#F04452] hover:text-[#F04452] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs"
          >
            <YoutubeIcon className="w-4 h-4" />
          </a>
        )}

        {socialLinks.tiktok && (
          <a
            href={socialLinks.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            title="틱톡 채널"
            aria-label="틱톡"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#191F28] hover:bg-[#F2F4F6] active:scale-95 transition-all shadow-xs"
          >
            <TiktokIcon className="w-4 h-4" />
          </a>
        )}

        {socialLinks.email && (
          <a
            href={`mailto:${socialLinks.email}`}
            title="비즈니스 제휴 이메일"
            aria-label="이메일 문의"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#3182F6] hover:text-[#3182F6] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs"
          >
            <MailIcon className="w-4 h-4" />
          </a>
        )}
      </nav>
    </header>
  );
}
