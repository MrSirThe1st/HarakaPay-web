import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to check predefined admin from cookies
function isPredefinedAdminAuthenticated(req: NextRequest): boolean {
  // Check if there's a predefined admin token in cookies
  const predefinedAdminCookie = req.cookies.get("predefined_admin");
  if (predefinedAdminCookie) {
    try {
      const adminData = JSON.parse(predefinedAdminCookie.value);
      return adminData && adminData.isPredefined === true;
    } catch {
      return false;
    }
  }
  return false;
}


export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if user is authenticated (either Supabase session or predefined admin)
  const hasSupabaseSession = !!session;
  const hasPredefinedAdmin = isPredefinedAdminAuthenticated(req);
  const isAuthenticated = hasSupabaseSession || hasPredefinedAdmin;

  // Protected dashboard routes
  const pathname = req.nextUrl.pathname;
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/students") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/create-school") ||
    pathname.startsWith("/create-admin");
  const isLoginOrRegister =
    pathname === '/login' || pathname === '/register';

  // If accessing a dashboard route without authentication, redirect to login
  if (isDashboardRoute && !isAuthenticated && !isLoginOrRegister) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated and trying to access login/register, redirect to dashboard
  if (
    isAuthenticated && isLoginOrRegister
  ) {
    const redirectTo = req.nextUrl.searchParams.get("redirectTo");
    const redirectUrl = new URL(redirectTo || "/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control for Supabase users
  if (isDashboardRoute && hasSupabaseSession && !hasPredefinedAdmin) {
    // Get user profile to check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    // Only admins can access reports and settings
    if (
      req.nextUrl.pathname.startsWith("/reports") &&
      profile?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      req.nextUrl.pathname.startsWith("/settings") &&
      profile?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Only admins can access create-school and create-admin
    if (
      (req.nextUrl.pathname.startsWith("/create-school") ||
        req.nextUrl.pathname.startsWith("/create-admin")) &&
      profile?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Block access if user doesn't have admin or school_staff role
    if (profile?.role !== "admin" && profile?.role !== "school_staff") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Predefined admins have full access (they are admins by definition)
  // No additional role checking needed for them

  // Add security headers for all requests
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
