-- Add staff-specific fields to profiles table
-- These fields are for school staff members (role = 'school_staff')

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS work_email TEXT,
ADD COLUMN IF NOT EXISTS home_address TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS staff_id TEXT;

-- Add check constraint for gender (M or F, similar to students)
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_profile_gender;

ALTER TABLE profiles
ADD CONSTRAINT check_profile_gender
CHECK (gender IS NULL OR gender IN ('M', 'F'));

-- Add check constraint for position/title
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_staff_position;

ALTER TABLE profiles
ADD CONSTRAINT check_staff_position
CHECK (
  position IS NULL 
  OR role != 'school_staff' 
  OR position IN ('teacher', 'principal', 'nurse', 'security', 'cashier', 'prefect')
);

-- Add unique constraint for staff_id (only for school_staff role)
-- Note: We'll use a partial unique index since staff_id should only be unique within school_staff role
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_staff_id_unique 
ON profiles (staff_id) 
WHERE role = 'school_staff' AND staff_id IS NOT NULL;

-- Add index for faster lookups by staff_id
CREATE INDEX IF NOT EXISTS idx_profiles_staff_id 
ON profiles (staff_id) 
WHERE staff_id IS NOT NULL;

-- Add index for position filtering
CREATE INDEX IF NOT EXISTS idx_profiles_position 
ON profiles (position) 
WHERE position IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.gender IS 'Staff gender: M (Male) or F (Female)';
COMMENT ON COLUMN profiles.work_email IS 'Work email address (separate from auth email)';
COMMENT ON COLUMN profiles.home_address IS 'Staff home address';
COMMENT ON COLUMN profiles.position IS 'Staff position/title: teacher, principal, nurse, security, cashier, prefect';
COMMENT ON COLUMN profiles.staff_id IS 'Unique staff ID for school staff members';

