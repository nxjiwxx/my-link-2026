"use client";

import React, { useState } from "react";
import { Wrench, Plus, Pencil, Trash2, Check, X, Save } from "lucide-react";
import { ToolProficiency } from "@/types/portfolio";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FigmaIcon,
  ProtopieIcon,
  AdobeCcIcon,
  BlenderIcon,
  ReactIcon,
} from "@/components/ui/icons";

interface ToolProficiencyBarsProps {
  tools: ToolProficiency[];
  onUpdateTools?: (tools: ToolProficiency[]) => void;
  onRequestDelete?: (tool: ToolProficiency) => void;
  isReadOnly?: boolean;
}

export function ToolProficiencyBars({
  tools,
  onUpdateTools,
  onRequestDelete,
  isReadOnly = false,
}: ToolProficiencyBarsProps) {
  if (isReadOnly && (!tools || tools.length === 0)) {
    return null;
  }

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // 수정 중인 임시 상태
  const [editName, setEditName] = useState<string>("");
  const [editLevel, setEditLevel] = useState<number>(80);
  const [editExperience, setEditExperience] = useState<string>("");

  // 추가 중인 임시 상태
  const [newName, setNewName] = useState<string>("");
  const [newLevel, setNewLevel] = useState<number>(80);
  const [newExperience, setNewExperience] = useState<string>("");

  const renderToolLogo = (iconKey?: string) => {
    switch (iconKey?.toLowerCase()) {
      case "figma":
        return <FigmaIcon className="w-4 h-4 shrink-0" />;
      case "protopie":
        return <ProtopieIcon className="w-4 h-4 shrink-0" />;
      case "adobe":
        return <AdobeCcIcon className="w-4 h-4 shrink-0" />;
      case "blender":
        return <BlenderIcon className="w-4 h-4 shrink-0" />;
      case "react":
        return <ReactIcon className="w-4 h-4 shrink-0" />;
      default:
        return <Wrench className="w-4 h-4 text-[#8B95A1] shrink-0" />;
    }
  };

  const inferIconKey = (name: string): ToolProficiency["iconKey"] => {
    const lower = name.toLowerCase();
    if (lower.includes("figma")) return "figma";
    if (lower.includes("protopie")) return "protopie";
    if (lower.includes("adobe") || lower.includes("photoshop") || lower.includes("illustrator")) return "adobe";
    if (lower.includes("blender")) return "blender";
    if (lower.includes("react")) return "react";
    return undefined;
  };

  const handleStartEdit = (index: number, tool: ToolProficiency) => {
    setIsAdding(false);
    setEditingIndex(index);
    setEditName(tool.name);
    setEditLevel(tool.level);
    setEditExperience(tool.experience || "");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSaveEdit = (index: number) => {
    if (!editName.trim()) {
      alert("도구 이름을 입력해주세요.");
      return;
    }
    const clampedLevel = Math.max(0, Math.min(100, Number(editLevel) || 0));
    const updated = [...tools];
    updated[index] = {
      ...updated[index],
      name: editName.trim(),
      level: clampedLevel,
      experience: editExperience.trim() || undefined,
      iconKey: inferIconKey(editName.trim()) || updated[index].iconKey,
    };

    onUpdateTools?.(updated);
    setEditingIndex(null);
  };

  const handleSaveNew = () => {
    if (!newName.trim()) {
      alert("도구 이름을 입력해주세요.");
      return;
    }
    const clampedLevel = Math.max(0, Math.min(100, Number(newLevel) || 0));
    const newTool: ToolProficiency = {
      name: newName.trim(),
      level: clampedLevel,
      experience: newExperience.trim() || undefined,
      iconKey: inferIconKey(newName.trim()),
    };

    onUpdateTools?.([...tools, newTool]);
    setNewName("");
    setNewLevel(80);
    setNewExperience("");
    setIsAdding(false);
  };

  return (
    <Card className="rounded-xl border border-[#E5E8EB] bg-white select-none shadow-2xs">
      <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#4B5563]">
            <Wrench className="w-4 h-4" />
          </div>
          <CardTitle className="text-sm font-semibold text-[#111827]">
            사용 도구 숙련도
          </CardTitle>
        </div>

        {/* 도구 추가 버튼 (수정 권한이 있을 때만 표시) */}
        {!isReadOnly && onUpdateTools && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingIndex(null);
              setIsAdding(!isAdding);
            }}
            className="h-7 px-2.5 text-[11px] font-medium text-[#111827] border-[#E5E8EB] hover:bg-[#F9FAFB] rounded-lg gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>도구 추가</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-1 space-y-3.5">
        {/* 새 도구 인라인 추가 폼 */}
        {isAdding && (
          <div className="p-3 rounded-xl bg-[#F9FAFB] border-2 border-[#3182F6]/40 space-y-2.5 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-[#191F28] flex items-center justify-between">
              <span>새 도구 숙련도 추가</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[#8B95A1] hover:text-[#191F28]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                  도구 이름 *
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: Figma, Framer, Blender"
                  className="h-8 text-xs bg-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                  숙련도 ({newLevel}%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newLevel}
                    onChange={(e) => setNewLevel(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="flex-1 accent-[#3182F6] cursor-pointer"
                  />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={newLevel}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                        setNewLevel(Math.min(100, Math.max(0, val)));
                      }}
                      className="w-16 h-8 text-xs font-mono font-bold text-center px-1 bg-white"
                    />
                    <span className="text-xs font-bold text-[#3182F6]">%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                경험 연차 / 수준 (선택)
              </label>
              <Input
                value={newExperience}
                onChange={(e) => setNewExperience(e.target.value)}
                placeholder="예: 고급 · 4년차, 실무 프로젝트 5회 이상"
                className="h-8 text-xs bg-white"
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

        {/* 기존 도구 숙련도 목록 */}
        {tools.map((tool, index) => {
          const isCurrentlyEditing = editingIndex === index;

          if (isCurrentlyEditing) {
            /* 인라인 편집 폼 */
            return (
              <div
                key={`edit-${tool.name}-${index}`}
                className="p-3 rounded-xl bg-[#F9FAFB] border-2 border-[#3182F6]/40 space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="text-xs font-bold text-[#191F28] flex items-center justify-between">
                  <span>도구 정보 인라인 수정</span>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-[#8B95A1] hover:text-[#191F28]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                      도구 이름 *
                    </label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="도구 이름"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                      숙련도 ({editLevel}%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editLevel}
                        onChange={(e) => setEditLevel(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="flex-1 accent-[#3182F6] cursor-pointer"
                      />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={editLevel}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setEditLevel(Math.min(100, Math.max(0, val)));
                          }}
                          className="w-16 h-8 text-xs font-mono font-bold text-center px-1 bg-white"
                        />
                        <span className="text-xs font-bold text-[#3182F6]">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                    경험 연차 / 수준 (선택)
                  </label>
                  <Input
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    placeholder="예: 고급 · 4년차"
                    className="h-8 text-xs bg-white"
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
                    onClick={() => handleSaveEdit(index)}
                    className="h-7 px-3 text-xs bg-[#3182F6] hover:bg-[#1B64DA] text-white"
                  >
                    수정 완료
                  </Button>
                </div>
              </div>
            );
          }

          /* 일반 보기 모드: 항상 노출되는 [수정] [삭제] 버튼 포함 */
          return (
            <div key={tool.name} className="space-y-1.5 group/item">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2F4F6] shrink-0">
                    {renderToolLogo(tool.iconKey)}
                  </div>
                  <span className="font-bold text-[#191F28] truncate">
                    {tool.name}
                  </span>
                  {tool.experience && (
                    <span className="hidden sm:inline-block text-[11px] text-[#8B95A1] truncate">
                      ({tool.experience})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-medium text-[#111827] text-xs">
                    {tool.level}%
                  </span>

                  {/* 항상 표시되는 수정/삭제 버튼 (수정 권한 있을 때만) */}
                  {!isReadOnly && onUpdateTools && (
                    <div className="flex items-center gap-1 border-l border-[#F3F4F6] pl-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(index, tool)}
                        className="p-1 rounded text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                        title="도구 정보 수정"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestDelete?.(tool)}
                        className="p-1 rounded text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                        title="도구 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 프로그레스 바 트랙 및 채움 */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full bg-[#111827] transition-all duration-500 ease-out"
                  style={{ width: `${tool.level}%` }}
                />
              </div>
            </div>
          );
        })}

        {tools.length === 0 && !isAdding && (
          <div className="py-6 text-center text-xs text-[#8B95A1]">
            등록된 도구 숙련도가 없습니다. 상단 버튼을 눌러 추가해보세요.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
