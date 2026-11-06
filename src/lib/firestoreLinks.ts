import { db, auth } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  increment,
} from "firebase/firestore";
import { ProjectItem } from "@/types/portfolio";
import { incrementProjectClickCountInStorage } from "./portfolioStorage";

export const getLinksCollectionPath = (uid?: string): string => {
  const targetUid = uid || auth.currentUser?.uid || "anonymous";
  return `users/${targetUid}/links`;
};

// 기존 상수와의 호환성을 위한 fallback getter
export const FIRESTORE_LINKS_COLLECTION = getLinksCollectionPath();

const MAX_PAYLOAD_STRING_LENGTH = 700_000; // 약 700KB (Firestore 1MB 문서 한도 보호)
const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80";

/**
 * 타임스탬프 값을 밀리초 숫자로 변환 (Firestore Timestamp, Date, number, string 지원)
 */
export function getTimestampMillis(val: unknown): number {
  if (!val) return 0;
  if (typeof (val as { toMillis?: () => number }).toMillis === "function") {
    return (val as { toMillis: () => number }).toMillis();
  }
  if (typeof (val as { toDate?: () => Date }).toDate === "function") {
    return (val as { toDate: () => Date }).toDate().getTime();
  }
  if (val instanceof Date) {
    return val.getTime();
  }
  if (typeof val === "number") {
    return val;
  }
  if (typeof val === "string") {
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * ProjectItem을 Firestore 저장용 객체로 변환
 */
function toFirestoreData(project: ProjectItem, isUpdate = false) {
  let safeThumbnail = project.thumbnailUrl || FALLBACK_THUMBNAIL;
  if (safeThumbnail.length > MAX_PAYLOAD_STRING_LENGTH) {
    console.warn(
      `[Firestore] 썸네일 데이터 크기(${safeThumbnail.length}자)가 Firestore 문서 제한을 초과하여 기본 이미지로 대체합니다.`
    );
    safeThumbnail = FALLBACK_THUMBNAIL;
  }

  const safeDetailImages = (project.detailImages || []).filter(
    (img) => img.length <= MAX_PAYLOAD_STRING_LENGTH
  );

  const data: Record<string, unknown> = {
    id: project.id,
    title: project.title,
    url: project.externalLink?.url || "",
    summary: project.summary,
    category: project.category,
    categoryLabel: project.categoryLabel,
    projectType: project.projectType,
    projectTypeLabel: project.projectTypeLabel,
    thumbnailUrl: safeThumbnail,
    detailImages: safeDetailImages,
    period: project.period,
    role: project.role,
    tools: project.tools || [],
    description: project.description,
    externalLink: project.externalLink || null,
    orderIndex: project.orderIndex ?? 0,
    clickCount: typeof project.clickCount === "number" ? project.clickCount : isUpdate ? undefined : 0,
    updatedAt: serverTimestamp(),
  };

  if (data.clickCount === undefined) {
    delete data.clickCount;
  }

  if (!isUpdate) {
    data.createdAt = serverTimestamp();
  } else if (project.createdAt) {
    data.createdAt = project.createdAt;
  }

  return data;
}

/**
 * Firestore 문서를 ProjectItem으로 변환
 */
export function fromFirestoreDoc(data: Record<string, unknown>, docId?: string): ProjectItem {
  return {
    id: String(data.id || docId || ""),
    title: String(data.title || ""),
    category: String(data.category || "uiux"),
    categoryLabel: String(data.categoryLabel || "UI/UX"),
    projectType: (data.projectType as "team" | "solo") || "solo",
    projectTypeLabel: String(
      data.projectTypeLabel || (data.projectType === "team" ? "팀 프로젝트" : "개인 프로젝트")
    ),
    summary: String(data.summary || ""),
    thumbnailUrl:
      String(data.thumbnailUrl || "") ||
      FALLBACK_THUMBNAIL,
    detailImages: Array.isArray(data.detailImages)
      ? (data.detailImages as string[])
      : data.thumbnailUrl
      ? [String(data.thumbnailUrl)]
      : [],
    period: String(data.period || "2026"),
    role: String(data.role || "Creator & Designer"),
    tools: Array.isArray(data.tools) ? (data.tools as string[]) : ["Design"],
    description: String(data.description || data.summary || ""),
    externalLink:
      data.externalLink && typeof data.externalLink === "object"
        ? (data.externalLink as { label: string; url: string })
        : data.url
        ? {
            label: String(data.title || "외부 링크 바로가기"),
            url: String(data.url),
          }
        : undefined,
    orderIndex: typeof data.orderIndex === "number" ? data.orderIndex : 0,
    clickCount: typeof data.clickCount === "number" ? data.clickCount : 0,
    createdAt: data.createdAt,
  };
}

/**
 * 새 링크/프로젝트를 Firestore users/{uid}/links 및 user/{uid}/links 경로에 저장
 */
export async function saveLinkToFirestore(project: ProjectItem, uid?: string): Promise<void> {
  const targetUid = uid || auth.currentUser?.uid || "anonymous";
  const paths = [
    `users/${targetUid}/links`,
    `user/${targetUid}/links`,
  ];
  const data = toFirestoreData(project);
  for (const p of paths) {
    try {
      const docRef = doc(db, p, project.id);
      await setDoc(docRef, data);
    } catch {
      // ignore
    }
  }
}

/**
 * 기존 링크/프로젝트를 Firestore users/{uid}/links 및 user/{uid}/links 경로에서 수정(업데이트)
 */
export async function updateLinkInFirestore(project: ProjectItem, uid?: string): Promise<void> {
  const targetUid = uid || auth.currentUser?.uid || "anonymous";
  const paths = [
    `users/${targetUid}/links`,
    `user/${targetUid}/links`,
  ];
  const data = toFirestoreData(project, true);
  for (const p of paths) {
    try {
      const docRef = doc(db, p, project.id);
      await setDoc(docRef, data, { merge: true });
    } catch {
      // ignore
    }
  }
}

/**
 * Firestore user/{uid}/links 및 users/{uid}/links 경로에서 모든 링크 조회 (createdAt 기준 최신순 정렬)
 */
export async function getLinksFromFirestore(uid?: string): Promise<ProjectItem[]> {
  try {
    const targetUid = uid || auth.currentUser?.uid || "anonymous";
    const paths = [
      `user/${targetUid}/links`,
      `users/${targetUid}/links`,
    ];
    const itemsMap = new Map<string, ProjectItem>();

    for (const collectionPath of paths) {
      try {
        const colRef = collection(db, collectionPath);
        let snapshot;
        try {
          const q = query(colRef, orderBy("createdAt", "desc"));
          snapshot = await getDocs(q);
        } catch {
          // orderBy 쿼리 실패 시 기본 getDocs fallback
          snapshot = await getDocs(colRef);
        }

        snapshot.forEach((docSnap) => {
          const data = docSnap.data({ serverTimestamps: "estimate" });
          const item = fromFirestoreDoc(data, docSnap.id);
          if (!itemsMap.has(item.id)) {
            itemsMap.set(item.id, item);
          }
        });
      } catch (err) {
        // 경로 없거나 권한 등 무시
      }
    }

    const links = Array.from(itemsMap.values());

    // 클라이언트 측 최신순 정렬 보장
    links.sort((a, b) => {
      const timeA = getTimestampMillis(a.createdAt);
      const timeB = getTimestampMillis(b.createdAt);
      return timeB - timeA;
    });

    return links;
  } catch (error) {
    console.error(`Firestore(${getLinksCollectionPath(uid)})에서 링크를 불러오는데 실패했습니다:`, error);
    throw error;
  }
}

/**
 * Firestore users/{uid}/links 및 user/{uid}/links 경로에서 링크 삭제
 */
export async function deleteLinkFromFirestore(projectId: string, uid?: string): Promise<void> {
  const targetUid = uid || auth.currentUser?.uid || "anonymous";
  const paths = [
    `users/${targetUid}/links`,
    `user/${targetUid}/links`,
  ];
  for (const p of paths) {
    try {
      const docRef = doc(db, p, projectId);
      await deleteDoc(docRef);
    } catch {
      // ignore
    }
  }
}

/**
 * Firestore users/{uid}/links 경로의 프로젝트 클릭 카운트 원자적 증가
 */
export async function incrementLinkClickCount(projectId: string, uid?: string): Promise<void> {
  const targetUid = uid || auth.currentUser?.uid || "anonymous";
  const paths = [
    `users/${targetUid}/links`,
    `user/${targetUid}/links`,
  ];
  for (const p of paths) {
    try {
      const docRef = doc(db, p, projectId);
      await setDoc(
        docRef,
        {
          clickCount: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn(`Firestore(${p}/${projectId}) 클릭수 증분 실패:`, err);
    }
  }
}

/**
 * 프로젝트 클릭 이벤트 트래킹 (로컬스토리지 및 Firestore 동시 반영)
 * - 로그인된 소유자 본인의 클릭은 집계에서 제외
 */
export async function trackProjectClick(projectId: string, uid?: string): Promise<number> {
  const currentUid = auth.currentUser?.uid;

  // 1. 로그인된 본인의 페이지/프로젝트 클릭 시 카운트 제외
  if (currentUid && uid && currentUid === uid) {
    return 0;
  }
  // 2. 소유자 식별자 없이 로그인된 상태에서 클릭한 경우도 본인 페이지로 간주하여 제외
  if (currentUid && !uid) {
    return 0;
  }

  // 1. 로컬 스토리지에 즉시 +1 반영 (비로그인 상태 또는 타인 열람 시)
  const localCount = incrementProjectClickCountInStorage(projectId);

  // 2. Firestore에 원자적 증분 요청 (비동기)
  try {
    await incrementLinkClickCount(projectId, uid);
  } catch (err) {
    console.warn("Firestore 클릭수 트래킹 중 오류 발생:", err);
  }

  return localCount;
}
