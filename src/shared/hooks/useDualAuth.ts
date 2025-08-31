"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { hasRoleLevel, type UserRole } from "@/lib/roleUtils";

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

  // Fetch user profile using server-side API (no RLS issues)
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      // Use server-side API to get profile (bypasses RLS)
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

  // Role checking functions - now safe because they don't query database
  const isSuperAdmin = authState.profile?.role === "super_admin";
  const isPlatformAdmin = authState.profile?.role === "platform_admin";
  const isSupportAdmin = authState.profile?.role === "support_admin";
  const isSchoolAdmin = authState.profile?.role === "school_admin";
  const isSchoolStaff = authState.profile?.role === "school_staff";
  
  // Panel access checking
  const canAccessAdminPanel = isSuperAdmin || isPlatformAdmin || isSupportAdmin;
  const canAccessSchoolPanel = isSchoolAdmin || isSchoolStaff;
  
  // Permission checking
  const hasRole = (role: UserRole) => authState.profile?.role === role;
  const hasAnyRole = (roles: UserRole[]) => roles.includes(authState.profile?.role as UserRole);
  const hasHigherRoleThan = (role: UserRole) => {
    if (!authState.profile?.role) return false;
    return hasRoleLevel(authState.profile.role, role);
  };

  // Authentication status
  const isAuthenticated = !!authState.user && !!authState.profile;

  return {
    ...authState,
    signIn,
    signOut,
    
    // Authentication status
    isAuthenticated,
    
    // Role checking functions
    isSuperAdmin,
    isPlatformAdmin,
    isSupportAdmin,
    isSchoolAdmin,
    isSchoolStaff,
    
    // Panel access
    canAccessAdminPanel,
    canAccessSchoolPanel,
    
    // Permission checking
    hasRole,
    hasAnyRole,
    hasHigherRoleThan,
  };
}