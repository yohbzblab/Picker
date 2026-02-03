"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { tokenManager } from "@/lib/auth/token";
import { isPhoneVerificationBypassed } from "@/lib/phoneVerification";

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
  const [dbUserError, setDbUserError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // survey 페이지인 경우 로그인 없이 접근 허용
  if (pathname.startsWith('/survey/') && pathname !== '/survey/preview') {
    return children;
  }

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

  const refreshDbUser = useCallback(async () => {
    try {
      if (!dbUser?.id) return null
      const res = await fetch(`/api/users?userId=${dbUser.id}`)
      if (!res.ok) return null
      const data = await res.json()
      if (!data?.user) return null

      setDbUser(data.user)
      saveToCache(user, data.user)
      tokenManager.setUserData({ supabaseUser: user, dbUser: data.user })
      return data.user
    } catch (e) {
      return null
    }
  }, [dbUser?.id, saveToCache, user]);

  // 캐시를 무효화하는 함수
  const invalidateCache = useCallback(() => {
    authCache.clear();
  }, []);

  const handleUserRegistration = useCallback(async (supabaseUser, skipCache = false) => {
    try {
      setDbUserError(null);
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
          const errorData = await createUserResponse.json().catch(() => ({}));
          console.error("Error creating user:", errorData);
          setDbUserError(errorData?.details || errorData?.error || "DB 사용자 생성에 실패했습니다.");
          return;
        }
      } else {
        const errorData = await getUserResponse.json().catch(() => ({}));
        console.error("Error fetching user:", errorData);
        setDbUserError(errorData?.details || errorData?.error || "DB 사용자 조회에 실패했습니다.");
        return;
      }

      setDbUser(existingUser);
      // 캐시에 저장
      saveToCache(supabaseUser, existingUser);
      return existingUser;
    } catch (error) {
      console.error("Error handling user registration:", error);
      setDbUserError(error?.message || "DB 사용자 동기화 중 오류가 발생했습니다.");
    }
  }, [saveToCache]);

  // user는 있는데 dbUser가 없을 때, 페이지에서 수동으로 재시도할 수 있게 노출
  const ensureDbUser = useCallback(async (force = false) => {
    if (!user) return null;
    return await handleUserRegistration(user, force);
  }, [handleUserRegistration, user]);

  // 전화번호 인증 게이트: 기존/신규 유저 포함, phoneVerified=false면 verify 페이지로 강제
  useEffect(() => {
    if (!isHydrated) return
    if (loading) return
    if (!user || !dbUser) return

    const allowPaths = ['/login', '/', '/auth', '/verify-phone']
    const isAllowed = allowPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

    const isBypassed = isPhoneVerificationBypassed({ user, dbUser });
    if (dbUser.phoneVerified === false && !isAllowed && !isBypassed) {
      router.push('/verify-phone')
    }
  }, [dbUser, isHydrated, loading, pathname, router, user]);

  // 클라이언트 사이드 hydration 처리 및 즉시 토큰 확인
  useEffect(() => {
    setIsHydrated(true);

    // 즉시 로컬 토큰 확인하여 로딩 상태 최적화
    const token = tokenManager.getToken();
    const userData = tokenManager.getUserData();

    if (token && tokenManager.isValid() && userData) {
      // console.log('Using cached user data immediately'); // 디버깅용
      setUser(userData.supabaseUser);
      setDbUser(userData.dbUser);
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  // 안전장치: user는 있는데 dbUser가 비어있는 경우(캐시 손상/부분 저장 등),
  // 서버에서 dbUser를 재조회해서 흰 화면(loading 고정) 상태를 방지
  useEffect(() => {
    if (!isHydrated) return
    if (loading) return
    if (!user) return
    if (dbUser) return

    // user(id)가 있는 상태에서만 재조회
    if (!user?.id) return
    handleUserRegistration(user, true)
  }, [isHydrated, loading, user, dbUser, handleUserRegistration]);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행하고, 한 번만 실행
    if (!isHydrated || !isInitialLoad) {
      return;
    }

    const checkUser = async () => {
      try {
        // console.log('Initial auth check starting...'); // 디버깅용

        // 먼저 로컬 토큰 확인
        const token = tokenManager.getToken();
        const userData = tokenManager.getUserData();

        if (token && tokenManager.isValid() && userData) {
          // console.log('Using cached user data'); // 디버깅용
          // 유효한 토큰이 있으면 로컬 데이터 사용 - 즉시 로딩 완료
          setUser(userData.supabaseUser);
          setDbUser(userData.dbUser);
          setLoading(false);
          setIsInitialLoad(false);
          return;
        }

        // console.log('Checking Supabase session...'); // 디버깅용
        // 토큰이 없거나 유효하지 않으면 Supabase 세션 확인 (OAuth 콜백 처리용)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const supabaseUser = session?.user ?? null;

        if (supabaseUser && session?.access_token) {
          // console.log('Found valid Supabase session'); // 디버깅용
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
          // console.log('No valid session found'); // 디버깅용
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
  }, [isHydrated, isInitialLoad, supabase, handleUserRegistration, invalidateCache]);

  // onAuthStateChange 이벤트 리스너 설정 - 초기 로드 완료 후에만 실행
  useEffect(() => {
    if (!isHydrated || isInitialLoad) {
      return;
    }

    // console.log('Setting up auth state change listener'); // 디버깅용

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('Auth state change:', event, 'pathname:', window.location.pathname); // 디버깅용
      const supabaseUser = session?.user ?? null;

      // 모든 자동 이벤트에서는 리다이렉트하지 않음 - 오직 명시적인 로그인/로그아웃만
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") {
        // console.log('Ignoring event:', event); // 디버깅용
        return;
      }

      if (event === "SIGNED_IN" && supabaseUser && session?.access_token) {
        // console.log('Processing SIGNED_IN event'); // 디버깅용
        // 현재 사용자와 같은지 확인하여 불필요한 상태 업데이트 방지
        if (user?.id === supabaseUser.id) {
          // console.log('User already set, skipping state update'); // 디버깅용
          return;
        }

        // 로그인 성공 시 토큰 저장
        tokenManager.setToken(session.access_token);
        setUser(supabaseUser);

        const dbUserData = await handleUserRegistration(supabaseUser);

        // 사용자 데이터 저장
        tokenManager.setUserData({
          supabaseUser: supabaseUser,
          dbUser: dbUserData
        });

        // 로그인 페이지나 홈페이지에서만 리다이렉트
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/' || currentPath === '/auth/callback') {
          const isBypassed = isPhoneVerificationBypassed({
            user: supabaseUser,
            dbUser: dbUserData,
          });
          if (dbUserData?.phoneVerified === false && !isBypassed) {
            router.push("/verify-phone");
          } else {
            router.push("/dashboard");
          }
        } else {
          // console.log('Not redirecting, current path:', currentPath); // 디버깅용
        }
      } else if (event === "SIGNED_OUT") {
        // console.log('Processing SIGNED_OUT event'); // 디버깅용
        // 로그아웃 처리
        tokenManager.clearAll();
        invalidateCache();
        setUser(null);
        setDbUser(null);

        // survey 페이지에서는 로그아웃 시 리다이렉트하지 않음
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/survey/') || currentPath === '/survey/preview') {
          // 현재 도메인에서 로그인 페이지로 리다이렉트
          router.push("/login");
        }
      }
    });

    return () => {
      // console.log('Cleaning up auth state change listener'); // 디버깅용
      subscription.unsubscribe();
    };
  }, [isHydrated, isInitialLoad, user, supabase, router, handleUserRegistration, invalidateCache]);

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

  const value = useMemo(() => ({
    user,
    dbUser,
    loading,
    dbUserError,
    signInWithGoogle,
    signOut,
    checkTokenValidity,
    refreshDbUser,
    ensureDbUser,
  }), [user, dbUser, loading, dbUserError, signInWithGoogle, signOut, checkTokenValidity, refreshDbUser, ensureDbUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
