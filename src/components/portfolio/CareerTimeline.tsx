"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import { CareerItem } from "@/types/portfolio";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CareerTimelineProps {
  careers: CareerItem[];
}

export function CareerTimeline({ careers }: CareerTimelineProps) {
  return (
    <Card className="rounded-2xl border border-[#E5E8EB] bg-white select-none">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2 space-y-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F3FF] text-[#3182F6]">
          <Briefcase className="w-4 h-4" />
        </div>
        <CardTitle className="text-sm font-bold text-[#191F28]">
          경력 및 활동 (Experience & Awards)
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="relative pl-4 border-l-2 border-[#E5E8EB] space-y-4 my-1">
          {careers.map((career) => (
            <div key={career.id} className="relative">
              {/* 타임라인 불릿 닷 */}
              <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#3182F6] shadow-xs" />

              <div className="text-[11px] font-mono text-[#3182F6] font-bold">
                {career.period}
              </div>
              <div className="text-xs font-bold text-[#191F28] mt-0.5">
                {career.title}{" "}
                <span className="font-normal text-[#4E5968]">
                  · {career.organization}
                </span>
              </div>
              {career.description && (
                <p className="text-[11px] text-[#8B95A1] leading-relaxed mt-0.5">
                  {career.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
