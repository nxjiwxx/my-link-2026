import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { ProjectItem } from "@/types/portfolio";

export const FIRESTORE_LINKS_COLLECTION = "users/anonymous/links";

const MAX_PAYLOAD_STRING_LENGTH = 700_000; // 약 700KB (Firestore 1MB 문서 한도 보호)
const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80";

/**
 * ProjectItem을 Firestore 저장용 객체로 변환
 */
function toFirestoreData(project: ProjectItem) {
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

  return {
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/**
 * Firestore 문서를 ProjectItem으로 변환
 */
function fromFirestoreDoc(data: Record<string, unknown>): ProjectItem {
  return {
    id: String(data.id || ""),
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
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
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
  };
}

/**
 * 새 링크/프로젝트를 Firestore users/anonymous/links 경로에 저장
 */
export async function saveLinkToFirestore(project: ProjectItem): Promise<void> {
  const docRef = doc(db, FIRESTORE_LINKS_COLLECTION, project.id);
  await setDoc(docRef, toFirestoreData(project));
}

/**
 * Firestore users/anonymous/links 경로에서 모든 링크 조회
 */
export async function getLinksFromFirestore(): Promise<ProjectItem[]> {
  try {
    const colRef = collection(db, FIRESTORE_LINKS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const links: ProjectItem[] = [];
    snapshot.forEach((docSnap) => {
      links.push(fromFirestoreDoc(docSnap.data()));
    });
    return links;
  } catch (error) {
    console.error("Firestore에서 링크를 불러오는데 실패했습니다:", error);
    throw error;
  }
}

/**
 * Firestore users/anonymous/links 경로에서 링크 삭제
 */
export async function deleteLinkFromFirestore(projectId: string): Promise<void> {
  const docRef = doc(db, FIRESTORE_LINKS_COLLECTION, projectId);
  await deleteDoc(docRef);
}

/**
 * Firestore users/anonymous/links 실시간 구독
 */
export function subscribeToFirestoreLinks(
  onUpdate: (links: ProjectItem[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, FIRESTORE_LINKS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const links: ProjectItem[] = [];
      snapshot.forEach((docSnap) => {
        links.push(fromFirestoreDoc(docSnap.data()));
      });
      onUpdate(links);
    },
    (err) => {
      console.error("Firestore 실시간 구독 에러:", err);
      if (onError) onError(err);
    }
  );
}
