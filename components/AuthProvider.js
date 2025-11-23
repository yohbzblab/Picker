"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth/token";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// 캐시 키 상수
const CACHE_KEYS = {
  USER: 'picker_user',
  DB_USER: 'picker_db_user',
  LAST_CHECK: 'picker_last_auth_check',
  SESSION_EXPIRES: 'picker_session_expires'
};

// 캐시 유틸리티 함수들
const authCache = {
  set: (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      // 캐시 저장 실패는 치명적이지 않으므로 무시
    }
  },
  get: (key) => {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
      return null;
    } catch (error) {
      // 캐시 읽기 실패는 치명적이지 않으므로 무시
      return null;
    }
  },
  remove: (key) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      // 캐시 삭제 실패는 치명적이지 않으므로 무시
    }
  },
  clear: () => {
    Object.values(CACHE_KEYS).forEach(key => authCache.remove(key));
  }
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // 캐시에서 사용자 정보를 로드하는 함수
  const loadFromCache = useCallback(() => {
    const cachedUser = authCache.get(CACHE_KEYS.USER);
    const cachedDbUser = authCache.get(CACHE_KEYS.DB_USER);
    const lastCheck = authCache.get(CACHE_KEYS.LAST_CHECK);

    // 캐시가 5분 이내로 최신이면 사용
    const isCacheValid = lastCheck && (Date.now() - lastCheck < 5 * 60 * 1000);

    if (isCacheValid && cachedUser) {
      setUser(cachedUser);
      setDbUser(cachedDbUser);
      setLoading(false);
      return true;
    }
    return false;
  }, []);

  // 사용자 정보를 캐시에 저장하는 함수
  const saveToCache = useCallback((userData, dbUserData) => {
    authCache.set(CACHE_KEYS.USER, userData);
    authCache.set(CACHE_KEYS.DB_USER, dbUserData);
    authCache.set(CACHE_KEYS.LAST_CHECK, Date.now());
  }, []);

  // 캐시를 무효화하는 함수
  const invalidateCache = useCallback(() => {
    authCache.clear();
  }, []);

  const handleUserRegistration = useCallback(async (supabaseUser, skipCache = false) => {
    try {
      let existingUser;

      // 캐시에서 먼저 확인 (skipCache가 false이고 캐시가 유효한 경우)
      if (!skipCache) {
        const cachedDbUser = authCache.get(CACHE_KEYS.DB_USER);
        const lastCheck = authCache.get(CACHE_KEYS.LAST_CHECK);
        const isCacheValid = lastCheck && (Date.now() - lastCheck < 5 * 60 * 1000);

        if (isCacheValid && cachedDbUser && cachedDbUser.supabaseId === supabaseUser.id) {
          setDbUser(cachedDbUser);
          return cachedDbUser;
        }
      }

      // 캐시에 없거나 무효한 경우에만 API 호출
      const getUserResponse = await fetch(
        `/api/users?supabaseId=${supabaseUser.id}`
      );

      if (getUserResponse.ok) {
        const getUserData = await getUserResponse.json();
        existingUser = getUserData.user;
      } else if (getUserResponse.status === 404) {
        // User doesn't exist, create new user
        const createUserResponse = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: supabaseUser.email,
            name:
              supabaseUser.user_metadata?.full_name ||
              supabaseUser.user_metadata?.name,
            profileImage: supabaseUser.user_metadata?.avatar_url,
            supabaseId: supabaseUser.id,
          }),
        });

        if (createUserResponse.ok) {
          const createUserData = await createUserResponse.json();
          existingUser = createUserData.user;
        } else {
          const errorData = await createUserResponse.json();
          console.error("Error creating user:", errorData);
          return;
        }
      } else {
        const errorData = await getUserResponse.json();
        console.error("Error fetching user:", errorData);
        return;
      }

      setDbUser(existingUser);
      // 캐시에 저장
      saveToCache(supabaseUser, existingUser);
      return existingUser;
    } catch (error) {
      console.error("Error handling user registration:", error);
    }
  }, [saveToCache]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // 먼저 로컬 토큰 확인
        const token = tokenManager.getToken();
        const userData = tokenManager.getUserData();

        if (token && tokenManager.isValid() && userData) {
          // 유효한 토큰이 있으면 로컬 데이터 사용
          setUser(userData.supabaseUser);
          setDbUser(userData.dbUser);
          setLoading(false);
          setIsInitialLoad(false);
          return;
        }

        // 토큰이 없거나 유효하지 않으면 Supabase 세션 확인 (OAuth 콜백 처리용)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const supabaseUser = session?.user ?? null;

        if (supabaseUser && session?.access_token) {
          // Supabase 세션이 있으면 토큰 저장
          tokenManager.setToken(session.access_token);
          setUser(supabaseUser);

          const dbUserData = await handleUserRegistration(supabaseUser);

          // 사용자 데이터도 함께 저장
          tokenManager.setUserData({
            supabaseUser: supabaseUser,
            dbUser: dbUserData
          });
        } else {
          // 로그아웃 상태
          tokenManager.clearAll();
          invalidateCache();
          setUser(null);
          setDbUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    checkUser();

    // visibilitychange 이벤트 리스너 제거 - 탭 전환 시 리렌더링과 강제 리다이렉트 방지

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, 'pathname:', window.location.pathname); // 디버깅용
      const supabaseUser = session?.user ?? null;

      // 초기 로드 중에는 리다이렉트하지 않음
      if (isInitialLoad) {
        console.log('Skipping during initial load');
        return;
      }

      // 모든 자동 이벤트에서는 리다이렉트하지 않음 - 오직 명시적인 로그인/로그아웃만
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") {
        console.log('Ignoring event:', event);
        return;
      }

      if (event === "SIGNED_IN" && supabaseUser && session?.access_token) {
        console.log('Processing SIGNED_IN event');
        // 로그인 성공 시 토큰 저장
        tokenManager.setToken(session.access_token);
        setUser(supabaseUser);

        const dbUserData = await handleUserRegistration(supabaseUser);

        // 사용자 데이터 저장
        tokenManager.setUserData({
          supabaseUser: supabaseUser,
          dbUser: dbUserData
        });

        // 로그인 페이지나 홈페이지에서만 대시보드로 리다이렉트
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/' || currentPath === '/auth/callback') {
          console.log('Redirecting to dashboard from:', currentPath);
          router.push("/dashboard");
        } else {
          console.log('Not redirecting, current path:', currentPath);
        }
      } else if (event === "SIGNED_OUT") {
        console.log('Processing SIGNED_OUT event');
        // 로그아웃 처리
        tokenManager.clearAll();
        invalidateCache();
        setUser(null);
        setDbUser(null);

        // 현재 도메인에서 로그인 페이지로 리다이렉트
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, isInitialLoad]);

  const signInWithGoogle = async () => {
    try {
      // 항상 현재 도메인을 사용
      const currentUrl = window.location.origin;
      const finalRedirectTo = `${currentUrl}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: finalRedirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google sign in failed:", error);

      // 사용자에게 친화적인 오류 메시지 표시
      if (error.message?.includes('redirect')) {
        alert('인증 설정 오류가 발생했습니다. Supabase 설정을 확인해주세요.');
      } else {
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // 로그아웃 시 토큰 및 캐시 정리
      tokenManager.clearAll();
      invalidateCache();
      setUser(null);
      setDbUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // 수동으로 토큰 유효성을 확인하는 함수 (필요한 페이지에서만 사용)
  const checkTokenValidity = useCallback(() => {
    if (user && !tokenManager.isValid()) {
      // 토큰이 만료되었으면 로그아웃 처리
      tokenManager.clearAll();
      invalidateCache();
      setUser(null);
      setDbUser(null);
      router.push("/login");
      return false;
    }
    return true;
  }, [user, router, invalidateCache]);

  const value = {
    user,
    dbUser,
    loading,
    signInWithGoogle,
    signOut,
    checkTokenValidity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
