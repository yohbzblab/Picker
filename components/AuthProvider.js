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
      router.push("/");
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
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const supabaseUser = session?.user ?? null;
      setUser(supabaseUser);

      if (event === "SIGNED_IN" && supabaseUser) {
        await handleUserRegistration(supabaseUser);
      } else if (event === "SIGNED_OUT") {
        setDbUser(null);
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

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
