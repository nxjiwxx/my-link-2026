"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Link2,
  Users,
  User,
  Plus,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Upload,
  Check,
  Wrench,
  Tag,
  Loader2,
  Save,
} from "lucide-react";
import {
  ProjectItem,
  ProjectCategory,
  ProjectType,
  CategoryItem,
  DEFAULT_CATEGORIES,
} from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { compressImageFile } from "@/lib/imageUtils";
import { getMatchingToolSuggestions } from "@/lib/toolSuggestions";

interface ProjectInlineEditCardProps {
  project: ProjectItem;
  availableCategories?: CategoryItem[];
  savedTools?: string[];
  onAddCategory?: (category: CategoryItem) => void;
  onSave: (updatedProject: ProjectItem, newTools: string[]) => Promise<void> | void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ProjectInlineEditCard({
  project,
  availableCategories = DEFAULT_CATEGORIES,
  savedTools = [],
  onAddCategory,
  onSave,
  onCancel,
  isSaving = false,
}: ProjectInlineEditCardProps) {
  // 기존 프로젝트 정보로 초기화
  const [title, setTitle] = useState(project.title || "");
  const [category, setCategory] = useState<ProjectCategory>(
    project.category || availableCategories[0]?.id || "uiux"
  );
  const [projectType, setProjectType] = useState<ProjectType>(
    project.projectType || "solo"
  );
  const [summary, setSummary] = useState(project.summary || "");

  // 카테고리 직접 추가 관련 상태
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [localCategories, setLocalCategories] =
    useState<CategoryItem[]>(availableCategories);

  // 외부 연결 링크 관련 상태
  const [externalUrl, setExternalUrl] = useState(
    project.externalLink?.url || ""
  );
  const [externalLabel, setExternalLabel] = useState(
    project.externalLink?.label || ""
  );

  // 썸네일 이미지 관련 상태
  const [thumbnailUrl, setThumbnailUrl] = useState(project.thumbnailUrl || "");
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용 도구 관련 상태
  const [selectedTools, setSelectedTools] = useState<string[]>(
    project.tools || []
  );
  const [customToolInput, setCustomToolInput] = useState("");

  // 추가 상세 정보 (기간, 역할, 상세 설명)
  const [period, setPeriod] = useState(project.period || "");
  const [role, setRole] = useState(project.role || "");
  const [description, setDescription] = useState(project.description || "");
  const [showExtraFields, setShowExtraFields] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    summary?: string;
    externalUrl?: string;
    externalLabel?: string;
  }>({});

  React.useEffect(() => {
    setLocalCategories(availableCategories);
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

  // 이미지 업로드 압축
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImageFile(file, 800, 0.75);
      setThumbnailUrl(compressedDataUrl);
    } catch (error) {
      console.error("이미지 압축 실패:", error);
      alert("이미지를 처리하는 중 오류가 발생했습니다.");
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddTool = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customToolInput.trim();
    if (trimmed && !selectedTools.includes(trimmed)) {
      setSelectedTools([...selectedTools, trimmed]);
      setCustomToolInput("");
    }
  };

  const handleSelectSuggestedTool = (tool: string) => {
    if (!selectedTools.includes(tool)) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleRemoveTool = (tool: string) => {
    setSelectedTools(selectedTools.filter((t) => t !== tool));
  };

  // 저장 제출 핸들러 (AddLinkModal과 동일한 검증)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

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

    let trimmedUrl = externalUrl.trim();
    const trimmedLabel = externalLabel.trim();

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

    const updatedProject: ProjectItem = {
      ...project,
      title: title.trim(),
      category: currentCatObj.id,
      categoryLabel: currentCatObj.label,
      projectType,
      projectTypeLabel: isTeam ? "팀 프로젝트" : "개인 프로젝트",
      summary: summary.trim(),
      thumbnailUrl:
        thumbnailUrl.trim() ||
        project.thumbnailUrl ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
      detailImages: thumbnailUrl.trim()
        ? [thumbnailUrl.trim()]
        : project.detailImages,
      period: period.trim() || project.period || "2026",
      role:
        role.trim() ||
        project.role ||
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
      clickCount: project.clickCount ?? 0,
    };

    await onSave(updatedProject, selectedTools);
  };

  const suggestedTools = useMemo(() => {
    return getMatchingToolSuggestions(
      customToolInput,
      selectedTools,
      savedTools
    );
  }, [customToolInput, selectedTools, savedTools]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-1">
        {/* ======================================================== */}
        {/* 1. 커버 / 대표 썸네일 (노션 페이지 커버 스타일) */}
        {/* ======================================================== */}
        <div className="space-y-2 pb-4 border-b border-[#F2F4F6]">
          {thumbnailUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-[#E5E8EB] bg-[#F9FAFB] aspect-[16/9] group shadow-none">
              <img
                src={thumbnailUrl}
                alt="대표 썸네일 미리보기"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-xs font-medium text-[#191F28] rounded-md hover:bg-[#F2F4F6] cursor-pointer shadow-none transition-colors"
                >
                  이미지 변경
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailUrl("")}
                  className="px-3 py-1.5 bg-[#E8344E] text-xs font-medium text-white rounded-md hover:bg-[#D02640] cursor-pointer shadow-none transition-colors"
                >
                  제거
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#D1D6DB] hover:border-[#8B95A1] bg-[#FAFAFA] hover:bg-[#F2F4F6] rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-[#E5E8EB] flex items-center justify-center text-[#8B95A1]">
                <Upload className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[#191F28]">
                  대표 썸네일 추가
                </p>
                <p className="text-[11px] text-[#8B95A1]">
                  클릭하여 이미지 파일 업로드 (권장 16:9 비율)
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* 이미지 URL 직접 입력 필드 */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={isCompressing}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-2.5 text-xs text-[#4E5968] bg-transparent border-[#E5E8EB] hover:bg-[#F2F4F6] flex items-center gap-1.5 shrink-0 rounded-lg cursor-pointer shadow-none"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isCompressing ? "업로드 중..." : "파일 선택"}</span>
            </Button>
            <Input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="또는 이미지 주소(URL) 직접 붙여넣기"
              className="h-8 text-xs flex-1 bg-transparent border-[#E5E8EB] hover:bg-white focus:bg-white"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. 첨부 이미지 스타일 입력 필드 테이블 (좌측 볼드 레이블, 우측 인풋) */}
        {/* ======================================================== */}

        {/* 필드 1: 작업 제목 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
          <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0">
            작업 제목 <span className="text-[#E8344E]">*</span>
          </label>
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="작업 제목을 입력하세요"
              className={cn(
                "h-9 text-xs sm:text-sm bg-white border-[#E5E8EB]",
                errors.title && "border-[#E8344E]"
              )}
            />
            {errors.title && (
              <p className="text-[11px] text-[#E8344E] mt-1 font-medium">{errors.title}</p>
            )}
          </div>
        </div>

        {/* 필드 2: 한 줄 소개 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
          <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0">
            한 줄 소개 <span className="text-[#E8344E]">*</span>
          </label>
          <div className="flex-1">
            <Input
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                if (errors.summary) setErrors({ ...errors, summary: undefined });
              }}
              placeholder="작업물에 대한 한 줄 소개를 입력하세요"
              className={cn(
                "h-9 text-xs sm:text-sm bg-white border-[#E5E8EB]",
                errors.summary && "border-[#E8344E]"
              )}
            />
            {errors.summary && (
              <p className="text-[11px] text-[#E8344E] mt-1 font-medium">{errors.summary}</p>
            )}
          </div>
        </div>

        {/* 필드 3: 작업 구분 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
          <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0 flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#4E5968]" />
            <span>작업 구분</span>
            <span className="text-[#E8344E]">*</span>
          </label>
          <div className="flex-1">
            <div className="inline-flex rounded-lg bg-[#F2F4F6] p-0.5 border border-[#E5E8EB]/60">
              <button
                type="button"
                onClick={() => setProjectType("solo")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                  projectType === "solo"
                    ? "bg-white text-[#191F28] font-bold shadow-none"
                    : "text-[#6B7684] hover:text-[#191F28]"
                )}
              >
                <User className="w-3.5 h-3.5" />
                <span>개인 프로젝트</span>
              </button>
              <button
                type="button"
                onClick={() => setProjectType("team")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                  projectType === "team"
                    ? "bg-white text-[#191F28] font-bold shadow-none"
                    : "text-[#6B7684] hover:text-[#191F28]"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span>팀 프로젝트</span>
              </button>
            </div>
          </div>
        </div>

        {/* 필드 4: 카테고리 */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
          <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0 sm:pt-1.5 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#4E5968]" />
            <span>카테고리</span>
            <span className="text-[#E8344E]">*</span>
          </label>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {localCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md border text-center transition-all cursor-pointer font-medium",
                    category === cat.id
                      ? "bg-[#191F28] text-white border-[#191F28] font-bold"
                      : "bg-[#FAFAFA] text-[#4E5968] border-[#E5E8EB] hover:bg-[#F2F4F6] hover:text-[#191F28]"
                  )}
                >
                  {cat.label}
                </button>
              ))}
              {!isAddingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8B95A1] hover:text-[#191F28] border border-dashed border-[#D1D6DB] hover:border-[#8B95A1] rounded-md transition-all cursor-pointer font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>새 카테고리</span>
                </button>
              ) : null}
            </div>

            {isAddingCategory && (
              <div className="flex items-center gap-1.5 p-1 bg-[#F9FAFB] rounded-lg border border-[#E5E8EB] max-w-sm">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewCategory();
                    }
                  }}
                  placeholder="새 카테고리명"
                  className="h-8 text-xs bg-white flex-1"
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddNewCategory()}
                  className="h-8 px-3 text-xs bg-[#191F28] hover:bg-[#333D4B] text-white rounded-md shadow-none"
                >
                  확인
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }}
                  className="p-1 text-[#8B95A1] hover:text-[#191F28]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 필드 5: 사용 도구 (외부 링크와 위치 변경! 입력창이 레이블과 같은 라인, 추가한 도구는 입력창 아래 위치) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
          <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0 sm:pt-1.5 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-[#4E5968]" />
            <span>사용 도구</span>
          </label>
          <div className="flex-1 space-y-2.5">
            {/* 1행: 입력창이 [사용 도구]와 같은 라인에 위치 */}
            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={customToolInput}
                onChange={(e) => setCustomToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTool();
                  }
                }}
                placeholder="도구명을 입력하세요"
                className="h-8.5 text-xs bg-white border-[#E5E8EB] flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleAddTool()}
                className="h-8.5 px-3 text-xs font-medium text-[#4E5968] bg-transparent border-[#E5E8EB] hover:bg-[#F2F4F6] hover:text-[#191F28] rounded-lg shadow-none cursor-pointer shrink-0"
              >
                추가
              </Button>
            </div>

            {/* 2행: 추가한 도구들은 검색창 아래에 추가 */}
            {selectedTools.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {selectedTools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F2F4F6] text-[#333D4B] border border-[#E5E8EB]"
                  >
                    <span>{tool}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
                      className="text-[#8B95A1] hover:text-[#E8344E] transition-colors p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 추천 도구 알약 */}
            {suggestedTools.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[11px] text-[#8B95A1] mr-1">추천:</span>
                {suggestedTools.map((tool) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => {
                      if (!selectedTools.includes(tool)) {
                        setSelectedTools((prev) => [...prev, tool]);
                        setCustomToolInput("");
                      }
                    }}
                    className="text-[11px] px-2 py-0.5 rounded border border-[#E5E8EB] bg-[#FAFAFA] text-[#6B7684] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors cursor-pointer"
                  >
                    +{tool}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 필드 6: 외부 연결 링크 (사용 도구 아래로 위치 변경) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4 py-3.5 border-b border-[#F2F4F6]">
          <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0 sm:pt-1.5 flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-[#4E5968]" />
            <span>외부 링크</span>
          </label>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Input
                  value={externalUrl}
                  onChange={(e) => {
                    setExternalUrl(e.target.value);
                    if (errors.externalUrl) {
                      setErrors((prev) => ({ ...prev, externalUrl: undefined }));
                    }
                  }}
                  onBlur={handleUrlBlur}
                  placeholder="URL (예: https://figma.com/...)"
                  className={cn(
                    "h-8.5 text-xs bg-white border-[#E5E8EB]",
                    errors.externalUrl && "border-[#E8344E]"
                  )}
                />
                {errors.externalUrl && (
                  <p className="text-[10px] text-[#E8344E] mt-1 font-medium">{errors.externalUrl}</p>
                )}
              </div>
              <div>
                <Input
                  value={externalLabel}
                  onChange={(e) => {
                    setExternalLabel(e.target.value);
                    if (errors.externalLabel) {
                      setErrors((prev) => ({ ...prev, externalLabel: undefined }));
                    }
                  }}
                  onBlur={handleLabelBlur}
                  placeholder="버튼 문구 (예: Figma 프로토타입)"
                  className={cn(
                    "h-8.5 text-xs bg-white border-[#E5E8EB]",
                    errors.externalLabel && "border-[#E8344E]"
                  )}
                />
                {errors.externalLabel && (
                  <p className="text-[10px] text-[#E8344E] mt-1 font-medium">{errors.externalLabel}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. 상세 정보 접기/펼치기 (노션 토글 블록 스타일) */}
        {/* ======================================================== */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowExtraFields(!showExtraFields)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#8B95A1] hover:text-[#191F28] transition-colors p-1.5 -ml-1 rounded-md hover:bg-[#F2F4F6]"
          >
            {showExtraFields ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>상세 속성 {showExtraFields ? "접기" : "더보기 (작업 기간, 담당 역할, 상세 설명)"}</span>
          </button>

          {showExtraFields && (
            <div className="space-y-1 mt-2 pt-2 border-t border-[#F2F4F6] animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-3 border-b border-[#F2F4F6]">
                <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0">
                  작업 기간
                </label>
                <Input
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="예: 2026.01 ~ 2026.03"
                  className="h-8.5 text-xs bg-white border-[#E5E8EB] flex-1"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-3 border-b border-[#F2F4F6]">
                <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0">
                  담당 역할 및 기여도
                </label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="예: 리드 프로덕트 디자이너 (기여도 80%)"
                  className="h-8.5 text-xs bg-white border-[#E5E8EB] flex-1"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4 py-3 border-b border-[#F2F4F6]">
                <label className="w-28 sm:w-36 text-xs sm:text-sm font-bold text-[#191F28] shrink-0 sm:pt-2">
                  상세 설명
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="프로젝트의 배경, 해결하고자 한 문제, 구체적인 디자인 과정과 성과를 작성해주세요..."
                  className="text-xs bg-white border-[#E5E8EB] flex-1 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. 하단 액션 버튼: [취소] [저장하기] (아이콘 삭제, 텍스트 저장하기로 변경) */}
        {/* ======================================================== */}
        <div className="flex items-center justify-end gap-2 pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onCancel}
            className="h-9 px-4 text-xs font-medium text-[#6B7684] bg-transparent border-[#E5E8EB] hover:bg-[#F2F4F6] hover:text-[#191F28] rounded-lg shadow-none cursor-pointer transition-colors"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-9 px-5 text-xs font-semibold bg-[#191F28] hover:bg-[#333D4B] text-white rounded-lg shadow-none flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>저장 중...</span>
              </>
            ) : (
              <span>저장하기</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
