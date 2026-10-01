"use client";

import React from "react";
import { Wrench } from "lucide-react";
import { ToolProficiency } from "@/types/portfolio";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FigmaIcon,
  ProtopieIcon,
  AdobeCcIcon,
  BlenderIcon,
  ReactIcon,
} from "@/components/ui/icons";

interface ToolProficiencyBarsProps {
  tools: ToolProficiency[];
}

export function ToolProficiencyBars({ tools }: ToolProficiencyBarsProps) {
  const renderToolLogo = (iconKey?: string) => {
    switch (iconKey) {
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

  return (
    <Card className="rounded-2xl border border-[#E5E8EB] bg-white select-none">
      <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F3FF] text-[#3182F6]">
            <Wrench className="w-4 h-4" />
          </div>
          <CardTitle className="text-sm font-bold text-[#191F28]">
            사용 도구 숙련도 (Tools & Skills)
          </CardTitle>
        </div>
        <span className="text-[11px] text-[#8B95A1] font-mono">Proficiency</span>
      </CardHeader>

      <CardContent className="p-4 pt-1 space-y-3.5">
        {tools.map((tool) => (
          <div key={tool.name} className="space-y-1.5">
            {/* 상단: 도구 로고, 이름 및 퍼센트 수치 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2F4F6]">
                  {renderToolLogo(tool.iconKey)}
                </div>
                <span className="font-bold text-[#191F28]">{tool.name}</span>
                {tool.experience && (
                  <span className="hidden sm:inline-block text-[11px] text-[#8B95A1]">
                    ({tool.experience})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-[#3182F6]">{tool.level}%</span>
              </div>
            </div>

            {/* 프로그레스 바 트랙 및 채움 */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2F4F6]">
              <div
                className="h-full rounded-full bg-[#3182F6] transition-all duration-700 ease-out"
                style={{ width: `${tool.level}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
