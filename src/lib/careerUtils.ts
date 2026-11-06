import { CareerItem } from "@/types/portfolio";

export interface ParsedPeriod {
  startScore: number; // YYYYMM (예: 202403)
  endScore: number; // YYYYMM 또는 진행중인 경우 999999
  isOngoing: boolean; // 현재 진행형 여부 (Present, 현재, 재직중 등)
}

/**
 * 다양한 형식의 경력 기간 문자열에서 시작/종료 시점의 연월 스코어를 추출합니다.
 *
 * 지원 형식 예시:
 * - "2024 ~ Present", "2024 ~ 현재", "2024 - 재직중" -> endScore = 999999
 * - "2024.03 ~ 2025.02", "2024.03 - 2025.02"
 * - "2022년 3월 ~ 2024년 5월"
 * - "2023 ~ 2025"
 * - "2025"
 */
export function parseCareerPeriod(periodStr: string): ParsedPeriod {
  if (!periodStr || !periodStr.trim()) {
    return { startScore: 0, endScore: 0, isOngoing: false };
  }

  const raw = periodStr.trim();
  const lower = raw.toLowerCase();

  // 현재 진행 중 키워드 감지 (present, 현재, 재직, 진행, now, ing 등)
  const isOngoing =
    lower.includes("present") ||
    lower.includes("현재") ||
    lower.includes("재직") ||
    lower.includes("진행") ||
    lower.includes("now") ||
    lower.includes("ing") ||
    /(?:~|-|–)\s*$/.test(raw); // '2024 ~' 처럼 끝에 아무것도 없는 경우

  // 구분자(~, -, –, to)로 분리 시도
  const parts = raw.split(/~|-|–|\bto\b/i);

  // 연월 추출 헬퍼 함수 (str: 대상 문자열, defaultMonth: 월이 없을 때 기본값 1 또는 12)
  const extractDateScore = (str: string, defaultMonth: number): number => {
    if (!str) return 0;

    // 1. 4자리 연도 검색 (1900 ~ 2099)
    const yearMatch = str.match(/\b(19\d\d|20\d\d)\b/);
    let year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

    // 2. 4자리 연도가 없고 2자리 연도 패턴(예: '24.03)인 경우 보정
    if (!year) {
      const shortYearMatch = str.match(/\b([1-9]\d)\b/);
      if (shortYearMatch) {
        const yVal = parseInt(shortYearMatch[1], 10);
        year = yVal < 50 ? 2000 + yVal : 1900 + yVal;
      }
    }

    if (!year) return 0;

    // 3. 월(1 ~ 12) 검색 (예: 2024.03, 2024-03, 2024년 3월, 2024. 3 등)
    let month = defaultMonth;

    // "년 N월" 패턴
    const korMonthMatch = str.match(/년\s*(\d{1,2})\s*월/);
    if (korMonthMatch) {
      const mVal = parseInt(korMonthMatch[1], 10);
      if (mVal >= 1 && mVal <= 12) {
        month = mVal;
        return year * 100 + month;
      }
    }

    // 연도 뒤에 오는 .MM 또는 -MM 패턴 (예: 2024.03, 2024-5)
    const dotMonthMatch = str.match(/(?:19\d\d|20\d\d|[1-9]\d)[.\-/]\s*(\d{1,2})/);
    if (dotMonthMatch) {
      const mVal = parseInt(dotMonthMatch[1], 10);
      if (mVal >= 1 && mVal <= 12) {
        month = mVal;
        return year * 100 + month;
      }
    }

    // 일반적인 월 표기 (예: "3월")
    const simpleMonthMatch = str.match(/(\d{1,2})\s*월/);
    if (simpleMonthMatch) {
      const mVal = parseInt(simpleMonthMatch[1], 10);
      if (mVal >= 1 && mVal <= 12) {
        month = mVal;
        return year * 100 + month;
      }
    }

    return year * 100 + month;
  };

  if (parts.length >= 2) {
    const startScore = extractDateScore(parts[0], 1);
    const endScore = isOngoing ? 999999 : extractDateScore(parts[1], 12);
    return {
      startScore: startScore || (isOngoing ? 202601 : endScore),
      endScore: endScore || startScore,
      isOngoing,
    };
  } else {
    // 단일 연도/시점 (예: "2025")
    const startScore = extractDateScore(raw, 1);
    const endScore = isOngoing ? 999999 : extractDateScore(raw, 12);
    return {
      startScore,
      endScore,
      isOngoing,
    };
  }
}

/**
 * 두 경력 아이템의 기간을 비교하여 내림차순(최신순 -> 과거순)으로 정렬합니다.
 * 1. 종료일이 더 최근인 것(또는 현재 진행 중인 것)이 위로
 * 2. 종료일이 같다면 시작일이 더 최근인 것이 위로
 */
export function compareCareerPeriodsDesc(a: CareerItem, b: CareerItem): number {
  const pA = parseCareerPeriod(a.period);
  const pB = parseCareerPeriod(b.period);

  // 1. 종료일 기준 내림차순
  if (pB.endScore !== pA.endScore) {
    return pB.endScore - pA.endScore;
  }

  // 2. 종료일이 같다면 시작일 기준 내림차순
  if (pB.startScore !== pA.startScore) {
    return pB.startScore - pA.startScore;
  }

  // 3. 기간이 완벽히 동일하다면 기존 순서 유지
  return 0;
}

/**
 * 경력 목록을 기간 내림차순(최신순)으로 정렬하여 반환합니다.
 */
export function sortCareersByPeriod(careers: CareerItem[]): CareerItem[] {
  if (!careers || careers.length <= 1) return careers || [];
  return [...careers].sort(compareCareerPeriodsDesc);
}
