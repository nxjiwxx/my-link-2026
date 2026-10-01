"use client";

import React from "react";
import { Download, Share2, FileText } from "lucide-react";
import { DesignerProfileData } from "@/types/portfolio";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BehanceIcon,
  LinkedinIcon,
  GithubIcon,
  InstagramIcon,
  MailIcon,
  DribbbleIcon,
} from "@/components/ui/icons";

interface ProfileHeaderProps {
  profile: DesignerProfileData;
  onShareClick?: () => void;
  onResumeDownload?: () => void;
}

export function ProfileHeader({
  profile,
  onShareClick,
  onResumeDownload,
}: ProfileHeaderProps) {
  const { name, roleTitle, bio, avatarUrl, socialLinks } = profile;

  return (
    <header className="relative flex flex-col items-center text-center pt-8 pb-5 px-4 select-none">
      {/* 우측 상단 공유 버튼 */}
      {onShareClick && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <button
            onClick={onShareClick}
            aria-label="포트폴리오 공유하기"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[#E5E8EB] text-[#4E5968] hover:text-[#191F28] hover:bg-[#F2F4F6] active:scale-95 transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 96x96px 원형 아바타 (화이트 링 테두리 & 은은한 섀도우) */}
      <div className="relative mb-3.5">
        <Avatar
          src={avatarUrl}
          alt={name}
          fallback={name.slice(0, 1)}
          size="xl"
          className="w-24 h-24 shadow-md ring-4 ring-white"
        />
      </div>

      {/* 디자이너 이름 & 직함 */}
      <h1 className="text-[22px] font-bold tracking-tight text-[#191F28] flex items-center justify-center gap-1.5">
        <span>{name}</span>
        <span className="text-xs font-semibold text-[#8B95A1] font-mono">
          @{profile.handle}
        </span>
      </h1>

      <p className="text-[14px] font-semibold text-[#3182F6] mt-0.5">
        {roleTitle}
      </p>

      {/* 전문 바이오 (TDS grey-700, 14px, 2줄 요약) */}
      <div className="mt-2.5 max-w-sm text-[14px] text-[#4E5968] leading-relaxed whitespace-pre-line break-keep font-normal">
        {bio}
      </div>

      {/* 소셜 링크 버튼 바: 각 소셜의 공식 로고를 활용한 원형 버튼 형태 */}
      <nav
        aria-label="디자이너 공식 소셜 채널"
        className="mt-4 flex items-center justify-center gap-2.5"
      >
        {socialLinks.behance && (
          <a
            href={socialLinks.behance}
            target="_blank"
            rel="noopener noreferrer"
            title="Behance 포트폴리오"
            aria-label="Behance"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#0057FF] hover:text-[#0057FF] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs"
          >
            <BehanceIcon className="w-4 h-4" />
          </a>
        )}

        {socialLinks.linkedin && (
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn 프로필"
            aria-label="LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>
        )}

        {socialLinks.github && (
          <a
            href={socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub 프로필"
            aria-label="GitHub"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#191F28] hover:text-[#191F28] hover:bg-[#F2F4F6] active:scale-95 transition-all shadow-xs"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        )}

        {socialLinks.instagram && (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram 프로필"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#E1306C] hover:text-[#E1306C] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        )}

        {socialLinks.dribbble && (
          <a
            href={socialLinks.dribbble}
            target="_blank"
            rel="noopener noreferrer"
            title="Dribbble 프로필"
            aria-label="Dribbble"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#EA4C89] hover:text-[#EA4C89] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs"
          >
            <DribbbleIcon className="w-4 h-4" />
          </a>
        )}

        {socialLinks.email && (
          <a
            href={`mailto:${socialLinks.email}`}
            title="이메일 문의"
            aria-label="이메일"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E8EB] bg-white text-[#191F28] hover:border-[#3182F6] hover:text-[#3182F6] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-xs"
          >
            <MailIcon className="w-4 h-4" />
          </a>
        )}
      </nav>

      {/* 이력서 / 포트폴리오 PDF 다운로드 CTA 버튼 */}
      <div className="mt-4 w-full max-w-xs">
        <Button
          type="button"
          onClick={onResumeDownload}
          className="w-full h-11 rounded-xl bg-white border border-[#3182F6] text-[#3182F6] hover:bg-[#E8F3FF] active:scale-[0.98] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4 text-[#3182F6]" />
          <span>Resume / 이력서 다운로드</span>
          <Download className="w-3.5 h-3.5 ml-0.5 opacity-70" />
        </Button>
      </div>
    </header>
  );
}
