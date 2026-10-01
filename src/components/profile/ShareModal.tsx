"use client";

import React, { useState } from "react";
import { Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  handle: string;
  name: string;
  onCopied: (msg: string) => void;
}

export function ShareModal({
  isOpen,
  onClose,
  handle,
  name,
  onCopied,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://mylink.io/@${handle}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
    }
    setCopied(true);
    onCopied("포트폴리오 링크가 복사되었어요");
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm rounded-[24px] p-6 text-center select-none border border-[#E5E8EB]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F3FF] text-[#3182F6] mb-1">
          <QrCode className="w-6 h-6" />
        </div>

        <DialogHeader className="text-center sm:text-center space-y-1">
          <DialogTitle className="text-lg font-bold text-[#191F28] text-center">
            포트폴리오 공유하기
          </DialogTitle>
          <DialogDescription className="text-xs text-[#4E5968] text-center">
            {name} 님의 포트폴리오 아카이빙 페이지를 공유해보세요.
          </DialogDescription>
        </DialogHeader>

        {/* QR 코드 비주얼 박스 */}
        <div className="mx-auto w-36 h-36 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB] p-3 flex flex-col items-center justify-center my-2">
          <div className="w-full h-full bg-white p-2 rounded-lg flex items-center justify-center border border-[#E5E8EB]">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-[#191F28]">
              {/* Corner markers */}
              <rect x="5" y="5" width="25" height="25" fill="none" stroke="#191F28" strokeWidth="4" />
              <rect x="11" y="11" width="13" height="13" />
              <rect x="70" y="5" width="25" height="25" fill="none" stroke="#191F28" strokeWidth="4" />
              <rect x="76" y="11" width="13" height="13" />
              <rect x="5" y="70" width="25" height="25" fill="none" stroke="#191F28" strokeWidth="4" />
              <rect x="11" y="76" width="13" height="13" />
              {/* QR Pattern dots */}
              <rect x="40" y="10" width="8" height="8" />
              <rect x="52" y="15" width="8" height="8" />
              <rect x="40" y="25" width="16" height="8" />
              <rect x="10" y="40" width="8" height="18" />
              <rect x="25" y="45" width="8" height="8" />
              <rect x="45" y="42" width="10" height="16" />
              <rect x="65" y="40" width="12" height="8" />
              <rect x="82" y="45" width="8" height="18" />
              <rect x="40" y="65" width="8" height="12" />
              <rect x="55" y="70" width="14" height="8" />
              <rect x="75" y="65" width="15" height="8" />
              <rect x="40" y="85" width="20" height="8" />
              <rect x="70" y="80" width="10" height="15" />
            </svg>
          </div>
        </div>

        {/* 링크 복사 인풋 & 버튼 */}
        <div className="flex items-center gap-2 rounded-xl bg-[#F2F4F6] p-1.5 border border-[#E5E8EB]">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent px-2.5 text-xs text-[#191F28] font-mono outline-none truncate"
          />
          <Button
            size="sm"
            onClick={handleCopy}
            className="shrink-0 h-8 rounded-lg bg-[#3182F6] px-3 text-xs font-bold text-white hover:bg-[#1B64DA] active:scale-95 transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span>복사</span>
              </>
            )}
          </Button>
        </div>

        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full h-11 rounded-xl text-xs font-semibold text-[#4E5968] bg-[#F2F4F6] hover:bg-[#E5E8EB]"
        >
          닫기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
