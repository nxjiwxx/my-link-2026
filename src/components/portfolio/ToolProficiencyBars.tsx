"use client";

import React, { useState } from "react";
import { Wrench, Plus, Pencil, Trash2, Check, X, Save } from "lucide-react";
import { ToolProficiency } from "@/types/portfolio";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMatchingToolSuggestions } from "@/lib/toolSuggestions";
import {
  FigmaIcon,
  ProtopieIcon,
  AdobeCcIcon,
  BlenderIcon,
  ReactIcon,
  PhotoshopIcon,
  IllustratorIcon,
  InDesignIcon,
  AfterEffectsIcon,
  PremiereProIcon,
  ClaudeIcon,
  GeminiIcon,
  ChatGptIcon,
  MidjourneyIcon,
  VscodeIcon,
  FramerIcon,
  NotionIcon,
  TypeScriptIcon,
  PythonIcon,
  GithubIcon,
} from "@/components/ui/icons";

const TOOL_DOMAINS: Record<string, string> = {
  figma: "figma.com",
  figjam: "figma.com",
  framer: "framer.com",
  protopie: "protopie.io",
  sketch: "sketch.com",
  photoshop: "adobe.com",
  illustrator: "adobe.com",
  indesign: "adobe.com",
  aftereffects: "adobe.com",
  premiere: "adobe.com",
  lightroom: "adobe.com",
  adobexd: "adobe.com",
  adobe: "adobe.com",
  claude: "claude.ai",
  gemini: "gemini.google.com",
  chatgpt: "openai.com",
  openai: "openai.com",
  gpt: "openai.com",
  midjourney: "midjourney.com",
  vscode: "code.visualstudio.com",
  cursor: "cursor.com",
  blender: "blender.org",
  cinema4d: "maxon.net",
  c4d: "maxon.net",
  spline: "spline.design",
  unreal: "unrealengine.com",
  unity: "unity.com",
  maya: "autodesk.com",
  rhino: "rhino3d.com",
  react: "react.dev",
  reactnative: "reactnative.dev",
  nextjs: "nextjs.org",
  next: "nextjs.org",
  vue: "vuejs.org",
  svelte: "svelte.dev",
  typescript: "typescriptlang.org",
  javascript: "developer.mozilla.org",
  tailwind: "tailwindcss.com",
  notion: "notion.so",
  slack: "slack.com",
  jira: "atlassian.com",
  linear: "linear.app",
  miro: "miro.com",
  zeplin: "zeplin.io",
  github: "github.com",
  git: "git-scm.com",
  python: "python.org",
  swift: "swift.org",
  swiftui: "apple.com",
  flutter: "flutter.dev",
  canva: "canva.com",
  webflow: "webflow.com",
  procreate: "procreate.art",
  lottie: "lottiefiles.com",
};

function getToolFaviconUrl(toolName: string): string | null {
  if (!toolName || !toolName.trim()) return null;
  const clean = toolName.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, domain] of Object.entries(TOOL_DOMAINS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }
  }
  return `https://www.google.com/s2/favicons?domain=${clean}.com&sz=64`;
}

export function ToolFavicon({ name, iconKey }: { name: string; iconKey?: string }) {
  const [hasError, setHasError] = useState(false);
  const lower = (name || "").toLowerCase().trim();

  // 1. 디자이너 & 개발자 주요 툴 공식 SVG 로고 정확한 우선 매핑
  if (lower.includes("illustrator") || lower.includes("일러스트") || lower.includes("일러") || lower === "ai") {
    return <IllustratorIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("photoshop") || lower.includes("포토샵") || lower === "ps") {
    return <PhotoshopIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("indesign") || lower.includes("인디자인") || lower === "id") {
    return <InDesignIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("after effects") || lower.includes("aftereffects") || lower.includes("애프터이펙트") || lower.includes("에펙") || lower === "ae") {
    return <AfterEffectsIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("premiere") || lower.includes("프리미어") || lower === "pr") {
    return <PremiereProIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("claude") || lower.includes("클로드") || lower.includes("anthropic")) {
    return <ClaudeIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("gemini") || lower.includes("제미나이")) {
    return <GeminiIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("chatgpt") || lower.includes("gpt") || lower.includes("지피티") || lower.includes("챗지피티") || lower.includes("openai")) {
    return <ChatGptIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("midjourney") || lower.includes("미드저니")) {
    return <MidjourneyIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("vscode") || lower.includes("vs code") || lower.includes("visual studio code") || lower.includes("브이에스코드")) {
    return <VscodeIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("figma") || lower.includes("피그마") || lower.includes("figjam") || iconKey === "figma") {
    return <FigmaIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("framer") || lower.includes("프레이머")) {
    return <FramerIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("protopie") || lower.includes("프로토파이") || iconKey === "protopie") {
    return <ProtopieIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("blender") || lower.includes("블렌더") || iconKey === "blender") {
    return <BlenderIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("notion") || lower.includes("노션")) {
    return <NotionIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("react") || lower.includes("리액트") || iconKey === "react") {
    return <ReactIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("typescript") || lower.includes("타입스크립트") || lower === "ts") {
    return <TypeScriptIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("python") || lower.includes("파이썬")) {
    return <PythonIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("github") || lower.includes("깃허브") || lower === "git") {
    return <GithubIcon className="w-4 h-4 shrink-0" />;
  }
  if (lower.includes("adobe") || iconKey === "adobe") {
    return <AdobeCcIcon className="w-4 h-4 shrink-0" />;
  }

  // 2. 외부 파비콘 서비스 fallback
  const faviconUrl = getToolFaviconUrl(name);
  if (faviconUrl && !hasError) {
    return (
      <img
        src={faviconUrl}
        alt={name}
        className="w-4 h-4 rounded-xs shrink-0 object-contain"
        onError={() => setHasError(true)}
      />
    );
  }

  return <Wrench className="w-3.5 h-3.5 text-[#8B95A1] shrink-0" />;
}

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

  const newToolSuggestions = isAdding && newName.trim()
    ? getMatchingToolSuggestions(newName, tools.map((t) => t.name), [], 4)
    : [];

  const editToolSuggestions = editingIndex !== null && editName.trim()
    ? getMatchingToolSuggestions(editName, tools.map((t) => t.name), [], 4)
    : [];

  const renderToolLogo = (name: string, iconKey?: string) => {
    return <ToolFavicon name={name} iconKey={iconKey} />;
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
    <Card className="rounded-xl border border-[#E5E8EB] bg-white select-none shadow-none">
      <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-[#4B5563]" />
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
            className="h-7 px-2.5 text-[11px] font-medium text-[#4E5968] bg-transparent border border-[#E5E8EB] hover:bg-[#F2F4F6] hover:text-[#191F28] rounded-lg gap-1 shadow-none transition-colors cursor-pointer"
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
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 flex items-center justify-center w-4 h-4 pointer-events-none text-[#8B95A1]">
                    <Wrench className="w-3.5 h-3.5 text-[#8B95A1]" />
                  </div>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="예: Figma, Framer, Photoshop, Claude"
                    className="h-8 text-xs bg-white pl-8 font-medium"
                    autoFocus
                  />
                </div>
                {/* 추천 도구 칩 (입력 시 관련 툴만 가로 1줄로 최대 4개 제안) */}
                {newToolSuggestions.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[10px] text-[#8B95A1] font-medium shrink-0">추천:</span>
                    {newToolSuggestions.slice(0, 4).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setNewName(sug)}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E5E8EB] text-[#4E5968] hover:text-[#3182F6] hover:border-[#3182F6] transition-colors cursor-pointer shrink-0"
                      >
                        <ToolFavicon name={sug} />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
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
                    <div className="relative flex items-center">
                      <div className="absolute left-2.5 flex items-center justify-center w-4 h-4 pointer-events-none text-[#8B95A1]">
                        <Wrench className="w-3.5 h-3.5 text-[#8B95A1]" />
                      </div>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="도구 이름"
                        className="h-8 text-xs bg-white pl-8 font-medium"
                      />
                    </div>
                    {/* 추천 도구 칩 (입력 시 관련 툴만 가로 1줄로 최대 4개 제안) */}
                    {editToolSuggestions.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[10px] text-[#8B95A1] font-medium shrink-0">추천:</span>
                        {editToolSuggestions.slice(0, 4).map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setEditName(sug)}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E5E8EB] text-[#4E5968] hover:text-[#3182F6] hover:border-[#3182F6] transition-colors cursor-pointer shrink-0"
                          >
                            <ToolFavicon name={sug} />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
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
                    {renderToolLogo(tool.name, tool.iconKey)}
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
