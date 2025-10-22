"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { hasRoleLevel, type UserRole } from "@/lib/roleUtils";
import { apiCache, createCacheKey, cachedApiCall } from "@/lib/apiCache";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  admin_type: string | null;
  school_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  permissions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: { id: string; email?: string; name?: string } | null; 
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
  const supabase = createClient(); // Regular client for auth only

  // Fetch user profile using server-side API with caching
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      // Use cached API call to prevent duplicate requests
      const profile = await cachedApiCall(
        createCacheKey('auth:profile', { userId }),
        async () => {
          const response = await fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Profile API error:', errorData);
            throw new Error(`Failed to fetch profile: ${errorData.error || response.statusText}`);
          }
          
          const { profile } = await response.json();
          return profile;
        }
      );
      
      return profile;
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          
          if (mounted) {
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: null,
            });
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: 'Failed to initialize authentication',
          });
        }
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: null,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, supabase.auth]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    router.push('/login');
  };

  // Memoized role checking functions to prevent unnecessary re-renders
  const roleChecks = useMemo(() => {
    const profile = authState.profile;
    const isSuperAdmin = profile?.role === "super_admin";
    const isPlatformAdmin = profile?.role === "platform_admin";
    const isSupportAdmin = profile?.role === "support_admin";
    const isSchoolAdmin = profile?.role === "school_admin";
    const isSchoolStaff = profile?.role === "school_staff";
    
    // Panel access checking
    const canAccessAdminPanel = isSuperAdmin || isPlatformAdmin || isSupportAdmin;
    const canAccessSchoolPanel = isSchoolAdmin || isSchoolStaff;
    
    // Authentication status
    const isAuthenticated = !!authState.user && !!profile;

    return {
      isSuperAdmin,
      isPlatformAdmin,
      isSupportAdmin,
      isSchoolAdmin,
      isSchoolStaff,
      canAccessAdminPanel,
      canAccessSchoolPanel,
      isAuthenticated
    };
  }, [authState.profile, authState.user]);

  // Memoized permission checking functions
  const permissionChecks = useMemo(() => ({
    hasRole: (role: UserRole) => authState.profile?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(authState.profile?.role as UserRole),
    hasHigherRoleThan: (role: UserRole) => {
      if (!authState.profile?.role) return false;
      return hasRoleLevel(authState.profile.role, role);
    }
  }), [authState.profile?.role]);

  return {
    ...authState,
    signIn,
    signOut,
    
    // Spread memoized role checks
    ...roleChecks,
    
    // Spread memoized permission checks
    ...permissionChecks,
  };
}