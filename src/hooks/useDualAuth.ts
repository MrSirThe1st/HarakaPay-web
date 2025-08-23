"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { validatePredefinedAdmin, type AuthUser } from "@/lib/adminValidation";
import type { UserProfile } from "@/types/user";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useDualAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const [isPredefinedAdmin, setIsPredefinedAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user profile from database
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

  // Update auth state when session changes
  const updateAuthState = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
        setIsPredefinedAdmin(false);
        return;
      }

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || "",
        name:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name,
        role: session.user.user_metadata?.role,
      };

      // Check if this is a predefined admin

  // If you need to check for predefined admin, use validatePredefinedAdmin
  // Otherwise, setIsPredefinedAdmin(false);
  setIsPredefinedAdmin(false);

      // Fetch user profile from database
      const profile = await fetchUserProfile(session.user.id);

      setAuthState({
        user,
        profile,
        loading: false,
        error: null,
      });
    },
    [fetchUserProfile]
  );

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await updateAuthState(session);

      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth, updateAuthState]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Check if this is a predefined admin

      const predefinedAdmin = await validatePredefinedAdmin(email, password);
      if (predefinedAdmin) {
        // Handle predefined admin login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: predefinedAdmin.email,
          password: predefinedAdmin.password,
        });

        if (error) {
          // If Supabase login fails, create the admin user
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: predefinedAdmin.email,
            password: predefinedAdmin.password,
            options: {
              data: {
                full_name: `${predefinedAdmin.firstName ?? ""} ${predefinedAdmin.lastName ?? ""}`,
                role: predefinedAdmin.role,
              },
            },
          });

          if (signUpError) {
            setAuthState((prev) => ({
              ...prev,
              loading: false,
              error: signUpError.message,
            }));
            return { success: false, error: signUpError.message, isPredefinedAdmin: false };
          }

          await updateAuthState(signUpData.session);
        } else {
          await updateAuthState(data.session);
        }

        return { success: true, error: null, isPredefinedAdmin: true };
      }

      // Regular Supabase authentication
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
        return { success: false, error: error.message, isPredefinedAdmin: false };
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

  // Sign out function
  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
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
      });
      setIsPredefinedAdmin(false);

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

  // Reset password function
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

  // Computed values
  const isAuthenticated = !!authState.user;
  const hasProfile = !!authState.profile;
  const isAdmin = authState.profile?.role === "admin" || isPredefinedAdmin;
  const isSchoolStaff = authState.profile?.role === "school_staff";

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated,
    hasProfile,
    isAdmin,
    isSchoolStaff,
    isPredefinedAdmin,
  };
}