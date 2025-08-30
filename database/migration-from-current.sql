-- Migration Script: From Current Structure to New Structure
-- This script helps migrate your existing data to the new schema

-- WARNING: This will drop your existing tables and recreate them
-- Make sure to backup your data before running this script

-- Step 1: Backup existing data (if any)
-- You can export your current data using Supabase dashboard or pg_dump

-- Step 2: Drop existing tables (this will delete all data)
DROP TABLE IF EXISTS parent_students CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS payment_settings CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Step 3: Drop existing functions and triggers
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 4: Now run the complete setup
-- Copy and paste the contents of setup-complete.sql here
-- OR run it separately

-- Step 5: Apply RLS policies
-- Copy and paste the contents of rls-policies.sql here
-- OR run it separately

-- Step 6: Create your super admin user
-- Update the seed-super-admin.sql file with your user ID and run it

-- Alternative: If you want to preserve some data, you can:

-- 1. Create temporary tables to store existing data
-- CREATE TEMP TABLE temp_profiles AS SELECT * FROM profiles;
-- CREATE TEMP TABLE temp_schools AS SELECT * FROM schools;
-- CREATE TEMP TABLE temp_students AS SELECT * FROM students;
-- CREATE TEMP TABLE temp_payments AS SELECT * FROM payments;

-- 2. Run the new schema creation

-- 3. Migrate data with transformations
-- INSERT INTO profiles (user_id, first_name, last_name, role, admin_type, school_id, phone, avatar_url, created_at, updated_at)
-- SELECT 
--   user_id,
--   first_name,
--   last_name,
--   CASE 
--     WHEN role = 'admin' THEN 'super_admin'
--     ELSE 'school_staff'
--   END as role,
--   CASE 
--     WHEN role = 'admin' THEN 'super_admin'
--     ELSE NULL
--   END as admin_type,
--   school_id,
--   phone,
--   avatar_url,
--   created_at,
--   updated_at
-- FROM temp_profiles;

-- 4. Clean up temp tables
-- DROP TABLE temp_profiles;
-- DROP TABLE temp_schools;
-- DROP TABLE temp_students;
-- DROP TABLE temp_payments;

-- Note: The migration approach depends on whether you have important data to preserve
-- If this is a fresh setup, the simple drop-and-recreate approach is recommended
