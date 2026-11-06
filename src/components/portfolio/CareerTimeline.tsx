"use client";

import React, { useState, useMemo } from "react";
import { Briefcase, Plus, Pencil, Trash2, X } from "lucide-react";
import { CareerItem } from "@/types/portfolio";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sortCareersByPeriod } from "@/lib/careerUtils";

interface CareerTimelineProps {
  careers: CareerItem[];
  onUpdateCareers?: (careers: CareerItem[]) => void;
  onRequestDelete?: (career: CareerItem) => void;
  isReadOnly?: boolean;
}

export function CareerTimeline({
  careers,
  onUpdateCareers,
  onRequestDelete,
  isReadOnly = false,
}: CareerTimelineProps) {
  if (isReadOnly && (!careers || careers.length === 0)) {
    return null;
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // 수정 중인 임시 상태
  const [editPeriod, setEditPeriod] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editOrg, setEditOrg] = useState<string>("");
  const [editDesc, setEditDesc] = useState<string>("");

  // 추가 중인 임시 상태
  const [newPeriod, setNewPeriod] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newOrg, setNewOrg] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");

  const sortedCareers = useMemo(() => sortCareersByPeriod(careers), [careers]);

  const handleStartEdit = (career: CareerItem) => {
    setIsAdding(false);
    setEditingId(career.id);
    setEditPeriod(career.period);
    setEditTitle(career.title);
    setEditOrg(career.organization);
    setEditDesc(career.description || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (careerId: string) => {
    if (!editTitle.trim()) {
      alert("직무명/역할을 입력해주세요.");
      return;
    }

    const updated = careers.map((c) =>
      c.id === careerId
        ? {
            ...c,
            period: editPeriod.trim() || "2026",
            title: editTitle.trim(),
            organization: editOrg.trim(),
            description: editDesc.trim() || undefined,
          }
        : c
    );

    // 기간을 감지하여 내림차순 정렬 후 저장
    onUpdateCareers?.(sortCareersByPeriod(updated));
    setEditingId(null);
  };

  const handleSaveNew = () => {
    if (!newTitle.trim()) {
      alert("직무명/역할을 입력해주세요.");
      return;
    }

    const newCareer: CareerItem = {
      id: `career-${Date.now()}`,
      period: newPeriod.trim() || "2026",
      title: newTitle.trim(),
      organization: newOrg.trim(),
      description: newDesc.trim() || undefined,
    };

    // 기간을 감지하여 내림차순 정렬 후 저장
    onUpdateCareers?.(sortCareersByPeriod([newCareer, ...careers]));
    setNewPeriod("");
    setNewTitle("");
    setNewOrg("");
    setNewDesc("");
    setIsAdding(false);
  };

  return (
    <Card className="rounded-xl border border-[#E5E8EB] bg-white select-none shadow-none">
      <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-[#4B5563]" />
          <CardTitle className="text-sm font-semibold text-[#111827]">
            경력 및 활동
          </CardTitle>
        </div>

        {/* 경력 추가 버튼 (수정 권한이 있을 때만 표시) */}
        {!isReadOnly && onUpdateCareers && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingId(null);
              setIsAdding(!isAdding);
            }}
            className="h-7 px-2.5 text-[11px] font-medium text-[#4E5968] bg-transparent border border-[#E5E8EB] hover:bg-[#F2F4F6] hover:text-[#191F28] rounded-lg gap-1 shadow-none transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>경력 추가</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {/* 새 경력 인라인 추가 폼 */}
        {isAdding && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#F9FAFB] border-2 border-[#3182F6]/40 space-y-2.5 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-[#191F28] flex items-center justify-between">
              <span>새 경력/활동 인라인 추가</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[#8B95A1] hover:text-[#191F28]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                  기간 *
                </label>
                <Input
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  placeholder="예: 2024 ~ Present"
                  className="h-8 text-xs bg-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                  직무명/역할 *
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: Product Designer"
                  className="h-8 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                  소속/회사/기관 <span className="text-[10px] text-[#8B95A1] font-normal">(선택)</span>
                </label>
                <Input
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  placeholder="예: Viva Republica (Toss)"
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                상세 설명 (선택)
              </label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="주요 업무, 성과 또는 수상 내역을 입력하세요"
                rows={2}
                className="text-xs bg-white"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="h-7 px-2.5 text-xs text-[#6B7684]"
              >
                취소
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveNew}
                className="h-7 px-3 text-xs bg-[#3182F6] hover:bg-[#1B64DA] text-white"
              >
                추가 완료
              </Button>
            </div>
          </div>
        )}

        {/* 기존 경력 목록 (기간 내림차순 정렬) */}
        <div className="relative pl-4 border-l-2 border-[#E5E8EB] space-y-4 my-1">
          {sortedCareers.map((career) => {
            const isCurrentlyEditing = editingId === career.id;

            if (isCurrentlyEditing) {
              /* 인라인 편집 폼 */
              return (
                <div key={career.id} className="relative">
                  {/* 타임라인 불릿 닷 */}
                  <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#3182F6] shadow-none" />
                  <div className="p-3.5 rounded-xl bg-[#F9FAFB] border-2 border-[#3182F6]/40 space-y-2.5 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-[#191F28] flex items-center justify-between">
                      <span>경력 정보 인라인 수정</span>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-[#8B95A1] hover:text-[#191F28]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                          기간 *
                        </label>
                        <Input
                          value={editPeriod}
                          onChange={(e) => setEditPeriod(e.target.value)}
                          placeholder="기간"
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                          직무명 *
                        </label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="직무명"
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                          소속/회사명 <span className="text-[10px] text-[#8B95A1] font-normal">(선택)</span>
                        </label>
                        <Input
                          value={editOrg}
                          onChange={(e) => setEditOrg(e.target.value)}
                          placeholder="소속/회사"
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                        상세 설명
                      </label>
                      <Textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="상세 설명"
                        rows={2}
                        className="text-xs bg-white"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-7 px-2.5 text-xs text-[#6B7684]"
                      >
                        취소
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveEdit(career.id)}
                        className="h-7 px-3 text-xs bg-[#3182F6] hover:bg-[#1B64DA] text-white"
                      >
                        수정 완료
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            /* 일반 타임라인 보기 모드 */
            return (
              <div key={career.id} className="relative group/career">
                {/* 타임라인 불릿 닷 */}
                <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-[#111827] shadow-none" />

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-[#6B7280] font-medium">
                      {career.period}
                    </div>
                    <div className="text-xs font-semibold text-[#111827] mt-0.5">
                      {career.title}
                      {career.organization && career.organization.trim() && (
                        <span className="font-normal text-[#4B5563]">
                          {" "}· {career.organization}
                        </span>
                      )}
                    </div>
                    {career.description && (
                      <p className="text-[11px] text-[#6B7280] leading-relaxed mt-0.5">
                        {career.description}
                      </p>
                    )}
                  </div>

                  {/* 항상 표시되는 수정/삭제 버튼 (수정 권한 있을 때만) */}
                  {!isReadOnly && onUpdateCareers && (
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(career)}
                        className="p-1 rounded text-[#8B95A1] hover:text-[#3182F6] hover:bg-[#E8F3FF] transition-colors"
                        title="경력 수정"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestDelete?.(career)}
                        className="p-1 rounded text-[#8B95A1] hover:text-[#E8344E] hover:bg-[#FEECEF] transition-colors"
                        title="경력 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {careers.length === 0 && !isAdding && (
            <div className="py-6 text-center text-xs text-[#8B95A1]">
              등록된 경력이나 활동이 없습니다. 상단 버튼을 눌러 추가해보세요.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
