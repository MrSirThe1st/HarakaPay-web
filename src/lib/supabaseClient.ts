import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// Client-side Supabase client for use in client components (App Router)
// Uses @supabase/ssr with default browser storage (localStorage for refresh tokens)
// This is the official Supabase recommendation for Next.js App Router client components
//
// SECURITY:
// - Access tokens: In-memory, auto-refresh every hour
// - Refresh tokens: Browser localStorage (protected by CSP headers)
// - Session persists across browser restarts
// - XSS protection via Content Security Policy in middleware
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
