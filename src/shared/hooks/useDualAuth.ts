// src/hooks/useDualAuth.ts - SIMPLIFIED VERSION
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import type { UserProfile } from "@/types/user";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  user: any | null; // Using any for now to avoid type issues
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
        return;
      }

      // Create user object from session
      const user = {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.user_metadata?.full_name || 
              session.user.user_metadata?.name || 
              `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim(),
        role: session.user.user_metadata?.role,
      };

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

  // SIMPLIFIED Sign in function - NO predefined admin logic
  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log('Attempting login for:', email);
      
      // Direct Supabase authentication - no predefined admin check
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('Login result:', { data, error });

      if (error) {
        console.error('Login error:', error);
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }

      // Update auth state with the session
      await updateAuthState(data.session);
      console.log('Login successful, auth state updated');
      
      return { success: true, error: null };
      
    } catch (error) {
      console.error('Login exception:', error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }

      return { success: true, error: null, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
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

      router.push("/login");
      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Helper functions
  const isAuthenticated = !!authState.user;
  const hasProfile = !!authState.profile;
  const isAdmin = authState.profile?.role === "admin";
  const isSchoolStaff = authState.profile?.role === "school_staff";

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    hasProfile,
    isAdmin,
    isSchoolStaff,
  };
}