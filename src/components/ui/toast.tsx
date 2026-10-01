"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-[14px] bg-[#191F28] px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#04C05E] text-white">
        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
      </div>
      <span className="text-sm font-semibold tracking-tight">{message}</span>
    </div>
  );
}
