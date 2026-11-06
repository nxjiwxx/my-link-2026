"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { claimUsername } from "@/lib/firestoreProfile";

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  roleTitle?: string;
  bio?: string;
  handle?: string;
  username?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  signInWithGoogle: async () => null,
  logout: async () => {},
  refreshUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Firestore users/{uid} 및 user/{uid} 경로의 유저 정보 동기화
  const syncUserDoc = async (currentUser: User): Promise<UserProfileData> => {
    const userDocRef = doc(db, "users", currentUser.uid);
    const userAltDocRef = doc(db, "user", currentUser.uid);

    // 구글 이메일 @의 앞부분을 사용자 이름(username) 기본값으로 설정 (예: user123@gmail.com -> user123)
    const emailPrefix = currentUser.email
      ? currentUser.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "")
      : currentUser.uid.slice(0, 6);

    const initialName =
      currentUser.displayName ||
      (currentUser.email ? currentUser.email.split("@")[0] : "디자이너");
    const defaultUsername = emailPrefix || "user";

    let profileData: UserProfileData = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: initialName,
      photoURL: currentUser.photoURL,
      username: defaultUsername,
      handle: defaultUsername,
    };

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        const resolvedUsername = data.username || data.handle || defaultUsername;
        profileData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: data.displayName || currentUser.displayName || initialName,
          photoURL: data.photoURL || currentUser.photoURL,
          roleTitle: data.roleTitle,
          bio: data.bio,
          handle: resolvedUsername,
          username: resolvedUsername,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };

        // 최신 구글 프로필 정보 및 username 항상 동기화
        const updatePayload = {
          email: currentUser.email,
          displayName: profileData.displayName,
          photoURL: profileData.photoURL,
          username: resolvedUsername,
          handle: resolvedUsername,
          updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, updatePayload, { merge: true });
        try {
          await setDoc(userAltDocRef, updatePayload, { merge: true });
        } catch {}
      } else {
        // 새 유저 문서 생성
        profileData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: initialName,
          photoURL: currentUser.photoURL,
          roleTitle: "",
          bio: "",
          handle: defaultUsername,
          username: defaultUsername,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, profileData);
        try {
          await setDoc(userAltDocRef, profileData);
        } catch {}
      }

      // 프로필 서브 문서 (users/{uid}/profile/info 및 user/{uid}/profile/info)에도 항상 동기화
      const infoPayload = {
        name: profileData.displayName || initialName,
        handle: profileData.username || defaultUsername,
        username: profileData.username || defaultUsername,
        avatarUrl: profileData.photoURL || "",
        updatedAt: serverTimestamp(),
      };
      try {
        await setDoc(doc(db, `users/${currentUser.uid}/profile`, "info"), infoPayload, { merge: true });
        await setDoc(doc(db, `user/${currentUser.uid}/profile`, "info"), infoPayload, { merge: true });
      } catch (err) {
        console.warn("프로필 info 동기화 실패:", err);
      }

      // usernames/{username} 고유 문서 등록 (중복 방지 선점)
      if (profileData.username) {
        try {
          await claimUsername(profileData.username, undefined, currentUser.uid);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn("Firestore users/{uid} 동기화 에러:", err);
    }

    return profileData;
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await syncUserDoc(user);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await syncUserDoc(currentUser);
          setUserProfile(profile);
        } catch (error) {
          console.error("유저 프로필 초기화 오류:", error);
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          });
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      const profile = await syncUserDoc(result.user);
      setUserProfile(profile);
      return result.user;
    } catch (error) {
      console.error("Google 로그인 실패:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signInWithGoogle,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
