/**
 * 디자이너 및 개발자를 위한 추천 도구 목록 및 검색 유틸리티
 */
export const POPULAR_TOOLS: string[] = [
  // UI/UX & 프로토타이핑
  "Figma",
  "FigJam",
  "Framer",
  "ProtoPie",
  "Sketch",
  "Adobe XD",
  "Principle",
  "Zeplin",
  "Miro",
  "Whimsical",
  "InVision",
  "Axure RP",

  // 그래픽 & 비주얼 디자인
  "Photoshop",
  "Illustrator",
  "InDesign",
  "After Effects",
  "Premiere Pro",
  "Lightroom",
  "Canva",
  "Procreate",
  "Clip Studio Paint",

  // 3D & 모션 & 모델링
  "Blender",
  "Cinema 4D",
  "Spline",
  "Maya",
  "3ds Max",
  "Rhinoceros",
  "CLO 3D",
  "Marvelous Designer",
  "KeyShot",
  "Unreal Engine",
  "Unity",
  "ZBrush",
  "Substance Painter",
  "Lottie",

  // 웹 & 프론트엔드 & 개발
  "React",
  "Next.js",
  "Vue.js",
  "Svelte",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "HTML5/CSS3",
  "SwiftUI",
  "Flutter",
  "Webflow",
  "WordPress",
  "Python",
  "Node.js",
  "Git",
  "GitHub",

  // 협업 및 생산성
  "Notion",
  "Linear",
  "Jira",
  "Slack",
];

/**
 * 사용자가 입력한 검색어에 따라 매칭되는 관련 도구 목록을 반환합니다.
 */
export function getMatchingToolSuggestions(
  query: string,
  alreadySelected: string[] = [],
  userSavedTools: string[] = []
): string[] {
  const trimmed = query.trim().toLowerCase();
  const allPool = Array.from(new Set([...userSavedTools, ...POPULAR_TOOLS]));

  if (!trimmed) {
    // 입력창이 비어있을 때는 이전에 사용했던 도구나 주요 인기 도구 상위 노출
    return allPool
      .filter((tool) => !alreadySelected.includes(tool))
      .slice(0, 8);
  }

  // 검색어와 일치하는 도구 필터링 (접두사 일치 우선, 그 다음 포함 일치)
  const startsWithMatches: string[] = [];
  const containsMatches: string[] = [];

  for (const tool of allPool) {
    if (alreadySelected.includes(tool)) continue;
    const lowerTool = tool.toLowerCase();
    if (lowerTool === trimmed) continue; // 완전히 동일하면 제외하거나 포함 가능

    if (lowerTool.startsWith(trimmed)) {
      startsWithMatches.push(tool);
    } else if (lowerTool.includes(trimmed)) {
      containsMatches.push(tool);
    }
  }

  return [...startsWithMatches, ...containsMatches].slice(0, 10);
}
