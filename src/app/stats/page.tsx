"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  TrendingUp,
  FolderKanban,
  Award,
  Sparkles,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { ProjectItem } from "@/types/portfolio";
import { getLinksFromFirestore } from "@/lib/firestoreLinks";
import { getDesignerProfile } from "@/lib/portfolioStorage";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

const CHART_COLORS = [
  "#3182F6", // Toss Blue
  "#00C49F", // Teal
  "#FFBB28", // Amber
  "#FF8042", // Coral
  "#9061F9", // Purple
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#14B8A6", // Turquoise
];

export default function StatsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // 1. 비로그인 접근 차단 및 리다이렉트 (로그인 필수)
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/");
    }
  }, [user, isAuthLoading, router]);

  // 2. 프로젝트 데이터 로드 (Firestore 우선, 로컬스토리지 fallback)
  const loadStatsData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      const fsProjects = await getLinksFromFirestore(user.uid);
      if (fsProjects && fsProjects.length > 0) {
        setProjects(fsProjects);
      } else {
        const local = getDesignerProfile();
        setProjects(local.projects || []);
      }
    } catch (err) {
      console.warn("통계 데이터 로드 실패, 로컬 데이터 사용:", err);
      const local = getDesignerProfile();
      setProjects(local.projects || []);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStatsData();
    }
  }, [user]);

  // 3. 통계 지표 계산 (모든 링크 합산)
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalClicks = projects.reduce(
      (acc, cur) => acc + (cur.clickCount || 0),
      0
    );
    const avgClicks =
      totalProjects > 0 ? (totalClicks / totalProjects).toFixed(1) : "0";

    const sortedByClicks = [...projects].sort(
      (a, b) => (b.clickCount || 0) - (a.clickCount || 0)
    );
    const topProject =
      sortedByClicks.length > 0 && (sortedByClicks[0].clickCount || 0) > 0
        ? sortedByClicks[0]
        : null;

    return {
      totalClicks,
      totalProjects,
      avgClicks,
      topProject,
      sortedByClicks,
    };
  }, [projects]);

  // 차트 데이터 구성: 프로젝트별 클릭수
  const barChartData = useMemo(() => {
    return stats.sortedByClicks.slice(0, 7).map((p, index) => ({
      name: p.title.length > 10 ? `${p.title.slice(0, 9)}…` : p.title,
      fullName: p.title,
      clicks: p.clickCount || 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [stats.sortedByClicks]);

  // 카테고리별 클릭수 데이터 구성
  const categoryPieData = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p) => {
      const cat = p.categoryLabel || "기타";
      map.set(cat, (map.get(cat) || 0) + (p.clickCount || 0));
    });

    return Array.from(map.entries())
      .map(([name, value], index) => ({
        name,
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter((item) => item.value > 0);
  }, [projects]);

  const chartConfig = {
    clicks: {
      label: "클릭 수",
      color: "#3182F6",
    },
  } satisfies ChartConfig;

  // 인증 대기 화면
  if (isAuthLoading || (!user && !isAuthLoading)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-5 h-5 border-2 border-[#3182F6]/30 border-t-[#3182F6] rounded-full animate-spin" />
      </div>
    );
  }

  const containerClasses =
    "w-full max-w-[680px] my-0 sm:my-6 rounded-none sm:rounded-2xl border-0 sm:border border-[#E5E8EB] shadow-none sm:shadow-sm bg-white flex flex-col pb-16 transition-all duration-300";

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] text-[#191F28] flex flex-col items-center">
      <main className={containerClasses}>
        {/* 상단 네비게이션 헤더 (중앙 정렬 타이틀 & 아이콘 뒤로가기) */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#E5E8EB] flex items-center justify-between select-none relative">
          <Link
            href="/"
            aria-label="내 포트폴리오로 돌아가기"
            title="내 포트폴리오로 돌아가기"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F2F4F6] text-[#4E5968] hover:text-[#191F28] transition-colors -ml-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <span className="absolute left-1/2 -translate-x-1/2 text-xs sm:text-sm font-bold text-[#191F28]">
            통계 대시보드
          </span>

          <button
            type="button"
            onClick={loadStatsData}
            aria-label="새로고침"
            title="새로고침"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F2F4F6] text-[#6B7684] hover:text-[#191F28] transition-colors -mr-1"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoadingData ? "animate-spin text-[#3182F6]" : ""}`}
            />
          </button>
        </header>

        {/* 본문 콘텐츠 */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* 타이틀 및 소개 */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3182F6] mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>방문자 유입 및 링크 분석</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#191F28] tracking-tight">
              프로젝트 클릭 통계
            </h1>
            <p className="text-xs text-[#6B7684] mt-1 leading-relaxed">
              방문자가 내 포트폴리오에서 어떤 프로젝트에 가장 관심이 많았는지 확인해보세요.
              (본인 클릭 제외)
            </p>
          </div>

          {/* 1. 상단 핵심 지표 카드 (KPI Grids) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* 총 클릭 수 (모든 링크 합산) */}
            <div className="bg-[#F9FAFB] border border-[#E5E8EB] rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#8B95A1] mb-2">
                <span className="text-[11px] font-semibold">총 클릭 수</span>
                <Eye className="w-3.5 h-3.5 text-[#3182F6]" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#191F28] tracking-tight">
                  {stats.totalClicks.toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-[#8B95A1] ml-1">
                  회
                </span>
              </div>
            </div>

            {/* 등록된 프로젝트 수 */}
            <div className="bg-[#F9FAFB] border border-[#E5E8EB] rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#8B95A1] mb-2">
                <span className="text-[11px] font-semibold">등록 프로젝트</span>
                <FolderKanban className="w-3.5 h-3.5 text-[#6B7684]" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#191F28] tracking-tight">
                  {stats.totalProjects}
                </span>
                <span className="text-[11px] font-medium text-[#8B95A1] ml-1">
                  개
                </span>
              </div>
            </div>

            {/* 프로젝트당 평균 클릭 수 */}
            <div className="bg-[#F9FAFB] border border-[#E5E8EB] rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#8B95A1] mb-2">
                <span className="text-[11px] font-semibold">평균 클릭 수</span>
                <BarChart3 className="w-3.5 h-3.5 text-[#6B7684]" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#191F28] tracking-tight">
                  {stats.avgClicks}
                </span>
                <span className="text-[11px] font-medium text-[#8B95A1] ml-1">
                  회
                </span>
              </div>
            </div>

            {/* 최고 인기 프로젝트 */}
            <div className="bg-[#F9FAFB] border border-[#E5E8EB] rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#8B95A1] mb-2">
                <span className="text-[11px] font-semibold">최고 인기작</span>
                <Award className="w-3.5 h-3.5 text-[#FFBB28]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#191F28] truncate">
                  {stats.topProject ? stats.topProject.title : "-"}
                </p>
                <p className="text-[11px] text-[#3182F6] font-semibold mt-0.5">
                  {stats.topProject
                    ? `${(stats.topProject.clickCount || 0).toLocaleString()}회 클릭`
                    : "데이터 없음"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. shadcn 차트 영역: 프로젝트별 클릭 수 막대 차트 */}
          <div className="bg-white border border-[#E5E8EB] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#191F28]">
                  프로젝트별 클릭 수 비교
                </h3>
                <p className="text-[11px] text-[#8B95A1]">
                  상위 프로젝트의 개별 누적 클릭수입니다
                </p>
              </div>
              <span className="text-[10px] font-medium text-[#3182F6] bg-[#3182F6]/10 px-2 py-0.5 rounded-md">
                상위 {barChartData.length}개
              </span>
            </div>

            {barChartData.length > 0 && stats.totalClicks > 0 ? (
              <ChartContainer config={chartConfig} className="h-60 sm:h-72 w-full">
                <BarChart
                  data={barChartData}
                  margin={{ top: 16, right: 12, left: -20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F2F4F6"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: "#E5E8EB" }}
                    tick={{ fill: "#6B7684", fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#8B95A1", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(49, 130, 246, 0.05)" }}
                    content={
                      <ChartTooltipContent
                        hideIndicator={false}
                        labelFormatter={(_, payload) => {
                          const item = payload?.[0]?.payload;
                          return item?.fullName || "";
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="clicks"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-48 rounded-xl border border-dashed border-[#E5E8EB] bg-[#F9FAFB] flex flex-col items-center justify-center p-4 text-center">
                <BarChart3 className="w-6 h-6 text-[#8B95A1] mb-2" />
                <p className="text-xs font-semibold text-[#191F28]">
                  아직 기록된 클릭 수가 없습니다
                </p>
                <p className="text-[11px] text-[#8B95A1] mt-0.5">
                  방문자가 포트폴리오 링크를 클릭하면 실시간으로 차트가 갱신됩니다
                </p>
              </div>
            )}
          </div>

          {/* 3. 카테고리별 클릭 점유율 (도넛 차트) & 프로젝트 순위 목록 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 카테고리별 점유율 */}
            <div className="bg-white border border-[#E5E8EB] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#191F28]">
                  카테고리별 클릭 점유율
                </h3>
                <p className="text-[11px] text-[#8B95A1]">
                  어떤 디자인 분야의 반응이 가장 좋은지 확인하세요
                </p>
              </div>

              {categoryPieData.length > 0 ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-48 h-48">
                    <ChartContainer
                      config={chartConfig}
                      className="w-full h-full aspect-square"
                    >
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={categoryPieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={48}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-1.5 pt-2">
                    {categoryPieData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-xs px-2 py-1 bg-[#F9FAFB] rounded-lg"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-[#4E5968] truncate text-[11px]">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#191F28] text-[11px]">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-36 rounded-xl border border-dashed border-[#E5E8EB] bg-[#F9FAFB] flex flex-col items-center justify-center p-3 text-center">
                  <p className="text-xs text-[#8B95A1]">카테고리별 클릭 데이터가 아직 없습니다</p>
                </div>
              )}
            </div>

            {/* 개별 링크 상세 순위 테이블 */}
            <div className="bg-white border border-[#E5E8EB] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#191F28]">
                  프로젝트별 상세 클릭 순위
                </h3>
                <p className="text-[11px] text-[#8B95A1]">
                  가장 많이 조회된 프로젝트 목록
                </p>
              </div>

              {stats.sortedByClicks.length > 0 ? (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {stats.sortedByClicks.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-[#F2F4F6] hover:bg-[#F9FAFB] transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            idx === 0
                              ? "bg-[#3182F6] text-white"
                              : idx === 1
                              ? "bg-[#E8F3FF] text-[#3182F6]"
                              : idx === 2
                              ? "bg-[#F2F4F6] text-[#4E5968]"
                              : "text-[#8B95A1]"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#191F28] truncate">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-[#8B95A1]">
                            {p.categoryLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 font-mono text-xs font-bold text-[#191F28] bg-[#F2F4F6] px-2 py-0.5 rounded-md">
                        <Eye className="w-3 h-3 text-[#3182F6]" />
                        <span>{(p.clickCount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-36 rounded-xl border border-dashed border-[#E5E8EB] bg-[#F9FAFB] flex flex-col items-center justify-center p-3 text-center">
                  <p className="text-xs text-[#8B95A1]">등록된 프로젝트가 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
