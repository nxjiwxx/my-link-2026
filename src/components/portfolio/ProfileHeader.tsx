"use client";

import React from "react";
import { Download, FileText } from "lucide-react";
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
  onResumeDownload?: () => void;
}

export function ProfileHeader({
  profile,
  onResumeDownload,
}: ProfileHeaderProps) {
  const { name, roleTitle, bio, avatarUrl, socialLinks, resumePdfUrl } = profile;

  // 값이 존재하는 소셜 링크가 하나라도 있는지 확인
  const hasAnySocial =
    socialLinks &&
    Object.values(socialLinks).some((val) => val && val.trim().length > 0);

  // 이력서가 존재하는지 확인 (빈 문자열이거나 없을 경우 절대 노출되지 않음)
  const hasResume = Boolean(resumePdfUrl && resumePdfUrl.trim().length > 0);

  return (
    <header className="relative flex flex-col items-center text-center pt-8 sm:pt-10 pb-6 px-4 sm:px-6 select-none w-full">
      {/* 원형 아바타 (모바일 88px, 데스크톱 96px) */}
      <div className="relative mb-3.5 sm:mb-4">
        <Avatar
          src={avatarUrl}
          alt={name}
          fallback={name.slice(0, 1)}
          size="xl"
          className="w-22 h-22 sm:w-24 sm:h-24 ring-1 ring-[#E5E8EB]"
        />
      </div>

      {/* 디자이너 이름 & 핸들 */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#191F28] flex items-center justify-center gap-2 flex-wrap">
        <span>{name}</span>
        {profile.handle && (
          <span className="text-xs sm:text-sm font-normal text-[#6B7684]">
            @{profile.handle.replace(/^@/, "")}
          </span>
        )}
      </h1>

      {roleTitle && (
        <p className="text-sm sm:text-base font-medium text-[#4E5968] mt-1 sm:mt-1.5">
          {roleTitle}
        </p>
      )}

      {/* 전문 바이오 (너비 제한 완화 및 브레이크포인트별 가독성 확보) */}
      {bio && (
        <div className="mt-2.5 sm:mt-3 max-w-md sm:max-w-xl lg:max-w-2xl text-xs sm:text-sm lg:text-[15px] text-[#4E5968] leading-relaxed whitespace-pre-line break-keep font-normal px-2">
          {bio}
        </div>
      )}

      {/* 소셜 채널 링크 바 (추가된 채널만 렌더링) */}
      {hasAnySocial && (
        <nav
          aria-label="공식 소셜 채널"
          className="mt-4 sm:mt-5 flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap"
        >
          {socialLinks.github && socialLinks.github.trim() && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub 프로필"
              aria-label="GitHub"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#E5E8EB] bg-white text-[#4E5968] hover:border-[#191F28] hover:text-[#191F28] hover:bg-[#F9FAFB] active:scale-95 transition-all shadow-2xs"
            >
              <GithubIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
          )}

          {socialLinks.linkedin && socialLinks.linkedin.trim() && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn 프로필"
              aria-label="LinkedIn"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#E5E8EB] bg-white text-[#4E5968] hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#F9FAFB] active:scale-95 transition-all shadow-2xs"
            >
              <LinkedinIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
          )}

          {socialLinks.behance && socialLinks.behance.trim() && (
            <a
              href={socialLinks.behance}
              target="_blank"
              rel="noopener noreferrer"
              title="Behance 포트폴리오"
              aria-label="Behance"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#E5E8EB] bg-white text-[#4E5968] hover:border-[#0057FF] hover:text-[#0057FF] hover:bg-[#F9FAFB] active:scale-95 transition-all shadow-2xs"
            >
              <BehanceIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
          )}

          {socialLinks.dribbble && socialLinks.dribbble.trim() && (
            <a
              href={socialLinks.dribbble}
              target="_blank"
              rel="noopener noreferrer"
              title="Dribbble 프로필"
              aria-label="Dribbble"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#E5E8EB] bg-white text-[#4E5968] hover:border-[#EA4C89] hover:text-[#EA4C89] hover:bg-[#F9FAFB] active:scale-95 transition-all shadow-2xs"
            >
              <DribbbleIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
          )}

          {socialLinks.instagram && socialLinks.instagram.trim() && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram 프로필"
              aria-label="Instagram"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#E5E8EB] bg-white text-[#4E5968] hover:border-[#E1306C] hover:text-[#E1306C] hover:bg-[#F9FAFB] active:scale-95 transition-all shadow-2xs"
            >
              <InstagramIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
          )}

          {socialLinks.email && socialLinks.email.trim() && (
            <a
              href={`mailto:${socialLinks.email}`}
              title="이메일 문의"
              aria-label="이메일"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#E5E8EB] bg-white text-[#4E5968] hover:border-[#191F28] hover:text-[#191F28] hover:bg-[#F9FAFB] active:scale-95 transition-all shadow-2xs"
            >
              <MailIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
          )}
        </nav>
      )}

      {/* 이력서 PDF 다운로드 CTA 버튼: 이력서가 등록되어 있을 때만 렌더링 */}
      {hasResume && (
        <div className="mt-4 sm:mt-5 w-full max-w-xs">
          <Button
            type="button"
            onClick={onResumeDownload}
            className="w-full h-10 sm:h-11 rounded-xl bg-white border border-[#D1D6DB] hover:border-[#191F28] text-[#191F28] hover:bg-[#F9FAFB] active:scale-[0.98] font-medium text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#4E5968]" />
            <span>이력서 다운로드</span>
            <Download className="w-3.5 h-3.5 text-[#6B7684]" />
          </Button>
        </div>
      )}
    </header>
  );
}
