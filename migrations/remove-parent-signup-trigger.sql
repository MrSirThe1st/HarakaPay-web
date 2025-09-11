-- Remove the parent signup trigger since we're now using manual profile creation
-- This approach is more reliable and follows the same pattern as admin creation

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verify removal
SELECT 
  'Trigger removed' as status,
  CASE WHEN NOT EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
       THEN 'YES' ELSE 'NO' END as result
UNION ALL
SELECT 
  'Function removed' as status,
  CASE WHEN NOT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') 
       THEN 'YES' ELSE 'NO' END as result;
