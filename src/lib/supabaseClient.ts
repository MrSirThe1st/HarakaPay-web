import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Client-side Supabase client for use in client components
// Configured for persistent sessions with automatic token refresh
export const createClient = () => {
  return createClientComponentClient({
    cookieOptions: {
      // Configure cookie options for persistent sessions
      name: 'sb-auth-token',
      domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Use default domain
      maxAge: 60 * 60 * 24 * 7, // 7 days for refresh token
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    },
  });
};
