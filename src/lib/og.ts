import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  findUserIdByUsername,
  getProfileInfoFromFirestore,
} from "@/lib/firestoreProfile";
import { fromFirestoreDoc, getLinksFromFirestore } from "@/lib/firestoreLinks";
import type { ProjectItem } from "@/types/portfolio";

export const OG_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_CONTENT_TYPE = "image/png";

/**
 * MyPortfolio 디자인 시스템 공식 컬러 토큰
 */
export const OG_COLORS = {
  navy900: "#0A192F",
  navy800: "#1E293B",
  navy700: "#334155",
  navy600: "#475569",
  navy500: "#64748B",
  navy400: "#94A3B8",
  orange: "#FF5A36",
  orangeHover: "#E84E2B",
  orangeWeak: "#FFF2EE",
  canvas: "#FFFFFF",
  surfaceSubtle: "#F8FAFC",
  surfaceMuted: "#F1F5F9",
  borderSubtle: "#E2E8F0",
};

interface FontOption {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 700 | 800;
  style: "normal";
}

let cachedFonts: FontOption[] | null = null;

/**
 * 서비스에서 사용하는 Pretendard 및 Syne 로컬 폰트를 직접 로드합니다.
 * 외부 네트워크 호출이 없으므로 항상 깨짐 없이 렌더링됩니다.
 */
export async function loadLocalOgFonts(): Promise<FontOption[]> {
  if (cachedFonts && cachedFonts.length > 0) {
    return cachedFonts;
  }

  const fonts: FontOption[] = [];
  const fontsDir = join(process.cwd(), "public/fonts");

  try {
    const [pretendardBoldBuf, pretendardMedBuf, syneBuf] = await Promise.all([
      readFile(join(fontsDir, "Pretendard-Bold.ttf")),
      readFile(join(fontsDir, "Pretendard-Medium.ttf")),
      readFile(join(fontsDir, "Syne-ExtraBold.ttf")),
    ]);

    const toArrayBuffer = (buf: Buffer): ArrayBuffer => {
      const ab = new ArrayBuffer(buf.byteLength);
      const view = new Uint8Array(ab);
      for (let i = 0; i < buf.byteLength; ++i) {
        view[i] = buf[i];
      }
      return ab;
    };

    fonts.push({
      name: "Pretendard",
      data: toArrayBuffer(pretendardMedBuf),
      weight: 500,
      style: "normal",
    });

    fonts.push({
      name: "Pretendard",
      data: toArrayBuffer(pretendardBoldBuf),
      weight: 700,
      style: "normal",
    });

    fonts.push({
      name: "Syne",
      data: toArrayBuffer(syneBuf),
      weight: 800,
      style: "normal",
    });

    cachedFonts = fonts;
  } catch (err) {
    console.error("로컬 폰트 로드 실패:", err);
  }

  return fonts;
}

/**
 * 외부 이미지 URL을 Satori 호환 Data URL로 안전하게 변환
 */
export async function fetchSafeImageDataUrl(
  imageUrl?: string | null
): Promise<string | null> {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(trimmed, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (
      !contentType.includes("png") &&
      !contentType.includes("jpeg") &&
      !contentType.includes("jpg") &&
      !contentType.includes("gif")
    ) {
      return null;
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

export const DEFAULT_ROLE_TITLE = "Designer";

export interface OgUserProfile {
  username: string;
  roleTitle: string;
  bio?: string;
  avatarDataUrl: string | null;
}

/**
 * uid로 Firestore에서 username / roleTitle / 프로필 사진을 조회합니다.
 * roleTitle이 비어있으면 "Designer"로 대체합니다.
 */
async function loadOwnerProfile(
  uid: string,
  fallbackUsername: string,
  userInfo?: {
    username?: string;
    handle?: string;
    roleTitle?: string;
    bio?: string;
    photoURL?: string | null;
  } | null
): Promise<OgUserProfile> {
  const info = await getProfileInfoFromFirestore(uid);

  const username =
    info?.username?.trim() ||
    info?.handle?.trim() ||
    userInfo?.username?.trim() ||
    userInfo?.handle?.trim() ||
    fallbackUsername;
  const roleTitle =
    info?.roleTitle?.trim() ||
    userInfo?.roleTitle?.trim() ||
    DEFAULT_ROLE_TITLE;
  const bio = info?.bio?.trim() || userInfo?.bio?.trim() || undefined;
  const avatarDataUrl = await fetchSafeImageDataUrl(
    info?.avatarUrl || userInfo?.photoURL || null
  );

  return {
    username: username.replace(/^@/, ""),
    roleTitle,
    bio,
    avatarDataUrl,
  };
}

/**
 * [username] 동적 경로용 프로필 조회 (Firestore)
 */
export async function getOgUserProfile(rawUsername: string): Promise<OgUserProfile> {
  const decoded = rawUsername ? decodeURIComponent(rawUsername) : "designer";
  const cleanUsername = decoded.replace(/^@/, "").trim() || "designer";

  const fallback: OgUserProfile = {
    username: cleanUsername,
    roleTitle: DEFAULT_ROLE_TITLE,
    avatarDataUrl: null,
  };

  if (cleanUsername === "demo") {
    return fallback;
  }

  try {
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 4000)
    );

    const fetchPromise = (async () => {
      const match = await findUserIdByUsername(cleanUsername);
      if (!match?.uid) return null;
      return loadOwnerProfile(match.uid, cleanUsername, match.userInfo);
    })();

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    return result || fallback;
  } catch {
    return fallback;
  }
}

export interface OgProjectData extends OgUserProfile {
  id: string;
  title?: string;
  summary?: string;
}

/**
 * /projects/[id] 동적 경로용 조회: 프로젝트 소유자의 username / roleTitle / 사진 (Firestore)
 */
export async function getOgProjectData(rawId: string): Promise<OgProjectData> {
  const cleanId = rawId ? decodeURIComponent(rawId).trim() : "project";

  const fallback: OgProjectData = {
    id: cleanId,
    title: "프로젝트",
    summary: "프로젝트 케이스 스터디 및 상세 작업물",
    username: "designer",
    roleTitle: DEFAULT_ROLE_TITLE,
    avatarDataUrl: null,
  };

  try {
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 5000)
    );

    const fetchPromise = (async (): Promise<OgProjectData | null> => {
      const usersSnap = await getDocs(collection(db, "users"));
      const checks = await Promise.all(
        usersSnap.docs.map(async (uDoc) => {
          try {
            const linkSnap = await getDoc(
              doc(db, "users", uDoc.id, "links", cleanId)
            );
            return linkSnap.exists()
              ? { uid: uDoc.id, userData: uDoc.data(), link: linkSnap.data() }
              : null;
          } catch {
            return null;
          }
        })
      );
      const matched = checks.find((c) => c !== null);
      if (!matched) return null;

      const owner = await loadOwnerProfile(
        matched.uid,
        String(matched.userData?.username || matched.userData?.handle || "designer"),
        matched.userData as {
          username?: string;
          handle?: string;
          roleTitle?: string;
          bio?: string;
          photoURL?: string | null;
        }
      );

      return {
        ...owner,
        id: cleanId,
        title: String(matched.link?.title || fallback.title),
        summary: String(
          matched.link?.summary || matched.link?.description || fallback.summary
        ),
      };
    })();

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    return result || fallback;
  } catch {
    return fallback;
  }
}
