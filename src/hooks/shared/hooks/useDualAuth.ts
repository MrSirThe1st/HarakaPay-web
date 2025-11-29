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

  // Initialize auth state with session refresh support
  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout | null = null;

    async function initializeAuth() {
      try {
        // SECURITY: Use getUser() instead of getSession() to validate with server
        const { data: { user: validatedUser }, error: sessionError } = await supabase.auth.getUser();

        if (sessionError || !validatedUser) {
          // Only log actual errors, not missing sessions (expected on login page)
          if (sessionError && sessionError.message !== 'Auth session missing!') {
            console.error('Session error:', sessionError);
          }
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
          return;
        }

        // User is validated by server
        const profile = await fetchUserProfile(validatedUser.id);

        if (mounted) {
          setAuthState({
            user: validatedUser,
            profile,
            loading: false,
            error: null,
          });
        }

        // Set up automatic session refresh (refresh every 50 minutes)
        refreshInterval = setTimeout(async () => {
          if (mounted) {
            const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
            if (!refreshError && refreshedUser) {
              const profile = await fetchUserProfile(refreshedUser.id);
              if (mounted) {
                setAuthState({
                  user: refreshedUser,
                  profile,
                  loading: false,
                  error: null,
                });
              }
            }
          }
        }, 50 * 60 * 1000); // Refresh every 50 minutes

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

    // Listen for auth changes including token refresh events
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
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Handle token refresh - update state if needed
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setAuthState(prev => ({
              ...prev,
              user: session.user,
              profile,
            }));
          }
        } else if (event === 'SIGNED_OUT') {
          if (refreshInterval) {
            clearTimeout(refreshInterval);
          }
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
      if (refreshInterval) {
        clearTimeout(refreshInterval);
      }
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, supabase.auth]);

  // Sign in function with persistent session support
  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Ensure session persists - always set the session explicitly
      // This ensures the refresh token is properly stored
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

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

  // Sign out function - clears session and preferences
  const signOut = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const scope = data.session ? 'global' : 'local';
      
      const { error } = await supabase.auth.signOut({ scope });
      if (error) {
        // Supabase throws AuthSessionMissingError when the refresh token has
        // already been cleared (e.g. multiple tabs); fall back to local scope.
        if (error.message?.toLowerCase().includes('auth session missing')) {
          await supabase.auth.signOut({ scope: 'local' });
        } else {
          console.error('Sign out error:', error);
        }
      }
    } catch (error) {
      console.error('Sign out exception:', error);
    }
    
    // Clear session preferences on sign out
    if (typeof window !== 'undefined') {
      try {
        const { clearSessionPreferences } = await import('@/lib/sessionStorage');
        clearSessionPreferences();
      } catch (error) {
        console.error('Error clearing session preferences:', error);
      }
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