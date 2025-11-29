-- Add health and guardian information fields to students table
-- This includes personal info, medical data, and guardian relationship details

-- Add new columns to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS home_address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS guardian_relationship TEXT,
ADD COLUMN IF NOT EXISTS chronic_conditions TEXT[];

-- Add check constraint for blood type
ALTER TABLE students
ADD CONSTRAINT check_blood_type
CHECK (blood_type IS NULL OR blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));

-- Add check constraint for guardian relationship
ALTER TABLE students
ADD CONSTRAINT check_guardian_relationship
CHECK (guardian_relationship IS NULL OR guardian_relationship IN (
  'mother', 'father', 'guardian', 'uncle', 'aunt',
  'grandmother', 'grandfather', 'sibling', 'other'
));

-- Add comments for documentation
COMMENT ON COLUMN students.home_address IS 'Student home address';
COMMENT ON COLUMN students.date_of_birth IS 'Student date of birth';
COMMENT ON COLUMN students.blood_type IS 'Student blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)';
COMMENT ON COLUMN students.allergies IS 'Array of allergies (e.g., peanuts, latex, penicillin)';
COMMENT ON COLUMN students.guardian_relationship IS 'Relationship of parent/guardian to student (mother, father, uncle, etc.)';
COMMENT ON COLUMN students.chronic_conditions IS 'Array of chronic conditions (e.g., asthma, epilepsy, diabetes)';
