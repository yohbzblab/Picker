"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const handleUserRegistration = async (supabaseUser) => {
    try {
      // First, try to get existing user
      const getUserResponse = await fetch(
        `/api/users?supabaseId=${supabaseUser.id}`
      );

      let existingUser;

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
      // 로그인 후에만 메인 페이지로 리다이렉트 (기존 사용자가 돌아오는 경우 제외)
    } catch (error) {
      console.error("Error handling user registration:", error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const supabaseUser = session?.user ?? null;
        setUser(supabaseUser);

        if (supabaseUser) {
          try {
            const getUserResponse = await fetch(
              `/api/users?supabaseId=${supabaseUser.id}`
            );
            if (getUserResponse.ok) {
              const getUserData = await getUserResponse.json();
              setDbUser(getUserData.user);
            }
          } catch (error) {
            console.error("Error fetching user on init:", error);
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    checkUser();

    // 브라우저 포커스 이벤트 처리 (다른 탭에서 돌아올 때)
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // 페이지가 다시 보이게 되고 사용자가 로그인 상태일 때
        // 세션을 조용히 확인하되 리다이렉트하지 않음
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && user) {
            // 세션이 유효하면 아무것도 하지 않음 (현재 페이지 유지)
          } else if (!session?.user) {
            // 세션이 없으면 로그아웃 처리
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
        // 실제 로그인 이벤트에서만 리다이렉트
        await handleUserRegistration(supabaseUser);
        router.push("/");
      } else if (event === "SIGNED_OUT") {
        setDbUser(null);
        router.push("/login");
      } else if (event === "TOKEN_REFRESHED" && supabaseUser) {
        // 토큰 갱신 시에는 리다이렉트하지 않고 dbUser만 업데이트
        try {
          const getUserResponse = await fetch(
            `/api/users?supabaseId=${supabaseUser.id}`
          );
          if (getUserResponse.ok) {
            const getUserData = await getUserResponse.json();
            setDbUser(getUserData.user);
          }
        } catch (error) {
          console.error("Error fetching user on token refresh:", error);
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
