import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected dashboard routes
  const isDashboardRoute =
    req.nextUrl.pathname.startsWith("/students") ||
    req.nextUrl.pathname.startsWith("/payments") ||
    req.nextUrl.pathname.startsWith("/reports") ||
    req.nextUrl.pathname.startsWith("/settings");

  // If accessing a dashboard route without authentication, redirect to login
  if (isDashboardRoute && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated and trying to access login/register, redirect to dashboard
  if (
    session &&
    (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")
  ) {
    const redirectTo = req.nextUrl.searchParams.get("redirectTo");
    const redirectUrl = new URL(redirectTo || "/students", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control
  if (isDashboardRoute && session) {
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
      return NextResponse.redirect(new URL("/students", req.url));
    }

    if (
      req.nextUrl.pathname.startsWith("/settings") &&
      profile?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/students", req.url));
    }

    // Block access if user doesn't have admin or school_staff role
    if (profile?.role !== "admin" && profile?.role !== "school_staff") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
