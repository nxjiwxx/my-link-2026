import { db, auth } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  DesignerProfileData,
  SocialLinks,
  ToolProficiency,
  CareerItem,
} from "@/types/portfolio";

export const getFirestoreUserBase = (uid?: string): string => {
  const targetUid = uid || auth.currentUser?.uid || "anonymous";
  return `users/${targetUid}`;
};

export const FIRESTORE_USER_BASE = getFirestoreUserBase();

export const FIRESTORE_PROFILE_INFO_DOC = "info";
export const FIRESTORE_PROFILE_LINKS_DOC = "links";

/**
 * 0. 유저 기본 문서 (users/{uid}) 조회 및 저장
 */
export interface UserBaseInfo {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  roleTitle?: string;
  bio?: string;
  handle?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function getUserDocFromFirestore(uid?: string): Promise<UserBaseInfo | null> {
  try {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return null;
    const docRef = doc(db, "users", targetUid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserBaseInfo;
    }
    return null;
  } catch (err) {
    console.warn("Firestore users/{uid} 문서 조회 실패:", err);
    return null;
  }
}

export async function saveUserDocToFirestore(userData: Partial<UserBaseInfo>, uid?: string): Promise<void> {
  const targetUid = uid || auth.currentUser?.uid || userData.uid;
  if (!targetUid) return;
  const docRef = doc(db, "users", targetUid);
  await setDoc(
    docRef,
    {
      ...userData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * 핸들명(@handle) 또는 UID로 유저 정보 및 UID 검색
 */
export async function findUserByHandleOrUid(
  identifier: string
): Promise<{ uid: string; userInfo?: UserBaseInfo | null } | null> {
  try {
    const cleanId = decodeURIComponent(identifier).replace(/^@/, "").trim();
    if (!cleanId || cleanId === "demo") return null;

    // 1. 직접 UID로 조회 시도
    const directUser = await getUserDocFromFirestore(cleanId);
    if (directUser) {
      return { uid: cleanId, userInfo: directUser };
    }

    // 2. users 컬렉션에서 handle 필드로 조회
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("handle", "==", cleanId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const matchedDoc = snap.docs[0];
      return {
        uid: matchedDoc.id,
        userInfo: matchedDoc.data() as UserBaseInfo,
      };
    }

    // 3. anonymous 기본 경로 조회
    if (cleanId === "anonymous") {
      const anonInfo = await getUserDocFromFirestore("anonymous");
      return { uid: "anonymous", userInfo: anonInfo };
    }

    return null;
  } catch (err) {
    console.warn("findUserByHandleOrUid 실패:", err);
    return null;
  }
}

/**
 * 1. 기본 프로필 정보 (users/{uid}/profile/info) 저장
 */
export async function saveProfileInfoToFirestore(
  profile: Partial<DesignerProfileData>,
  uid?: string
): Promise<void> {
  const userBase = getFirestoreUserBase(uid);
  const docRef = doc(db, `${userBase}/profile`, FIRESTORE_PROFILE_INFO_DOC);
  await setDoc(
    docRef,
    {
      name: profile.name || "",
      handle: profile.handle || "",
      roleTitle: profile.roleTitle || "",
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
      skills: profile.skills || [],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 상위 users/{uid} 문서에도 주요 정보 동기화
  const targetUid = uid || auth.currentUser?.uid;
  if (targetUid && targetUid !== "anonymous") {
    await saveUserDocToFirestore(
      {
        displayName: profile.name,
        handle: profile.handle,
        roleTitle: profile.roleTitle,
        bio: profile.bio,
        photoURL: profile.avatarUrl,
      },
      targetUid
    );
  }
}

/**
 * 1-1. 기본 프로필 정보 조회
 */
export async function getProfileInfoFromFirestore(uid?: string): Promise<Partial<DesignerProfileData> | null> {
  try {
    const userBase = getFirestoreUserBase(uid);
    const docRef = doc(db, `${userBase}/profile`, FIRESTORE_PROFILE_INFO_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Partial<DesignerProfileData>;
    }

    // 만약 profile/info가 없으면 users/{uid} 기본 문서에서 조회 시도
    const targetUid = uid || auth.currentUser?.uid;
    if (targetUid && targetUid !== "anonymous") {
      const userDoc = await getUserDocFromFirestore(targetUid);
      if (userDoc) {
        return {
          name: userDoc.displayName || undefined,
          handle: userDoc.handle || undefined,
          roleTitle: userDoc.roleTitle || undefined,
          bio: userDoc.bio || undefined,
          avatarUrl: userDoc.photoURL || undefined,
        };
      }
    }

    return null;
  } catch (err) {
    console.warn("Firestore 프로필 기본정보 조회 실패:", err);
    return null;
  }
}

/**
 * 2. 이력서 및 소셜 링크 서브 문서 (users/{uid}/profile/links) 저장
 */
export interface ProfileLinksPayload {
  resumePdfUrl?: string;
  socialLinks: SocialLinks;
}

export async function saveProfileLinksToFirestore(
  payload: ProfileLinksPayload,
  uid?: string
): Promise<void> {
  const userBase = getFirestoreUserBase(uid);
  const docRef = doc(db, `${userBase}/profile`, FIRESTORE_PROFILE_LINKS_DOC);
  await setDoc(
    docRef,
    {
      resumePdfUrl: payload.resumePdfUrl || "",
      behance: payload.socialLinks.behance || "",
      linkedin: payload.socialLinks.linkedin || "",
      github: payload.socialLinks.github || "",
      instagram: payload.socialLinks.instagram || "",
      dribbble: payload.socialLinks.dribbble || "",
      email: payload.socialLinks.email || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * 2-1. 이력서 및 소셜 링크 서브 문서 조회
 */
export async function getProfileLinksFromFirestore(uid?: string): Promise<ProfileLinksPayload | null> {
  try {
    const userBase = getFirestoreUserBase(uid);
    const docRef = doc(db, `${userBase}/profile`, FIRESTORE_PROFILE_LINKS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        resumePdfUrl: (data.resumePdfUrl as string) || "",
        socialLinks: {
          behance: (data.behance as string) || undefined,
          linkedin: (data.linkedin as string) || undefined,
          github: (data.github as string) || undefined,
          instagram: (data.instagram as string) || undefined,
          dribbble: (data.dribbble as string) || undefined,
          email: (data.email as string) || undefined,
        },
      };
    }
    return null;
  } catch (err) {
    console.warn("Firestore 링크 정보 조회 실패:", err);
    return null;
  }
}

/**
 * 3. 도구 숙련도 서브 컬렉션 (users/{uid}/tools) 일괄 동기화
 */
export async function saveToolsToFirestore(tools: ToolProficiency[], uid?: string): Promise<void> {
  try {
    const userBase = getFirestoreUserBase(uid);
    const colRef = collection(db, `${userBase}/tools`);
    const oldSnap = await getDocs(colRef);
    const batch = writeBatch(db);

    oldSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    tools.forEach((tool, index) => {
      const safeId = tool.name.replace(/[^a-zA-Z0-9_-]/g, "_") || `tool-${index}`;
      const docRef = doc(db, `${userBase}/tools`, safeId);
      batch.set(docRef, {
        name: tool.name,
        level: tool.level,
        experience: tool.experience || "",
        iconKey: tool.iconKey || "",
        orderIndex: index,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (err) {
    console.error("Firestore 도구 숙련도 저장 실패:", err);
    throw err;
  }
}

/**
 * 3-1. 도구 숙련도 서브 컬렉션 조회
 */
export async function getToolsFromFirestore(uid?: string): Promise<ToolProficiency[] | null> {
  try {
    const userBase = getFirestoreUserBase(uid);
    const colRef = collection(db, `${userBase}/tools`);
    const snap = await getDocs(colRef);
    if (snap.empty) return null;

    const items: (ToolProficiency & { orderIndex: number })[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      items.push({
        name: String(d.name || ""),
        level: Number(d.level) || 0,
        experience: d.experience ? String(d.experience) : undefined,
        iconKey: (d.iconKey as ToolProficiency["iconKey"]) || undefined,
        orderIndex: typeof d.orderIndex === "number" ? d.orderIndex : 0,
      });
    });

    items.sort((a, b) => a.orderIndex - b.orderIndex);
    return items.map((item) => {
      const copy = { ...item };
      delete (copy as { orderIndex?: number }).orderIndex;
      return copy;
    });
  } catch (err) {
    console.warn("Firestore 도구 숙련도 로드 실패:", err);
    return null;
  }
}

/**
 * 4. 경력 및 활동 서브 컬렉션 (users/{uid}/careers) 일괄 동기화
 */
export async function saveCareersToFirestore(careers: CareerItem[], uid?: string): Promise<void> {
  try {
    const userBase = getFirestoreUserBase(uid);
    const colRef = collection(db, `${userBase}/careers`);
    const oldSnap = await getDocs(colRef);
    const batch = writeBatch(db);

    oldSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    careers.forEach((career, index) => {
      const docRef = doc(db, `${userBase}/careers`, career.id);
      batch.set(docRef, {
        id: career.id,
        period: career.period,
        title: career.title,
        organization: career.organization,
        description: career.description || "",
        orderIndex: index,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (err) {
    console.error("Firestore 경력 활동 저장 실패:", err);
    throw err;
  }
}

/**
 * 4-1. 경력 및 활동 서브 컬렉션 조회
 */
export async function getCareersFromFirestore(uid?: string): Promise<CareerItem[] | null> {
  try {
    const userBase = getFirestoreUserBase(uid);
    const colRef = collection(db, `${userBase}/careers`);
    const snap = await getDocs(colRef);
    if (snap.empty) return null;

    const items: (CareerItem & { orderIndex: number })[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      items.push({
        id: String(d.id || docSnap.id),
        period: String(d.period || ""),
        title: String(d.title || ""),
        organization: String(d.organization || ""),
        description: d.description ? String(d.description) : undefined,
        orderIndex: typeof d.orderIndex === "number" ? d.orderIndex : 0,
      });
    });

    items.sort((a, b) => a.orderIndex - b.orderIndex);
    return items.map((item) => {
      const copy = { ...item };
      delete (copy as { orderIndex?: number }).orderIndex;
      return copy;
    });
  } catch (err) {
    console.warn("Firestore 경력 활동 로드 실패:", err);
    return null;
  }
}
