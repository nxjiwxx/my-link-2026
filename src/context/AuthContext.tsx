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

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  roleTitle?: string;
  bio?: string;
  handle?: string;
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

  // Firestore users/{uid} 경로의 유저 정보 동기화
  const syncUserDoc = async (currentUser: User): Promise<UserProfileData> => {
    const userDocRef = doc(db, "users", currentUser.uid);
    let profileData: UserProfileData = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
    };

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        profileData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: data.displayName || currentUser.displayName || "디자이너",
          photoURL: data.photoURL || currentUser.photoURL,
          roleTitle: data.roleTitle,
          bio: data.bio,
          handle: data.handle || (currentUser.email ? currentUser.email.split("@")[0] : currentUser.uid.slice(0, 6)),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        // 최신 구글 프로필 정보로 업데이트
        await setDoc(
          userDocRef,
          {
            email: currentUser.email,
            displayName: profileData.displayName,
            photoURL: profileData.photoURL,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        // 새 유저 문서 생성
        const emailPrefix = currentUser.email
          ? currentUser.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "")
          : currentUser.uid.slice(0, 6);

        // 기본적인 이름은 로그인 정보 중 이름 (displayName)
        const initialName =
          currentUser.displayName ||
          (currentUser.email ? currentUser.email.split("@")[0] : "디자이너");
        // 사용자 이름은 사용자의 이메일 @의 앞부분
        const initialHandle =
          emailPrefix ||
          (currentUser.email ? currentUser.email.split("@")[0] : "user");

        profileData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: initialName,
          photoURL: currentUser.photoURL,
          roleTitle: "",
          bio: "",
          handle: initialHandle,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, profileData);
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
