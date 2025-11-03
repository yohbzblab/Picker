"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
      console.warn('Failed to cache auth data:', error);
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
      console.warn('Failed to read auth cache:', error);
      return null;
    }
  },
  remove: (key) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to remove auth cache:', error);
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
        // 먼저 캐시에서 로드 시도
        if (loadFromCache()) {
          setIsInitialLoad(false);
          return;
        }

        // 캐시에 없거나 만료된 경우에만 Supabase 호출
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const supabaseUser = session?.user ?? null;
        setUser(supabaseUser);

        if (supabaseUser) {
          await handleUserRegistration(supabaseUser);
        } else {
          // 로그아웃 상태면 캐시 정리
          invalidateCache();
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    checkUser();

    // 브라우저 포커스 이벤트 처리 최적화 (캐시 활용)
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        const lastCheck = authCache.get(CACHE_KEYS.LAST_CHECK);
        // 5분 이내에 체크했으면 Supabase 호출 생략
        if (lastCheck && (Date.now() - lastCheck < 5 * 60 * 1000)) {
          return;
        }

        // 5분이 지났으면 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && user) {
            // 세션이 유효하면 캐시 갱신
            authCache.set(CACHE_KEYS.LAST_CHECK, Date.now());
          } else if (!session?.user) {
            // 세션이 없으면 로그아웃 처리
            invalidateCache();
            setUser(null);
            setDbUser(null);
            router.push("/login");
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const cleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const supabaseUser = session?.user ?? null;
      setUser(supabaseUser);

      // 초기 로드 중에는 리다이렉트하지 않음
      if (isInitialLoad) {
        return;
      }

      if (event === "SIGNED_IN" && supabaseUser) {
        // 탭 전환으로 인한 세션 복구가 아닌, 실제 로그인 이벤트에서만 리다이렉트
        // 이미 user가 있으면 탭 전환일 가능성이 높음
        if (!user) {
          await handleUserRegistration(supabaseUser);
          router.push("/");
        } else {
          // 이미 로그인된 상태에서 세션이 복구된 경우 (탭 전환 등)
          // 캐시된 데이터가 있으면 API 호출 생략
          await handleUserRegistration(supabaseUser);
        }
      } else if (event === "SIGNED_OUT") {
        invalidateCache();
        setDbUser(null);
        router.push("/login");
      } else if (event === "TOKEN_REFRESHED" && supabaseUser) {
        // 토큰 갱신 시에는 캐시 확인 후 필요시에만 API 호출
        const cachedDbUser = authCache.get(CACHE_KEYS.DB_USER);
        const lastCheck = authCache.get(CACHE_KEYS.LAST_CHECK);
        const isCacheValid = lastCheck && (Date.now() - lastCheck < 5 * 60 * 1000);

        if (!isCacheValid || !cachedDbUser || cachedDbUser.supabaseId !== supabaseUser.id) {
          // 캐시가 없거나 무효한 경우에만 API 호출
          await handleUserRegistration(supabaseUser);
        } else {
          // 캐시가 유효하면 캐시 데이터 사용
          setDbUser(cachedDbUser);
          authCache.set(CACHE_KEYS.LAST_CHECK, Date.now());
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanup();
    };
  }, [router, supabase, isInitialLoad]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // 로그아웃 시 캐시 정리
      invalidateCache();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    dbUser,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
