-- Fix debug_user_context function to only look in profiles table
-- The function was incorrectly trying to access parents.school_id which doesn't exist

-- Drop the existing function
DROP FUNCTION IF EXISTS public.debug_user_context();

-- Create the corrected function
CREATE OR REPLACE FUNCTION public.debug_user_context()
RETURNS TABLE(
  current_user_id uuid,
  user_role text,
  school_id uuid,
  is_parent boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as current_user_id,
    COALESCE(p.role, 'unauthenticated') as user_role,
    p.school_id,
    (p.role = 'parent') as is_parent
  FROM public.profiles p
  WHERE p.user_id = auth.uid() 
  AND p.is_active = true;
  
  -- If no profile found, return null values
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      auth.uid() as current_user_id,
      'unauthenticated'::text as user_role,
      NULL::uuid as school_id,
      false as is_parent;
  END IF;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.debug_user_context() TO postgres, anon, authenticated, service_role;
