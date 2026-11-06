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
} from "firebase/firestore";
import { ProjectItem } from "@/types/portfolio";

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
    updatedAt: serverTimestamp(),
  };

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
    createdAt: data.createdAt,
  };
}

/**
 * 새 링크/프로젝트를 Firestore users/{uid}/links 경로에 저장
 */
export async function saveLinkToFirestore(project: ProjectItem, uid?: string): Promise<void> {
  const collectionPath = getLinksCollectionPath(uid);
  const docRef = doc(db, collectionPath, project.id);
  await setDoc(docRef, toFirestoreData(project));
}

/**
 * 기존 링크/프로젝트를 Firestore users/{uid}/links 경로에서 수정(업데이트)
 */
export async function updateLinkInFirestore(project: ProjectItem, uid?: string): Promise<void> {
  const collectionPath = getLinksCollectionPath(uid);
  const docRef = doc(db, collectionPath, project.id);
  await setDoc(docRef, toFirestoreData(project, true), { merge: true });
}

/**
 * Firestore users/{uid}/links 경로에서 모든 링크 조회 (createdAt 기준 최신순 정렬)
 */
export async function getLinksFromFirestore(uid?: string): Promise<ProjectItem[]> {
  try {
    const collectionPath = getLinksCollectionPath(uid);
    const colRef = collection(db, collectionPath);
    const q = query(colRef, orderBy("createdAt", "desc"));
    let snapshot;
    try {
      snapshot = await getDocs(q);
    } catch {
      // orderBy 쿼리 실패 시 기본 getDocs fallback
      snapshot = await getDocs(colRef);
    }

    const links: ProjectItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data({ serverTimestamps: "estimate" });
      links.push(fromFirestoreDoc(data, docSnap.id));
    });

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
 * Firestore users/{uid}/links 경로에서 링크 삭제
 */
export async function deleteLinkFromFirestore(projectId: string, uid?: string): Promise<void> {
  const collectionPath = getLinksCollectionPath(uid);
  const docRef = doc(db, collectionPath, projectId);
  await deleteDoc(docRef);
}
