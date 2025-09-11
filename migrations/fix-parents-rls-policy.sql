-- Fix RLS policy for parents table to allow signup
-- The current policy only allows updates, not inserts

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "parents_own_profile" ON public.parents;

-- Create a new policy that allows inserts during signup
CREATE POLICY "parents_insert_own_profile" ON public.parents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a policy for updates (keep existing behavior)
CREATE POLICY "parents_update_own_profile" ON public.parents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a policy for selects (keep existing behavior)
CREATE POLICY "parents_select_own_profile" ON public.parents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
 