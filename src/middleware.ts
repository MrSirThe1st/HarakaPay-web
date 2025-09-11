// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth',
  '/api/parent',
  '/api/test',
];

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['super_admin', 'platform_admin', 'support_admin'],
  '/school': ['school_admin', 'school_staff'],
  '/api/admin': ['super_admin', 'platform_admin', 'support_admin'],
};

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
    // Get the session using middleware client
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Auth error in middleware:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If no session, redirect to login for protected routes
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check role-based access for protected routes
    for (const [route, requiredRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && requiredRoles.length > 0) {
        
        try {
          // Use admin client to get profile (bypasses RLS) - THIS IS THE FIX
          const adminClient = createAdminClient();
          const { data: profile, error: profileError } = await adminClient
            .from('profiles')
            .select('role, is_active')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error in middleware:', profileError);
            return NextResponse.redirect(new URL('/login', req.url));
          }

          const userRole = profile?.role;
          
          // Check if user is active
          if (!profile?.is_active) {
            console.log('User account is inactive:', session.user.id);
            return NextResponse.redirect(new URL('/login', req.url));
          }
          
          // Check if user has required role
          if (!userRole || !requiredRoles.includes(userRole)) {
            console.log(`Access denied: User role '${userRole}' not in required roles [${requiredRoles.join(', ')}]`);
            return NextResponse.redirect(new URL('/unauthorized', req.url));
          }

          // Log successful access for debugging
          console.log(`Access granted: User ${session.user.id} with role '${userRole}' accessing ${pathname}`);
          
        } catch (profileError) {
          console.error('Unexpected error fetching profile in middleware:', profileError);
          return NextResponse.redirect(new URL('/login', req.url));
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