-- Fix RLS policies for schools table to prevent infinite recursion
-- The error suggests there's a recursive policy on the profiles table affecting schools queries

-- First, let's check what policies exist on schools table
-- Drop any problematic policies
DROP POLICY IF EXISTS "schools_select_policy" ON public.schools;
DROP POLICY IF EXISTS "schools_public_read" ON public.schools;
DROP POLICY IF EXISTS "schools_read_all" ON public.schools;

-- Create a simple, non-recursive policy for schools
-- Schools should be readable by all authenticated users (parents)
CREATE POLICY "schools_authenticated_read" ON public.schools
  FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anonymous users to read schools (for signup/registration)
CREATE POLICY "schools_anonymous_read" ON public.schools
  FOR SELECT
  TO anon
  USING (status = 'approved');

-- Ensure RLS is enabled
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
