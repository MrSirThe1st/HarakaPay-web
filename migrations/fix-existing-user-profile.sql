-- Fix existing user who doesn't have a profile yet
-- This handles the user b0d34513-4b2c-4562-b5b1-043c045870cd who is getting "No parent profile found" errors

-- First, let's check if the user exists in auth.users and get their metadata
-- Then create a profile for them

INSERT INTO public.profiles (
  id,
  user_id,
  first_name,
  last_name,
  email,
  phone,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  au.id,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  au.email,
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  'parent',
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.id = 'b0d34513-4b2c-4562-b5b1-043c045870cd'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = au.id
  );
