// src/proxy.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

// In-memory cache for user profiles (middleware runs in edge runtime)
interface CachedProfile {
  id: string;
  role: string;
  school_id?: string;
  is_active: boolean;
  [key: string]: unknown;
}
const profileCache = new Map<string, { profile: CachedProfile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth',
  '/api/parent',
  '/api/test',
  '/api/school-registration-requests',
  '/api/payments/simulate-webhook', // Test endpoint for simulating webhooks
  '/api/payments/webhook', // M-Pesa webhook endpoint (called by external service)
];

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['super_admin', 'platform_admin', 'support_admin'],
  '/school': ['school_admin', 'school_staff'],
  '/api/admin': ['super_admin', 'platform_admin', 'support_admin'],
};

// Helper function to get cached profile or fetch from database
async function getCachedProfile(userId: string) {
  const now = Date.now();
  const cached = profileCache.get(userId);

  // Return cached profile if still valid
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.profile;
  }

  // Fetch fresh profile from database
  try {
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, role, is_active')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error in middleware:', profileError);
      return null;
    }

    // Cache the profile
    profileCache.set(userId, { profile, timestamp: now });

    return profile;
  } catch (error) {
    console.error('Unexpected error fetching profile in middleware:', error);
    return null;
  }
}

export async function proxy(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: req,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
          } as any);
          res = NextResponse.next({
            request: req,
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // SECURITY HEADERS
  res.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
  res.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  res.headers.set('Referrer-Policy', 'origin-when-cross-origin'); // Control referrer info
  res.headers.set('X-XSS-Protection', '1; mode=block'); // XSS protection for older browsers

  // Strict Transport Security (HSTS) - force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy - helps prevent XSS attacks
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " + // Note: unsafe-inline/eval needed for Next.js dev
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co; " +
    "frame-ancestors 'none';"
  );

  const { pathname } = req.nextUrl;

  // Debug logging for mobile API requests
  if (pathname.startsWith('/api/parent')) {
    console.log('📱 Mobile API request:', {
      pathname,
      method: req.method,
      hasAuthHeader: !!req.headers.get('authorization'),
      origin: req.headers.get('origin'),
      contentType: req.headers.get('content-type')
    });
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    console.log('✅ Public route allowed:', pathname);
    return res;
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return res;
  }

  try {
    // Check for bearer token auth (for mobile apps)
    const authHeader = req.headers.get('authorization');
    let session = null;

    if (authHeader?.startsWith('Bearer ')) {
      // Extract token from Authorization header
      const token = authHeader.substring(7);
      const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);

      if (!tokenError && user) {
        // Create a session-like object for bearer token auth
        session = { user };
      }
    } else {
      // Fall back to cookie-based session
      // SECURITY: Use getUser() to validate session with Supabase server
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // If auth fails, check if it's a real error or just no session
        if (error && error.message !== 'Session not found') {
          console.error('Auth error in middleware:', error);
        }
        // Only redirect non-API routes
        if (!pathname.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/login', req.url));
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      session = { user };
    }

    // If no session, redirect to login for protected routes
    if (!session) {
      // For API routes, return 401 instead of redirecting
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check role-based access for protected routes
    for (const [route, requiredRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && requiredRoles.length > 0) {

        // Get profile from cache or database
        const profile = await getCachedProfile(session.user.id);

        if (!profile) {
          return NextResponse.redirect(new URL('/login', req.url));
        }

        const userRole = profile.role;

        // Check if user is active
        if (!profile.is_active) {
          return NextResponse.redirect(new URL('/login', req.url));
        }

        // Check if user has required role
        if (!userRole || !requiredRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }
    }

    return res;

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
