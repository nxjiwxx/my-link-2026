/**
 * 디자이너 및 개발자를 위한 추천 도구 목록 및 검색 유틸리티
 */
/**
 * 디자이너 및 개발자를 위한 추천 도구 목록 및 검색 유틸리티
 */
export const POPULAR_TOOLS: string[] = [
  // UI/UX & 디자인 툴
  "Figma",
  "FigJam",
  "Framer",
  "ProtoPie",
  "Sketch",
  "Adobe XD",
  "Miro",
  "Zeplin",

  // Adobe & 비주얼 그래픽 툴
  "Illustrator",
  "Photoshop",
  "InDesign",
  "After Effects",
  "Premiere Pro",
  "Lightroom",
  "Procreate",
  "Canva",

  // 생성형 AI & 스마트 도구 (디자이너 & 개발자 필수)
  "Claude",
  "Gemini",
  "ChatGPT",
  "Midjourney",
  "GitHub Copilot",
  "Cursor",
  "v0",

  // 3D & 모션 & 모델링
  "Blender",
  "Cinema 4D",
  "Spline",
  "Unreal Engine",
  "Unity",
  "Maya",
  "Rhino",

  // 개발 & 프론트엔드 & 에디터
  "VS Code",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Python",
  "SwiftUI",
  "Flutter",
  "GitHub",
  "Docker",

  // 협업 & 생산성
  "Notion",
  "Linear",
  "Slack",
  "Jira",
];

// 한글 검색어 및 약어 동의어 매핑
export const TOOL_ALIASES: Record<string, string[]> = {
  클로드: ["Claude"],
  제미나이: ["Gemini"],
  미드저니: ["Midjourney"],
  지피티: ["ChatGPT"],
  챗지피티: ["ChatGPT"],
  gpt: ["ChatGPT"],
  포토샵: ["Photoshop"],
  일러스트: ["Illustrator"],
  일러스트레이터: ["Illustrator"],
  일러: ["Illustrator"],
  인디자인: ["InDesign"],
  에펙: ["After Effects"],
  애프터이펙트: ["After Effects"],
  프리미어: ["Premiere Pro"],
  프리미어프로: ["Premiere Pro"],
  피그마: ["Figma"],
  블렌더: ["Blender"],
  노션: ["Notion"],
  프레이머: ["Framer"],
  브이에스코드: ["VS Code"],
  vscode: ["VS Code"],
  코드: ["VS Code"],
  리액트: ["React"],
  넥스트: ["Next.js"],
  타스: ["TypeScript"],
  타입스크립트: ["TypeScript"],
  자스: ["JavaScript"],
  자바스크립트: ["JavaScript"],
  파이썬: ["Python"],
  깃: ["GitHub", "Git"],
  깃허브: ["GitHub"],
  슬랙: ["Slack"],
  리니어: ["Linear"],
};

/**
 * 사용자가 입력한 검색어에 따라 매칭되는 관련 도구 목록을 반환합니다.
 * - 입력창이 비어있을 때는 아무것도 추천하지 않습니다. (사용자 요청: 아무것도 작성하지 않았을 때의 추천툴 삭제)
 * - 최대 4개까지만 반환합니다.
 */
export function getMatchingToolSuggestions(
  query: string,
  alreadySelected: string[] = [],
  userSavedTools: string[] = [],
  limit = 4
): string[] {
  const trimmed = query.trim().toLowerCase();

  // 아무것도 입력하지 않았을 때는 추천툴 목록을 표시하지 않음
  if (!trimmed) {
    return [];
  }

  const allPool = Array.from(new Set([...userSavedTools, ...POPULAR_TOOLS]));
  const lowerAlready = alreadySelected.map((s) => s.toLowerCase());

  const matchedSet = new Set<string>();

  // 1. 한글 및 약어 동의어 매핑 확인
  for (const [alias, tools] of Object.entries(TOOL_ALIASES)) {
    if (alias.toLowerCase().includes(trimmed) || trimmed.includes(alias.toLowerCase())) {
      for (const t of tools) {
        if (!lowerAlready.includes(t.toLowerCase())) {
          matchedSet.add(t);
        }
      }
    }
  }

  // 2. 검색어 접두사 및 포함 일치 검색
  for (const tool of allPool) {
    if (lowerAlready.includes(tool.toLowerCase())) continue;
    const lowerTool = tool.toLowerCase();

    if (lowerTool.startsWith(trimmed)) {
      matchedSet.add(tool);
    }
  }

  for (const tool of allPool) {
    if (lowerAlready.includes(tool.toLowerCase())) continue;
    const lowerTool = tool.toLowerCase();

    if (lowerTool.includes(trimmed)) {
      matchedSet.add(tool);
    }
  }

  return Array.from(matchedSet).slice(0, limit);
}
