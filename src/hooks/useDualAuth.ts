"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { validatePredefinedAdmin, type AuthUser } from "@/lib/adminValidation";
import type { UserProfile, AuthState } from "@/types/user";
import type { AuthSession } from "@supabase/supabase-js";

interface DualAuthState extends Omit<AuthState, "user"> {
  user: AuthUser | null;
  isPredefinedAdmin: boolean;
}

export function useDualAuth() {
  const [authState, setAuthState] = useState<DualAuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    isPredefinedAdmin: false,
  });

  const router = useRouter();
  const supabase = createClient();

  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }

        return data as UserProfile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    [supabase]
  );

  const updateAuthState = useCallback(
    async (session: AuthSession | null, predefinedAdmin?: AuthUser) => {
      // Handle predefined admin
      if (predefinedAdmin) {
        setAuthState({
          user: predefinedAdmin,
          profile: null, // Predefined admins don't have database profiles
          loading: false,
          error: null,
          isPredefinedAdmin: true,
        });
        return;
      }

      // Handle regular Supabase user
      if (!session?.user) {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
          isPredefinedAdmin: false,
        });
        return;
      }

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || "",
        name:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          "",
        role: session.user.user_metadata?.role || "school_staff",
        school_id: session.user.user_metadata?.school_id,
        isPredefined: false,
      };

      const profile = await fetchUserProfile(session.user.id);

      setAuthState({
        user,
        profile,
        loading: false,
        error: null,
        isPredefinedAdmin: false,
      });
    },
    [fetchUserProfile]
  );

  useEffect(() => {
    // Check for stored predefined admin session
    const storedAdmin = localStorage.getItem("predefined_admin");
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin) as AuthUser;
        updateAuthState(null, adminData);
        return;
      } catch {
        localStorage.removeItem("predefined_admin");
      }
    }

    // Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    });

    // Listen for Supabase auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("predefined_admin");
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
          isPredefinedAdmin: false,
        });
        router.push("/login");
      } else {
        await updateAuthState(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth, updateAuthState]);

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // First, check if it's a predefined admin
      const predefinedAdmin = await validatePredefinedAdmin(email, password);
      if (predefinedAdmin) {
        localStorage.setItem(
          "predefined_admin",
          JSON.stringify(predefinedAdmin)
        );

        // Also set a cookie for middleware detection
        document.cookie = `predefined_admin=${JSON.stringify(
          predefinedAdmin
        )}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

        await updateAuthState(null, predefinedAdmin);
        return { success: true, error: null, isPredefinedAdmin: true };
      }

      // If not predefined admin, try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return {
          success: false,
          error: error.message,
          isPredefinedAdmin: false,
        };
      }

      await updateAuthState(data.session);
      return { success: true, error: null, isPredefinedAdmin: false };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage, isPredefinedAdmin: false };
    }
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      // Clear predefined admin session
      localStorage.removeItem("predefined_admin");

      // Clear predefined admin cookie
      document.cookie =
        "predefined_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }

      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: null,
        isPredefinedAdmin: false,
      });

      router.push("/login");
      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!authState.user,
    hasProfile: !!authState.profile,
    isAdmin: authState.user?.role === "admin",
    isSchoolStaff: authState.user?.role === "school_staff",
  };
}
