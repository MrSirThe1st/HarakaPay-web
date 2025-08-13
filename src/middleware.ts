// Middleware for auth checks will go here
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Example: simple auth redirect
  const token = req.cookies.get("sb-access-token"); // Supabase token if used
  const url = req.nextUrl.clone();

  if (!token && url.pathname.startsWith("/students")) {
    // redirect unauthenticated users to login
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Optional: specify which paths this middleware runs on
export const config = {
  matcher: ["/students/:path*", "/payments/:path*", "/reports/:path*", "/settings/:path*"],
};
