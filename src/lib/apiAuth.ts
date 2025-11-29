// Shared authentication middleware for API routes
// Eliminates duplicate auth code across 70+ routes

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  role: string;
  school_id?: string | null;
  is_active: boolean;
  [key: string]: unknown;
}

interface AuthResult {
  user: User;
  profile: UserProfile;
  adminClient: ReturnType<typeof createAdminClient>;
}

interface AuthOptions {
  requiredRoles?: string[];
  requireSchool?: boolean;
  requireActive?: boolean;
}

/**
 * Authenticates API requests and returns user + profile
 *
 * @param options - Authentication options
 * @returns AuthResult with user, profile, and adminClient, or NextResponse error
 *
 * @example
 * ```typescript
 * const authResult = await authenticateRequest({
 *   requiredRoles: ['school_admin', 'school_staff'],
 *   requireSchool: true
 * });
 *
 * if (authResult instanceof NextResponse) {
 *   return authResult; // Error response
 * }
 *
 * const { user, profile, adminClient } = authResult;
 * // Continue with authenticated logic...
 * ```
 */
export async function authenticateRequest(
  options: AuthOptions = {}
): Promise<AuthResult | NextResponse> {
  const {
    requiredRoles = [],
    requireSchool = false,
    requireActive = true
  } = options;

  try {
    // Step 1: Authenticate user
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Cookie setting might fail in some contexts (e.g., after response sent)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            } catch {
              // Cookie removal might fail in some contexts
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Step 2: Get user profile
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Step 3: Check if account is active (if required)
    if (requireActive && !profile.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account inactive' },
        { status: 403 }
      );
    }

    // Step 4: Check role permissions (if specified)
    if (requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unauthorized. Required roles: ${requiredRoles.join(', ')}`
        },
        { status: 403 }
      );
    }

    // Step 5: Check school assignment (if required)
    if (requireSchool && !profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'No school assigned to this account' },
        { status: 400 }
      );
    }

    // Success - return authenticated context
    return {
      user,
      profile: profile as UserProfile,
      adminClient
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper to check if auth result is an error response
 */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
