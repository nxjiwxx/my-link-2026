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
import { sortCareersByPeriod } from "./careerUtils";

export const getFirestoreUserBase = (uid?: string): string => {
  const targetUid = uid || auth.currentUser?.uid || "anonymous";
  return `users/${targetUid}`;
};

export const FIRESTORE_USER_BASE = getFirestoreUserBase();

export const FIRESTORE_PROFILE_INFO_DOC = "info";
export const FIRESTORE_PROFILE_LINKS_DOC = "links";

// 시스템 예약어 목록 (경로 충돌 방지)
export const RESERVED_USERNAMES = new Set([
  "api",
  "admin",
  "login",
  "signup",
  "profile",
  "projects",
  "project",
  "user",
  "users",
  "usernames",
  "demo",
  "null",
  "undefined",
  "home",
  "settings",
  "dashboard",
  "auth",
  "link",
  "links",
  "not-found",
  "404",
]);

export interface UsernameCheckResult {
  available: boolean;
  reason: "available" | "mine" | "taken" | "invalid" | "too_short" | "too_long" | "reserved" | "error";
  message: string;
}

/**
 * 사용자 이름(username) 유효성 및 중복 여부 확인
 * 1) usernames/{username} 컬렉션 문서 키 확인
 * 2) users 컬렉션 where("username", "==") fallback 확인
 */
export async function checkUsernameAvailability(
  rawUsername: string,
  currentUid?: string
): Promise<UsernameCheckResult> {
  const clean = rawUsername.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");

  if (!clean || clean.length < 2) {
    return {
      available: false,
      reason: "too_short",
      message: "2자 이상의 영문, 숫자를 입력해주세요.",
    };
  }

  if (clean.length > 20) {
    return {
      available: false,
      reason: "too_long",
      message: "최대 20자 이내로 입력해주세요.",
    };
  }

  const lower = clean.toLowerCase();
  if (RESERVED_USERNAMES.has(lower)) {
    return {
      available: false,
      reason: "reserved",
      message: "시스템 예약어로 사용할 수 없는 이름입니다.",
    };
  }

  const targetUid = currentUid || auth.currentUser?.uid;

  try {
    // 1. usernames/{username} 전용 컬렉션 확인 (문서 ID 기반 고유성 체크)
    const unameDocRef = doc(db, "usernames", lower);
    const unameSnap = await getDoc(unameDocRef);

    if (unameSnap.exists()) {
      const data = unameSnap.data();
      if (targetUid && data.uid === targetUid) {
        return {
          available: true,
          reason: "mine",
          message: "현재 회원님이 사용 중인 이름입니다.",
        };
      }
      return {
        available: false,
        reason: "taken",
        message: "이미 다른 사용자가 사용 중인 이름입니다.",
      };
    }

    // 2. 기존 users 컬렉션 where 쿼리 fallback (usernames 컬렉션에 미처 등록되지 않은 레거시 데이터 보호)
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", clean));
      const qSnap = await getDocs(q);

      if (!qSnap.empty) {
        for (const docItem of qSnap.docs) {
          if (targetUid && docItem.id === targetUid) {
            return {
              available: true,
              reason: "mine",
              message: "현재 회원님이 사용 중인 이름입니다.",
            };
          }
        }
        return {
          available: false,
          reason: "taken",
          message: "이미 다른 사용자가 사용 중인 이름입니다.",
        };
      }
    } catch (e) {
      console.warn("users 컬렉션 fallback 중복 확인 건너뜀:", e);
    }

    return {
      available: true,
      reason: "available",
      message: "멋진 사용자 이름이네요! 사용 가능합니다.",
    };
  } catch (err) {
    console.error("username 중복 체크 에러:", err);
    return {
      available: true, // 네트워크 일시 에러 시 저장을 전면 차단하지 않도록 fallback
      reason: "error",
      message: "중복 확인 중 일시적인 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 이름(username) 선점 및 이전 이름 반환(Claim & Release)
 * Firestore batch를 통해 usernames/{newUsername} 생성 및 usernames/{oldUsername} 삭제
 */
export async function claimUsername(
  newUsername: string,
  oldUsername?: string,
  uid?: string
): Promise<boolean> {
  const targetUid = uid || auth.currentUser?.uid;
  if (!targetUid) return false;

  const cleanNew = newUsername.trim().toLowerCase().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
  const cleanOld = oldUsername ? oldUsername.trim().toLowerCase().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "") : "";

  if (!cleanNew) return false;

  try {
    const batch = writeBatch(db);

    // 새 username 선점 등록
    const newDocRef = doc(db, "usernames", cleanNew);
    batch.set(
      newDocRef,
      {
        uid: targetUid,
        originalUsername: newUsername.trim().replace(/^@/, ""),
        claimedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 이전 username이 있고 새 username과 다르다면 이전 문서 삭제 (이름 변경 시 해제)
    if (cleanOld && cleanOld !== cleanNew) {
      const oldDocRef = doc(db, "usernames", cleanOld);
      batch.delete(oldDocRef);
    }

    await batch.commit();
    return true;
  } catch (err) {
    console.warn("claimUsername 실패:", err);
    return false;
  }
}

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
  username?: string;
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
    // user 컬렉션 fallback
    const userColDoc = doc(db, "user", targetUid);
    const userSnap = await getDoc(userColDoc);
    if (userSnap.exists()) {
      return userSnap.data() as UserBaseInfo;
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
  const payload = {
    ...userData,
    updatedAt: serverTimestamp(),
  };
  const docRef = doc(db, "users", targetUid);
  await setDoc(docRef, payload, { merge: true });

  try {
    const userColDoc = doc(db, "user", targetUid);
    await setDoc(userColDoc, payload, { merge: true });
  } catch {
    // ignore
  }
}

/**
 * "사용자 이름"(= username)으로 userId 검색 (where 쿼리)
 */
export async function findUserIdByUsername(
  identifier: string
): Promise<{ uid: string; userInfo?: UserBaseInfo | null } | null> {
  try {
    const cleanId = decodeURIComponent(identifier).replace(/^@/, "").trim();
    if (!cleanId || cleanId === "demo") return null;

    // 0. usernames/{username} 고유 컬렉션 직접 O(1) 조회 (가장 빠르고 정확함)
    try {
      const lower = cleanId.toLowerCase();
      const unameDocRef = doc(db, "usernames", lower);
      const unameSnap = await getDoc(unameDocRef);
      if (unameSnap.exists()) {
        const udata = unameSnap.data();
        if (udata.uid) {
          const userDoc = await getUserDocFromFirestore(udata.uid);
          return {
            uid: udata.uid,
            userInfo: userDoc,
          };
        }
      }
    } catch (e) {
      console.warn("usernames 컬렉션 O(1) 조회 건너뜀:", e);
    }

    // 1. users 컬렉션에서 username 필드로 where 쿼리 검색
    try {
      const usersRef = collection(db, "users");
      const qUsername = query(usersRef, where("username", "==", cleanId));
      const snapUsername = await getDocs(qUsername);
      if (!snapUsername.empty) {
        const matchedDoc = snapUsername.docs[0];
        return {
          uid: matchedDoc.id,
          userInfo: matchedDoc.data() as UserBaseInfo,
        };
      }

      // 소문자로도 조회
      if (cleanId.toLowerCase() !== cleanId) {
        const qUserLower = query(usersRef, where("username", "==", cleanId.toLowerCase()));
        const snapUserLower = await getDocs(qUserLower);
        if (!snapUserLower.empty) {
          const matchedDoc = snapUserLower.docs[0];
          return {
            uid: matchedDoc.id,
            userInfo: matchedDoc.data() as UserBaseInfo,
          };
        }
      }

      // users 컬렉션에서 handle 필드로 조회 (기존 데이터 호환)
      const qHandle = query(usersRef, where("handle", "==", cleanId));
      const snapHandle = await getDocs(qHandle);
      if (!snapHandle.empty) {
        const matchedDoc = snapHandle.docs[0];
        return {
          uid: matchedDoc.id,
          userInfo: matchedDoc.data() as UserBaseInfo,
        };
      }
    } catch (e) {
      console.warn("users 컬렉션 query 실패:", e);
    }

    // 2. user 컬렉션에서 username 필드로 where 쿼리 검색
    try {
      const userRef = collection(db, "user");
      const qUserUsername = query(userRef, where("username", "==", cleanId));
      const snapUserUsername = await getDocs(qUserUsername);
      if (!snapUserUsername.empty) {
        const matchedDoc = snapUserUsername.docs[0];
        return {
          uid: matchedDoc.id,
          userInfo: matchedDoc.data() as UserBaseInfo,
        };
      }

      const qUserHandle = query(userRef, where("handle", "==", cleanId));
      const snapUserHandle = await getDocs(qUserHandle);
      if (!snapUserHandle.empty) {
        const matchedDoc = snapUserHandle.docs[0];
        return {
          uid: matchedDoc.id,
          userInfo: matchedDoc.data() as UserBaseInfo,
        };
      }
    } catch (e) {
      console.warn("user 컬렉션 query 실패:", e);
    }

    // 3. 구글 이메일의 @ 앞부분(emailPrefix)과 일치하는 사용자 검색 fallback
    for (const colName of ["users", "user"]) {
      try {
        const colRef = collection(db, colName);
        const qEmail = query(colRef, where("email", "==", `${cleanId}@gmail.com`));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          const matchedDoc = snapEmail.docs[0];
          return {
            uid: matchedDoc.id,
            userInfo: matchedDoc.data() as UserBaseInfo,
          };
        }

        const qEmailLower = query(colRef, where("email", "==", `${cleanId.toLowerCase()}@gmail.com`));
        const snapEmailLower = await getDocs(qEmailLower);
        if (!snapEmailLower.empty) {
          const matchedDoc = snapEmailLower.docs[0];
          return {
            uid: matchedDoc.id,
            userInfo: matchedDoc.data() as UserBaseInfo,
          };
        }
      } catch {}
    }

    // 3. 직접 UID 문서로 조회 시도
    const directUser = await getUserDocFromFirestore(cleanId);
    if (directUser) {
      return { uid: cleanId, userInfo: directUser };
    }

    // 4. anonymous 기본 경로 조회
    if (cleanId === "anonymous") {
      const anonInfo = await getUserDocFromFirestore("anonymous");
      return { uid: "anonymous", userInfo: anonInfo };
    }

    return null;
  } catch (err) {
    console.warn("findUserIdByUsername 실패:", err);
    return null;
  }
}

/**
 * 기존 findUserByHandleOrUid 함수는 findUserIdByUsername과 호환되도록 연결
 */
export const findUserByHandleOrUid = findUserIdByUsername;

/**
 * 1. 기본 프로필 정보 (users/{uid}/profile/info 및 user/{uid}/profile/info) 저장
 */
export async function saveProfileInfoToFirestore(
  profile: Partial<DesignerProfileData>,
  uid?: string,
  oldUsername?: string
): Promise<void> {
  const targetUid = uid || auth.currentUser?.uid;
  const usernameVal = profile.username || profile.handle || "";
  const infoPayload = {
    name: profile.name || "",
    handle: profile.handle || usernameVal,
    username: usernameVal,
    roleTitle: profile.roleTitle || "",
    bio: profile.bio || "",
    avatarUrl: profile.avatarUrl || "",
    skills: profile.skills || [],
    updatedAt: serverTimestamp(),
  };

  // 1. users/{uid}/profile/info
  const userBase = getFirestoreUserBase(targetUid);
  const docRef1 = doc(db, `${userBase}/profile`, FIRESTORE_PROFILE_INFO_DOC);
  await setDoc(docRef1, infoPayload, { merge: true });

  // 2. user/{uid}/profile/info (user/{userId}/profile 경로 지원)
  if (targetUid && targetUid !== "anonymous") {
    try {
      const docRef2 = doc(db, `user/${targetUid}/profile`, FIRESTORE_PROFILE_INFO_DOC);
      await setDoc(docRef2, infoPayload, { merge: true });
    } catch {
      // ignore
    }
  }

  // 상위 users/{uid} 및 user/{uid} 문서에도 주요 정보 동기화
  if (targetUid && targetUid !== "anonymous") {
    await saveUserDocToFirestore(
      {
        displayName: profile.name,
        handle: profile.handle || usernameVal,
        username: usernameVal,
        roleTitle: profile.roleTitle,
        bio: profile.bio,
        photoURL: profile.avatarUrl,
      },
      targetUid
    );

    // usernames 컬렉션에 유일성 선점(Claim) 등록
    if (usernameVal) {
      await claimUsername(usernameVal, oldUsername, targetUid);
    }
  }
}

/**
 * 1-1. 기본 프로필 정보 조회 (user/{userId}/profile 및 users/{userId}/profile 지원)
 */
export async function getProfileInfoFromFirestore(uid?: string): Promise<Partial<DesignerProfileData> | null> {
  try {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return null;

    // 1. user/{userId}/profile/info 시도
    try {
      const userDocRef = doc(db, `user/${targetUid}/profile`, FIRESTORE_PROFILE_INFO_DOC);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          ...data,
          username: data.username || data.handle || undefined,
        } as Partial<DesignerProfileData>;
      }
    } catch {}

    // 2. users/{userId}/profile/info 시도
    try {
      const userBase = getFirestoreUserBase(targetUid);
      const docRef = doc(db, `${userBase}/profile`, FIRESTORE_PROFILE_INFO_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          ...data,
          username: data.username || data.handle || undefined,
        } as Partial<DesignerProfileData>;
      }
    } catch {}

    // 3. user/{userId}/profile 서브컬렉션의 문서 조회 fallback
    try {
      const subCol = collection(db, `user/${targetUid}/profile`);
      const snapCol = await getDocs(subCol);
      if (!snapCol.empty) {
        const data = snapCol.docs[0].data();
        return {
          ...data,
          username: data.username || data.handle || undefined,
        } as Partial<DesignerProfileData>;
      }
    } catch {}

    // 4. users/{uid} 또는 user/{uid} 기본 문서에서 조회 시도
    if (targetUid !== "anonymous") {
      const userDoc = await getUserDocFromFirestore(targetUid);
      if (userDoc) {
        return {
          name: userDoc.displayName || undefined,
          handle: userDoc.handle || userDoc.username || undefined,
          username: userDoc.username || userDoc.handle || undefined,
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
 * 2. 이력서 및 소셜 링크 서브 문서 (users/{uid}/profile/links 및 user/{uid}/profile/links) 저장
 */
export interface ProfileLinksPayload {
  resumePdfUrl?: string;
  socialLinks: SocialLinks;
}

export async function saveProfileLinksToFirestore(
  payload: ProfileLinksPayload,
  uid?: string
): Promise<void> {
  const targetUid = uid || auth.currentUser?.uid;
  const linkData = {
    resumePdfUrl: payload.resumePdfUrl || "",
    behance: payload.socialLinks.behance || "",
    linkedin: payload.socialLinks.linkedin || "",
    github: payload.socialLinks.github || "",
    instagram: payload.socialLinks.instagram || "",
    dribbble: payload.socialLinks.dribbble || "",
    email: payload.socialLinks.email || "",
    updatedAt: serverTimestamp(),
  };

  const userBase = getFirestoreUserBase(targetUid);
  const docRef1 = doc(db, `${userBase}/profile`, FIRESTORE_PROFILE_LINKS_DOC);
  await setDoc(docRef1, linkData, { merge: true });

  if (targetUid && targetUid !== "anonymous") {
    try {
      const docRef2 = doc(db, `user/${targetUid}/profile`, FIRESTORE_PROFILE_LINKS_DOC);
      await setDoc(docRef2, linkData, { merge: true });
    } catch {}
  }
}

/**
 * 2-1. 이력서 및 소셜 링크 서브 문서 조회 (user/{userId}/profile 및 users/{userId}/profile 지원)
 */
export async function getProfileLinksFromFirestore(uid?: string): Promise<ProfileLinksPayload | null> {
  try {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return null;

    // 1. user/{userId}/profile/links 조회
    try {
      const docRefUser = doc(db, `user/${targetUid}/profile`, FIRESTORE_PROFILE_LINKS_DOC);
      const snapUser = await getDoc(docRefUser);
      if (snapUser.exists()) {
        const data = snapUser.data();
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
    } catch {}

    // 2. users/{userId}/profile/links 조회
    const userBase = getFirestoreUserBase(targetUid);
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
 * 3-1. 도구 숙련도 서브 컬렉션 조회 (user/{uid}/tools 및 users/{uid}/tools 지원)
 */
export async function getToolsFromFirestore(uid?: string): Promise<ToolProficiency[] | null> {
  try {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return null;
    const paths = [`user/${targetUid}/tools`, `users/${targetUid}/tools`];

    for (const p of paths) {
      try {
        const colRef = collection(db, p);
        const snap = await getDocs(colRef);
        if (!snap.empty) {
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
        }
      } catch {}
    }

    return null;
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
 * 4-1. 경력 및 활동 서브 컬렉션 조회 (user/{uid}/careers 및 users/{uid}/careers 지원)
 */
export async function getCareersFromFirestore(uid?: string): Promise<CareerItem[] | null> {
  try {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return null;
    const paths = [`user/${targetUid}/careers`, `users/${targetUid}/careers`];

    for (const p of paths) {
      try {
        const colRef = collection(db, p);
        const snap = await getDocs(colRef);
        if (!snap.empty) {
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

          const careerList: CareerItem[] = items.map((item) => {
            const copy = { ...item };
            delete (copy as { orderIndex?: number }).orderIndex;
            return copy;
          });
          return sortCareersByPeriod(careerList);
        }
      } catch {}
    }

    return null;
  } catch (err) {
    console.warn("Firestore 경력 활동 로드 실패:", err);
    return null;
  }
}
