-- Fix infinite recursion in profiles table RLS policies
-- The error suggests there's a recursive policy causing infinite loops

-- Check and fix profiles table policies
-- Drop any potentially problematic policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;

-- Create simple, non-recursive policies for profiles
-- Only allow users to read their own profile
CREATE POLICY "profiles_select_own_simple" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only allow users to update their own profile
CREATE POLICY "profiles_update_own_simple" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only allow users to insert their own profile
CREATE POLICY "profiles_insert_own_simple" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

