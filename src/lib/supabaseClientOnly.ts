import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Client-side Supabase client for use in client components
export const createClient = () => {
  return createClientComponentClient();
};
