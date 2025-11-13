// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
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
      const { data: { session: cookieSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth error in middleware:', error);
        // Only redirect non-API routes
        if (!pathname.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/login', req.url));
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      session = cookieSession;
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
          console.log('User account is inactive:', session.user.id);
          return NextResponse.redirect(new URL('/login', req.url));
        }
        
        // Check if user has required role
        if (!userRole || !requiredRoles.includes(userRole)) {
          console.log(`Access denied: User role '${userRole}' not in required roles [${requiredRoles.join(', ')}]`);
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        // Only log access on first visit or cache miss (not on every navigation)
        const cached = profileCache.get(session.user.id);
        if (!cached || (Date.now() - cached.timestamp) < 1000) { // Log only if just fetched
          console.log(`Access granted: User ${session.user.id} with role '${userRole}' accessing ${pathname}`);
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