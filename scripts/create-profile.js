// Script to create a user profile
// Run this in your Supabase SQL editor or use it as a reference

// First, you need to get your user ID from the auth.users table
// Go to your Supabase dashboard > Authentication > Users
// Copy the UUID of your user

// Then run this SQL (replace YOUR_USER_ID_HERE with the actual UUID):

/*
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
  '37bb895f-c8b4-47eb-8279-e46ade78c300', 
  'Your First Name',
  'Your Last Name',
  'super_admin',
  'super_admin',
  '+1234567890',
  true,
  '{"all_permissions": true}'
);
*/

// Alternative: You can also run this to see all users and their IDs:
/*
SELECT 
  id,
  email,
  created_at
FROM auth.users;
*/

// And this to see if profiles exist:
/*
SELECT * FROM profiles;
*/
