import { createClient } from "@supabase/supabase-js";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest, NextResponse } from "next/server";

// Admin client - bypasses ALL RLS policies
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error("Missing Supabase service role key or URL in environment variables.");
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Regular client for authentication only
export const createServerAuthClient = () => {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!anonKey || !supabaseUrl) {
    throw new Error("Missing Supabase anon key or URL in environment variables.");
  }
  
  return createClient(supabaseUrl, anonKey);
};

// Keep for compatibility - but now it uses admin client
export const createServerClient = createAdminClient;

// Middleware client (unchanged)
export const createMiddlewareSupabaseClient = (
  req: NextRequest,
  res: NextResponse
) => {
  return createMiddlewareClient({ req, res });
};
