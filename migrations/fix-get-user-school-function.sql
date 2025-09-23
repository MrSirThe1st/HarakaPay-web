-- Fix get_user_school function to only look in profiles table
-- The function was incorrectly trying to access parents.school_id which doesn't exist

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_user_school(uuid);

-- Create the corrected function
CREATE OR REPLACE FUNCTION public.get_user_school(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only look in profiles table since parents don't have school_id
  RETURN (
    SELECT school_id 
    FROM public.profiles 
    WHERE profiles.user_id = get_user_school.user_id 
    AND profiles.is_active = true
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_school(uuid) TO postgres, anon, authenticated, service_role;
