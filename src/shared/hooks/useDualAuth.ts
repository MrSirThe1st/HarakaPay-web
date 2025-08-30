// src/hooks/useDualAuth.ts - UPDATED FOR NEW ROLE HIERARCHY (NO PARENTS)
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import type { UserProfile, UserRole, AdminType, RolePermissions } from "@/types/user";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  user: Record<string, unknown> | null; 
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
        console.log('=== PROFILE FETCH DEBUG ===');
        console.log('Fetching profile for user:', userId);
        console.log('User ID type:', typeof userId);
        console.log('User ID length:', userId?.length);
        console.log('Supabase client:', supabase);
        
        // Test the query step by step
        console.log('1. Testing basic query...');
        const { data: allProfiles, error: allError } = await supabase
          .from("profiles")
          .select("*");
        console.log('All profiles query result:', { data: allProfiles, error: allError });
        
        console.log('2. Testing specific user query...');
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        console.log('Specific user query result:', { data, error });
        console.log('Error object keys:', error ? Object.keys(error) : 'No error');
        console.log('Error object values:', error ? Object.values(error) : 'No error');
        
        // Test if it's an RLS issue by trying to get count
        console.log('3. Testing count query...');
        const { count, error: countError } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true });
        console.log('Count query result:', { count, error: countError });

        if (error) {
          console.error("Error fetching profile:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          if (error.code === 'PGRST116') {
            console.log('Profile not found - user needs to have a profile created');
          }
          return null;
        }

        console.log('Profile fetched successfully:', data);
        console.log('Profile type check:', typeof data, data?.role, data?.admin_type);
        console.log('=== END PROFILE FETCH DEBUG ===');
        return data as UserProfile;
      } catch (error) {
        console.error("Exception fetching profile:", error);
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

  // Helper functions for new role system
  const isAuthenticated = !!authState.user;
  const hasProfile = !!authState.profile;
  
  // Role checking functions
  const isSuperAdmin = authState.profile?.role === "super_admin";
  const isPlatformAdmin = authState.profile?.role === "platform_admin";
  const isSupportAdmin = authState.profile?.role === "support_admin";
  const isSchoolAdmin = authState.profile?.role === "school_admin";
  const isSchoolStaff = authState.profile?.role === "school_staff";
  
  // Legacy compatibility (for gradual migration)
  const isAdmin = isSuperAdmin || isPlatformAdmin || isSupportAdmin;
  
  // Admin type checking
  const isAdminType = authState.profile?.admin_type !== null;
  const isSchoolLevel = isSchoolAdmin || isSchoolStaff;
  
  // Panel access checking
  const canAccessAdminPanel = isSuperAdmin || isPlatformAdmin || isSupportAdmin;
  const canAccessSchoolPanel = isSchoolAdmin || isSchoolStaff;
  
  // Permission checking
  const hasRole = (role: UserRole) => authState.profile?.role === role;
  const hasAnyRole = (roles: UserRole[]) => roles.includes(authState.profile?.role as UserRole);
  const hasHigherRoleThan = (role: UserRole) => {
    if (!authState.profile?.role) return false;
    const roleHierarchy = {
      super_admin: 5,
      platform_admin: 4,
      support_admin: 3,
      school_admin: 2,
      school_staff: 1,
    };
    return roleHierarchy[authState.profile.role] >= roleHierarchy[role];
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    hasProfile,
    
    // New role checking functions
    isSuperAdmin,
    isPlatformAdmin,
    isSupportAdmin,
    isSchoolAdmin,
    isSchoolStaff,
    
    // Legacy compatibility
    isAdmin,
    
    // Admin type checking
    isAdminType,
    isSchoolLevel,
    
    // Panel access
    canAccessAdminPanel,
    canAccessSchoolPanel,
    
    // Permission checking
    hasRole,
    hasAnyRole,
    hasHigherRoleThan,
  };
}