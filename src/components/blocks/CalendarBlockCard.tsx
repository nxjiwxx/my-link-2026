"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  List,
} from "lucide-react";
import { CalendarBlock, CalendarEventItem } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarBlockCardProps {
  block: CalendarBlock;
}

export function CalendarBlockCard({ block }: CalendarBlockCardProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "agenda">(
    block.defaultView || "calendar"
  );
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-05");

  // 카테고리 뱃지 매핑
  const renderCategoryBadge = (category: CalendarEventItem["category"]) => {
    switch (category) {
      case "collab":
        return <Badge variant="warning">공구마켓</Badge>;
      case "live":
        return <Badge variant="best">인스타LIVE</Badge>;
      case "event":
        return <Badge variant="default">쇼룸팝업</Badge>;
      default:
        return <Badge variant="neutral">안내</Badge>;
    }
  };

  // 2026년 10월 미니 캘린더 생성 (PRD 타임라인 2026-10)
  const currentYear = 2026;
  const currentMonth = 10;
  const daysInMonth = 31;
  const firstDayWeekday = 4; // 2026-10-01 목요일 (0:일, 1:월, 2:화, 3:수, 4:목, 5:금, 6:토)

  const calendarDays = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // 날짜별 이벤트 매핑
  const eventDateMap = new Map<string, CalendarEventItem[]>();
  block.events.forEach((ev) => {
    const list = eventDateMap.get(ev.date) || [];
    list.push(ev);
    eventDateMap.set(ev.date, list);
  });

  const selectedEvents = eventDateMap.get(selectedDate) || [];

  return (
    <Card className="overflow-hidden border border-[#E5E8EB] bg-white rounded-2xl">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F3FF] text-[#3182F6]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <CardTitle className="text-sm font-bold text-[#191F28]">
            {block.title}
          </CardTitle>
        </div>

        {/* 뷰 전환 탭 (달력 / 아젠다) */}
        <div className="flex items-center rounded-lg bg-[#F2F4F6] p-0.5 text-xs font-semibold">
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 transition-all",
              viewMode === "calendar"
                ? "bg-white text-[#191F28] shadow-xs"
                : "text-[#4E5968] hover:text-[#191F28]"
            )}
          >
            <CalendarIcon className="w-3 h-3" />
            달력
          </button>
          <button
            onClick={() => setViewMode("agenda")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 transition-all",
              viewMode === "agenda"
                ? "bg-white text-[#191F28] shadow-xs"
                : "text-[#4E5968] hover:text-[#191F28]"
            )}
          >
            <List className="w-3 h-3" />
            목록
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {viewMode === "calendar" ? (
          <div>
            {/* 달력 헤더 월 표시 */}
            <div className="flex items-center justify-between py-2 text-xs font-bold text-[#191F28]">
              <span className="text-sm">2026년 10월</span>
              <div className="flex items-center gap-1 text-[#8B95A1]">
                <button className="p-1 hover:text-[#191F28] disabled:opacity-40" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:text-[#191F28] disabled:opacity-40" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-[#8B95A1] py-1 border-b border-[#F2F4F6]">
              <span className="text-[#F04452]">일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span>토</span>
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs py-2">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-8" />;
                }

                const dateStr = `2026-10-${String(day).padStart(2, "0")}`;
                const hasEvent = eventDateMap.has(dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "relative flex flex-col items-center justify-center h-8 rounded-lg font-medium transition-all",
                      isSelected
                        ? "bg-[#3182F6] text-white font-bold shadow-xs"
                        : hasEvent
                        ? "bg-[#E8F3FF] text-[#3182F6] font-bold hover:bg-[#D5E9FF]"
                        : "text-[#191F28] hover:bg-[#F2F4F6]"
                    )}
                  >
                    <span>{day}</span>
                    {hasEvent && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#3182F6]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 선택된 날짜의 이벤트 목록 */}
            <div className="mt-3 pt-3 border-t border-[#F2F4F6]">
              <div className="text-xs font-semibold text-[#8B95A1] mb-2 flex items-center justify-between">
                <span>{selectedDate} 일정</span>
                {selectedEvents.length > 0 && (
                  <span className="text-[#3182F6]">{selectedEvents.length}개</span>
                )}
              </div>

              {selectedEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E8EB] text-left"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-[#191F28]">
                          {ev.title}
                        </span>
                        {renderCategoryBadge(ev.category)}
                      </div>
                      {ev.time && (
                        <div className="flex items-center gap-1 text-[11px] text-[#4E5968] mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{ev.time}</span>
                        </div>
                      )}
                      {ev.description && (
                        <p className="text-[11px] text-[#4E5968] leading-tight">
                          {ev.description}
                        </p>
                      )}
                      {ev.linkUrl && (
                        <a
                          href={ev.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#3182F6] hover:underline"
                        >
                          상세보기 바로가기
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-[#8B95A1]">
                  선택한 날짜에 예정된 일정이 없어요.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 전체 아젠다 리스트 뷰 */
          <div className="space-y-2.5 py-1">
            {block.events.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E8EB] transition-all hover:border-[#D1D6DB]"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#3182F6] font-mono">
                      {ev.date}
                    </span>
                    {ev.time && (
                      <span className="text-[11px] text-[#8B95A1] font-mono">
                        ({ev.time})
                      </span>
                    )}
                  </div>
                  {renderCategoryBadge(ev.category)}
                </div>

                <div className="text-sm font-bold text-[#191F28] mb-1">
                  {ev.title}
                </div>

                {ev.description && (
                  <p className="text-xs text-[#4E5968] leading-relaxed mb-2">
                    {ev.description}
                  </p>
                )}

                {ev.linkUrl && (
                  <a
                    href={ev.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#3182F6] hover:underline"
                  >
                    일정 참여 및 확인하기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
