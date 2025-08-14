
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

// Server-side Supabase client for use in server components

// Use service role key for admin operations
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error("Missing Supabase service role key or URL in environment variables.");
  }
  return createClient(supabaseUrl, serviceRoleKey);
};

// Middleware Supabase client for use in middleware
export const createMiddlewareSupabaseClient = (
  req: NextRequest,
  res: NextResponse
) => {
  return createMiddlewareClient({ req, res });
};
