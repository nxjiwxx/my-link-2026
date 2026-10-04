"use client";

import React, { useState, useRef } from "react";
import {
  Link2,
  Users,
  User,
  Plus,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload,
  Check,
  Wrench,
  Tag,
} from "lucide-react";
import {
  ProjectItem,
  ProjectCategory,
  ProjectType,
  CategoryItem,
  DEFAULT_CATEGORIES,
} from "@/types/portfolio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCategories?: CategoryItem[];
  onAddCategory?: (category: CategoryItem) => void;
  savedTools?: string[];
  onAdd: (newProject: ProjectItem, newTools: string[]) => void;
}

export function AddLinkModal({
  isOpen,
  onClose,
  availableCategories = DEFAULT_CATEGORIES,
  onAddCategory,
  savedTools = [],
  onAdd,
}: AddLinkModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ProjectCategory>(
    availableCategories[0]?.id || "uiux"
  );
  const [projectType, setProjectType] = useState<ProjectType>("solo");
  const [summary, setSummary] = useState("");

  // 카테고리 직접 추가 관련 상태
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [localCategories, setLocalCategories] =
    useState<CategoryItem[]>(availableCategories);

  // 외부 연결 링크 관련 상태 (추천 문구 제거, 유저 입력값만 사용)
  const [externalUrl, setExternalUrl] = useState("");
  const [externalLabel, setExternalLabel] = useState("");

  // 썸네일 이미지 관련 상태 (추천 이미지 제거, 유저 업로드 / URL 입력만 유지)
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용 도구 관련 상태 (기본 제시 도구 제거, 유저 입력 도구 + 이전에 추가했던 도구 추천)
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customToolInput, setCustomToolInput] = useState("");

  // 추가 상세 정보 (기간, 역할, 상세 설명)
  const [period, setPeriod] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [showExtraFields, setShowExtraFields] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    summary?: string;
    externalUrl?: string;
    externalLabel?: string;
  }>({});

  // availableCategories prop 변경 시 동기화
  React.useEffect(() => {
    setLocalCategories(availableCategories);
    if (!category && availableCategories.length > 0) {
      setCategory(availableCategories[0].id);
    }
  }, [availableCategories]);

  // URL 유효성 검사 헬퍼 함수
  const validateExternalUrl = (
    urlStr: string
  ): { isValid: boolean; message?: string } => {
    const trimmed = urlStr.trim();
    if (!trimmed) return { isValid: true };

    if (!/^https?:\/\/.+/i.test(trimmed)) {
      return {
        isValid: false,
        message:
          "URL은 'https://' 또는 'http://'로 시작해야 해요 (예: https://figma.com)",
      };
    }

    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname.includes(".")) {
        return {
          isValid: false,
          message: "올바른 도메인 주소를 입력해주세요 (예: https://figma.com)",
        };
      }
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        message: "올바른 URL 형식(예: https://example.com)을 입력해주세요",
      };
    }
  };

  const handleUrlBlur = () => {
    let val = externalUrl.trim();
    if (!val) {
      if (errors.externalUrl) {
        setErrors((prev) => ({ ...prev, externalUrl: undefined }));
      }
      return;
    }

    // 'https://' 없이 'figma.com' 등으로 입력한 경우 자동 프리픽스
    if (!/^https?:\/\//i.test(val) && /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(val)) {
      val = `https://${val}`;
      setExternalUrl(val);
    }

    const { isValid, message } = validateExternalUrl(val);
    if (!isValid && message) {
      setErrors((prev) => ({ ...prev, externalUrl: message }));
    } else {
      setErrors((prev) => ({ ...prev, externalUrl: undefined }));
      if (!externalLabel.trim()) {
        setErrors((prev) => ({
          ...prev,
          externalLabel:
            "버튼에 표시할 링크명을 입력해주세요 (예: Figma 프로토타입)",
        }));
      }
    }
  };

  const handleLabelBlur = () => {
    const trimmedLabel = externalLabel.trim();
    const trimmedUrl = externalUrl.trim();

    if (trimmedUrl && !trimmedLabel) {
      setErrors((prev) => ({
        ...prev,
        externalLabel:
          "버튼에 표시할 링크명을 입력해주세요 (예: Figma 프로토타입)",
      }));
    } else {
      setErrors((prev) => ({ ...prev, externalLabel: undefined }));
    }
  };

  // 카테고리 직접 추가 핸들러
  const handleAddNewCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    // 이미 존재하는지 확인
    const existing = localCategories.find(
      (c) => c.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      setCategory(existing.id);
      setNewCategoryName("");
      setIsAddingCategory(false);
      return;
    }

    const newId = `cat-${Date.now()}`;
    const newCatItem: CategoryItem = { id: newId, label: trimmed };
    const updated = [...localCategories, newCatItem];
    setLocalCategories(updated);
    setCategory(newId);
    setNewCategoryName("");
    setIsAddingCategory(false);

    if (onAddCategory) {
      onAddCategory(newCatItem);
    }
  };

  // 이미지 로컬 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setThumbnailUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // 도구 추가 (유저 직접 입력)
  const handleAddTool = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customToolInput.trim();
    if (trimmed && !selectedTools.includes(trimmed)) {
      setSelectedTools([...selectedTools, trimmed]);
      setCustomToolInput("");
    }
  };

  // 이전에 사용했던 도구 추천 칩 클릭 시 토글/추가
  const handleSelectSuggestedTool = (tool: string) => {
    if (!selectedTools.includes(tool)) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleRemoveTool = (tool: string) => {
    setSelectedTools(selectedTools.filter((t) => t !== tool));
  };

  // 모달 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      title?: string;
      summary?: string;
      externalUrl?: string;
      externalLabel?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "작업 제목을 입력해주세요";
    }
    if (!summary.trim()) {
      newErrors.summary = "한 줄 소개를 입력해주세요";
    }

    // 외부 연결 링크 검증 로직
    let trimmedUrl = externalUrl.trim();
    const trimmedLabel = externalLabel.trim();

    // 프로토콜 자동 보정 (예: figma.com/project -> https://figma.com/project)
    if (
      trimmedUrl &&
      !/^https?:\/\//i.test(trimmedUrl) &&
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmedUrl)
    ) {
      trimmedUrl = `https://${trimmedUrl}`;
      setExternalUrl(trimmedUrl);
    }

    if (trimmedUrl) {
      const urlCheck = validateExternalUrl(trimmedUrl);
      if (!urlCheck.isValid && urlCheck.message) {
        newErrors.externalUrl = urlCheck.message;
      }
      if (!trimmedLabel) {
        newErrors.externalLabel =
          "버튼에 표시할 링크명을 입력해주세요 (예: Figma 프로토타입)";
      }
    } else if (trimmedLabel) {
      newErrors.externalUrl =
        "연결할 링크 URL을 입력해주세요 (예: https://figma.com)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const currentCatObj =
      localCategories.find((c) => c.id === category) || {
        id: category,
        label: category,
      };

    const isTeam = projectType === "team";

    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      category: currentCatObj.id,
      categoryLabel: currentCatObj.label,
      projectType,
      projectTypeLabel: isTeam ? "팀 프로젝트" : "개인 프로젝트",
      summary: summary.trim(),
      thumbnailUrl:
        thumbnailUrl.trim() ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
      detailImages: thumbnailUrl.trim() ? [thumbnailUrl.trim()] : [],
      period: period.trim() || "2026",
      role:
        role.trim() ||
        (isTeam
          ? "Team Product Designer (기여도 70%)"
          : "Creator & Designer (기여도 100%)"),
      tools: selectedTools.length > 0 ? selectedTools : ["Design"],
      description: description.trim() || summary.trim(),
      externalLink: trimmedUrl
        ? {
            label: trimmedLabel || "외부 링크 바로가기",
            url: trimmedUrl,
          }
        : undefined,
      orderIndex: 0,
    };

    onAdd(newProject, selectedTools);

    // 폼 초기화
    setTitle("");
    setSummary("");
    setExternalUrl("");
    setExternalLabel("");
    setThumbnailUrl("");
    setSelectedTools([]);
    setPeriod("");
    setRole("");
    setDescription("");
    setErrors({});
    onClose();
  };

  // 추천할 이전 도구 목록 (유저가 이미 추가했던 도구 중 현재 선택되지 않은 것)
  const unselectedSuggestedTools = savedTools.filter(
    (tool) => !selectedTools.includes(tool)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-full max-h-[90vh] overflow-y-auto p-0 rounded-[24px] border border-[#E5E8EB] bg-white shadow-2xl">
        {/* 모달 상단 헤더 */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 pt-6 pb-4 border-b border-[#F2F4F6]">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F3FF] text-[#3182F6]">
                <Link2 className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-[#191F28]">
                새 작업물 링크 추가
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#8B95A1] pl-10">
              포트폴리오에 등록할 프로젝트 정보와 외부 링크를 입력하세요.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          {/* 1. 작업 제목 */}
          <div>
            <label className="block text-xs font-bold text-[#191F28] mb-1.5">
              작업 제목 <span className="text-[#E8344E]">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="예: Toss 송금 인터랙션 리뉴얼"
              className={cn(
                "h-10 text-xs sm:text-sm",
                errors.title &&
                  "border-[#E8344E] focus-visible:border-[#E8344E] focus-visible:ring-[#E8344E]"
              )}
            />
            {errors.title && (
              <p className="text-[11px] text-[#E8344E] mt-1">{errors.title}</p>
            )}
          </div>

          {/* 2. 카테고리 (유저 직접 추가 지원) & 작업 구분 */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#191F28] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#3182F6]" />
                  <span>카테고리 선택</span>
                  <span className="text-[#E8344E]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-[11px] text-[#3182F6] font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>새 카테고리 추가</span>
                </button>
              </div>

              {/* 새 카테고리 직접 입력 폼 */}
              {isAddingCategory && (
                <div className="flex items-center gap-1.5 mb-2.5 p-2 bg-[#F9FAFB] rounded-xl border border-[#E5E8EB]">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewCategory();
                      }
                    }}
                    placeholder="새 카테고리명 (예: 패션, 산업디자인, 일러스트)"
                    className="h-8 text-xs bg-white flex-1"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddNewCategory()}
                    className="h-8 px-3 text-xs bg-[#3182F6] hover:bg-[#1B64DA] text-white"
                  >
                    추가
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName("");
                    }}
                    className="p-1 text-[#8B95A1] hover:text-[#191F28]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 카테고리 선택 칩 목록 */}
              <div className="flex flex-wrap gap-1.5">
                {localCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "py-1.5 px-3 text-xs font-bold rounded-xl border text-center transition-all",
                      category === cat.id
                        ? "bg-[#3182F6] text-white border-[#3182F6] shadow-xs"
                        : "bg-[#F9FAFB] text-[#4E5968] border-[#E5E8EB] hover:bg-[#F2F4F6]"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 작업 구분 (개인 vs 팀) */}
            <div>
              <label className="block text-xs font-bold text-[#191F28] mb-1.5">
                작업 구분 (개인 / 팀) <span className="text-[#E8344E]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProjectType("solo")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                    projectType === "solo"
                      ? "bg-[#191F28] text-white border-[#191F28] shadow-xs"
                      : "bg-[#F9FAFB] text-[#6B7684] border-[#E5E8EB] hover:bg-[#F2F4F6]"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>개인 프로젝트</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectType("team")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                    projectType === "team"
                      ? "bg-[#3182F6] text-white border-[#3182F6] shadow-xs"
                      : "bg-[#F9FAFB] text-[#6B7684] border-[#E5E8EB] hover:bg-[#F2F4F6]"
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>팀 프로젝트</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. 한 줄 소개 */}
          <div>
            <label className="block text-xs font-bold text-[#191F28] mb-1.5">
              한 줄 소개 <span className="text-[#E8344E]">*</span>
            </label>
            <Input
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                if (errors.summary) setErrors({ ...errors, summary: undefined });
              }}
              placeholder="작업물의 핵심 내용이나 역할을 한 줄로 요약해주세요"
              className={cn(
                "h-10 text-xs sm:text-sm",
                errors.summary &&
                  "border-[#E8344E] focus-visible:border-[#E8344E] focus-visible:ring-[#E8344E]"
              )}
            />
            {errors.summary && (
              <p className="text-[11px] text-[#E8344E] mt-1">{errors.summary}</p>
            )}
          </div>

          {/* 4. 외부 연결 링크 (URL 및 버튼 문구 입력 검증) */}
          <div className="rounded-2xl border border-[#E5E8EB] bg-[#F9FAFB] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#191F28]">
                <ExternalLink className="w-3.5 h-3.5 text-[#3182F6]" />
                <span>외부 연결 링크</span>
              </label>
              <span className="text-[10px] text-[#8B95A1]">선택 (Figma, Behance 등)</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#6B7684]">
                  링크 URL
                </label>
                {externalUrl.trim() && !errors.externalUrl && (
                  <span className="text-[10px] font-medium text-[#00A854] flex items-center gap-0.5">
                    <Check className="w-3 h-3" />
                    유효한 URL
                  </span>
                )}
              </div>
              <Input
                value={externalUrl}
                onChange={(e) => {
                  setExternalUrl(e.target.value);
                  if (errors.externalUrl) {
                    setErrors((prev) => ({ ...prev, externalUrl: undefined }));
                  }
                }}
                onBlur={handleUrlBlur}
                placeholder="https://... (예: https://figma.com/@project)"
                className={cn(
                  "h-9 text-xs bg-white",
                  errors.externalUrl &&
                    "border-[#E8344E] focus-visible:border-[#E8344E] focus-visible:ring-[#E8344E]"
                )}
              />
              {errors.externalUrl && (
                <p className="text-[11px] text-[#E8344E] mt-1">
                  {errors.externalUrl}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B7684] mb-1">
                링크 버튼 문구 (유저 입력 링크명)
              </label>
              <Input
                value={externalLabel}
                onChange={(e) => {
                  setExternalLabel(e.target.value);
                  if (errors.externalLabel) {
                    setErrors((prev) => ({ ...prev, externalLabel: undefined }));
                  }
                }}
                onBlur={handleLabelBlur}
                placeholder="버튼에 표시할 링크명을 입력하세요 (예: Figma 프로토타입 확인하기)"
                className={cn(
                  "h-9 text-xs bg-white",
                  errors.externalLabel &&
                    "border-[#E8344E] focus-visible:border-[#E8344E] focus-visible:ring-[#E8344E]"
                )}
              />
              {errors.externalLabel && (
                <p className="text-[11px] text-[#E8344E] mt-1">
                  {errors.externalLabel}
                </p>
              )}
            </div>

            <p className="text-[10px] text-[#8B95A1] leading-relaxed">
              * 외부 링크를 등록할 경우, 링크 URL과 버튼 문구를 모두 입력해야 합니다.
            </p>
          </div>

          {/* 5. 대표 썸네일 이미지 (추천 이미지 제거, 유저 업로드 및 URL 직접 입력만 지원) */}
          <div>
            <label className="block text-xs font-bold text-[#191F28] mb-1.5">
              대표 썸네일 이미지
            </label>

            {/* 이미지 미리보기 및 삭제 버튼 */}
            {thumbnailUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-[#E5E8EB] bg-[#F2F4F6] aspect-[16/9] mb-2.5 group">
                <img
                  src={thumbnailUrl}
                  alt="업로드된 썸네일"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-white text-xs font-bold text-[#191F28] rounded-lg shadow-sm hover:bg-[#F2F4F6]"
                  >
                    이미지 변경
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl("")}
                    className="px-2.5 py-1.5 bg-[#E8344E] text-xs font-bold text-white rounded-lg shadow-sm hover:bg-[#D02640]"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ) : null}

            {/* 유저 이미지 추가 방식: 파일 업로드 & URL 입력 */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-3 text-xs text-[#191F28] border-[#E5E8EB] hover:bg-[#F2F4F6] flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-[#3182F6]" />
                  <span>내 기기에서 파일 선택</span>
                </Button>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="또는 이미지 주소(URL) 직접 입력"
                  className="h-9 text-xs flex-1"
                />
              </div>
            </div>
          </div>

          {/* 6. 사용 도구 (미리 제시하는 도구 제거, 유저 입력 도구 + 이전 사용 도구 추천) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#191F28] flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-[#3182F6]" />
                <span>사용 도구</span>
              </label>
              <span className="text-[10px] text-[#8B95A1]">
                카드에는 상위 2개, 상세에는 전체 노출
              </span>
            </div>

            {/* 현재 선택된 도구 뱃지 목록 */}
            {selectedTools.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-[#F9FAFB] rounded-xl border border-[#E5E8EB]">
                {selectedTools.map((tool) => (
                  <Badge
                    key={tool}
                    variant="neutral"
                    className="bg-white text-[#191F28] border border-[#E5E8EB] pl-2 pr-1.5 py-1 text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <span>{tool}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
                      className="hover:text-[#E8344E] rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#8B95A1] mb-2">
                직접 도구를 입력하거나 이전에 추가했던 도구를 선택하세요.
              </p>
            )}

            {/* 도구 직접 입력 인풋 */}
            <div className="flex gap-1.5 mb-2.5">
              <Input
                value={customToolInput}
                onChange={(e) => setCustomToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTool();
                  }
                }}
                placeholder="도구명을 입력하세요 (예: Figma, CLO 3D, Rhino, Photoshop)"
                className="h-8 text-xs flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleAddTool()}
                className="h-8 px-3 text-xs text-[#3182F6] border-[#3182F6]/30 hover:bg-[#E8F3FF]"
              >
                추가
              </Button>
            </div>

            {/* 유저가 이미 추가했던 도구 추천 (이전에 사용했던 도구만 표시) */}
            {unselectedSuggestedTools.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-[#8B95A1] block mb-1">
                  이전에 추가했던 도구 (클릭하여 추가):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {unselectedSuggestedTools.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => handleSelectSuggestedTool(tool)}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg border border-[#E5E8EB] bg-[#F9FAFB] text-[#4E5968] hover:bg-[#E8F3FF] hover:text-[#3182F6] hover:border-[#3182F6]/30 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>{tool}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. 상세 정보 추가 입력 (접기/펼치기 아코디언) */}
          <div className="border-t border-[#F2F4F6] pt-3">
            <button
              type="button"
              onClick={() => setShowExtraFields(!showExtraFields)}
              className="flex items-center justify-between w-full py-1 text-xs font-semibold text-[#6B7684] hover:text-[#191F28] transition-colors"
            >
              <span>상세 정보 추가 입력 (기간, 역할, 상세 설명)</span>
              {showExtraFields ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showExtraFields && (
              <div className="space-y-3.5 mt-3 pt-2 bg-[#F9FAFB] p-3 rounded-2xl border border-[#E5E8EB]">
                <div>
                  <label className="block text-[11px] font-bold text-[#191F28] mb-1">
                    작업 기간
                  </label>
                  <Input
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="예: 2026.01 ~ 2026.03"
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#191F28] mb-1">
                    담당 역할 및 기여도
                  </label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="예: Lead Product Designer (기여도 100%)"
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#191F28] mb-1">
                    상세 케이스 스터디 설명
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="상세 다이얼로그 모달에서 보여줄 디자인 의도, 문제 해결 과정, 성과 등을 입력해주세요"
                    className="text-xs bg-white min-h-[70px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 모달 하단 버튼 */}
          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md pt-3 pb-2 -mx-6 px-6 border-t border-[#F2F4F6] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-xs font-semibold text-[#4E5968] border-[#E5E8EB] hover:bg-[#F2F4F6]"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="h-10 px-5 rounded-xl text-xs font-bold bg-[#3182F6] hover:bg-[#1B64DA] text-white active:scale-[0.98] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>링크 추가하기</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
