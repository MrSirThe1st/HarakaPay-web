// Shared authentication middleware for API routes
// Eliminates duplicate auth code across 70+ routes

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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
 * Production-ready with @supabase/ssr and Next.js 16
 *
 * @param options - Authentication options
 * @param request - Required Request object for cookie access
 * @returns AuthResult with user, profile, and adminClient, or NextResponse error
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const authResult = await authenticateRequest({
 *     requiredRoles: ['school_admin', 'school_staff'],
 *     requireSchool: true
 *   }, request);
 *
 *   if (authResult instanceof NextResponse) {
 *     return authResult; // Error response
 *   }
 *
 *   const { user, profile, adminClient } = authResult;
 *   // Continue with authenticated logic...
 * }
 * ```
 */
export async function authenticateRequest(
  options: AuthOptions = {},
  request: Request
): Promise<AuthResult | NextResponse> {
  const {
    requiredRoles = [],
    requireSchool = false,
    requireActive = true
  } = options;

  try {
    let user: User | null = null;
    let authError: unknown = null;

    // Step 1: Try Authorization header first (for mobile apps)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const adminClient = createAdminClient();
      const { data, error } = await adminClient.auth.getUser(token);
      user = data.user;
      authError = error;
    }

    // Step 2: Fall back to cookie-based auth (for web)
    if (!user) {
      // Parse cookies from Request header
      const cookieHeader = request.headers.get('cookie') || '';
      const cookies = new Map<string, string>();

      cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        if (name && rest.length > 0) {
          cookies.set(name, rest.join('='));
        }
      });

      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookies.get(name);
            },
            set() {
              // No-op: cookies are set via response headers in middleware
            },
            remove() {
              // No-op: cookies are removed via response headers
            },
          },
        }
      );

      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }

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
