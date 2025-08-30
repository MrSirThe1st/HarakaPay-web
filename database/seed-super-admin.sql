-- Seed Super Admin User
-- This creates the initial super admin account as specified in POLICIES-AND-STRUCTURE.md

-- Insert the super admin profile
-- Note: You'll need to replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users
-- You can get this by creating a user in the Supabase Auth dashboard first

INSERT INTO profiles (
  user_id,
  first_name,
  last_name,
  role,
  admin_type,
  phone,
  is_active,
  permissions
) VALUES (
  '6a0f9c9b-8369-4006-9112-8469ab0f2479', 
  'Marc',
  'Mbuyu',
  'super_admin',
  'super_admin',
  '+27681609849',
  true,
  '{"all_permissions": true}'
);

-- You can also create a second super admin if needed
-- INSERT INTO profiles (
--   user_id,
--   first_name,
--   last_name,
--   role,
--   admin_type,
--   phone,
--   is_active,
--   permissions
-- ) VALUES (
--   'SECOND_USER_ID_HERE',
--   'Second',
--   'SuperAdmin',
--   'super_admin',
--   'super_admin',
--   '+1234567891',
--   true,
--   '{"all_permissions": true}'
-- );
