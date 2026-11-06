"use client";

import React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { ProjectItem } from "@/types/portfolio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 프로젝트 객체를 직접 전달하거나, 범용 아이템 정보를 전달할 수 있습니다.
  project?: ProjectItem | null;
  itemName?: string;
  itemCategory?: string;
  itemDescription?: string;
  itemThumbnailUrl?: string;
  onConfirmDelete?: ((id: string) => Promise<void> | void) | (() => Promise<void> | void);
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  project,
  itemName,
  itemCategory,
  itemDescription,
  itemThumbnailUrl,
  onConfirmDelete,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  const titleText = itemName || project?.title || "선택한 항목";
  const categoryText = itemCategory || project?.categoryLabel || "항목";
  const descriptionText = itemDescription || project?.summary || "";
  const thumbnail = itemThumbnailUrl || project?.thumbnailUrl || "";

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!onConfirmDelete) return;
    if (project) {
      await (onConfirmDelete as (id: string) => Promise<void> | void)(project.id);
    } else {
      await (onConfirmDelete as () => Promise<void> | void)();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-[400px] w-full p-6 rounded-[24px] border border-[#E5E8EB] bg-white shadow-none">
        <DialogHeader className="text-left space-y-3">
          {/* 상단 경고 아이콘 */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEECEF] text-[#E8344E]">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            {/* 제목: '정말 삭제하시겠습니까?' */}
            <DialogTitle className="text-lg font-bold text-[#191F28]">
              정말 삭제하시겠습니까?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#8B95A1]">
              선택한 항목이 영구적으로 삭제됩니다.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* 링크/항목 이름 표시 영역 */}
        <div className="my-2 p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E8EB] flex items-center gap-3">
          {thumbnail && (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F2F4F6] shrink-0 border border-[#E5E8EB]/60">
              <img
                src={thumbnail}
                alt={titleText}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {categoryText && (
              <span className="text-[10px] font-bold text-[#3182F6] block mb-0.5">
                {categoryText}
              </span>
            )}
            <p className="text-xs sm:text-sm font-bold text-[#191F28] truncate">
              {titleText}
            </p>
            {descriptionText && (
              <p className="text-[11px] text-[#6B7684] truncate mt-0.5">
                {descriptionText}
              </p>
            )}
          </div>
        </div>

        {/* 경고 문구: "이 작업은 되돌릴 수 없습니다." (빨간색) */}
        <div className="text-center py-1">
          <p className="text-xs font-semibold text-[#E8344E]">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        {/* 버튼 영역: [취소] [삭제하기] */}
        <div className="flex items-center gap-2 mt-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 h-11 text-xs sm:text-sm font-bold text-[#4E5968] border-[#E5E8EB] hover:bg-[#F2F4F6] rounded-xl"
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex-1 h-11 text-xs sm:text-sm font-bold bg-[#E8344E] hover:bg-[#D02640] text-white rounded-xl flex items-center justify-center gap-1.5 shadow-none active:scale-[0.98] transition-all"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>삭제 중...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>삭제하기</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
