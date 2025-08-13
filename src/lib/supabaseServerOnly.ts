import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

// Server-side Supabase client for use in server components
export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};

// Middleware Supabase client for use in middleware
export const createMiddlewareSupabaseClient = (
  req: NextRequest,
  res: NextResponse
) => {
  return createMiddlewareClient({ req, res });
};
