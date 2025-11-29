-- Add gender field to students table
-- Gender can be M (Male) or F (Female)

-- Add gender column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add check constraint for gender
ALTER TABLE students
ADD CONSTRAINT check_gender
CHECK (gender IS NULL OR gender IN ('M', 'F'));

-- Add comment for documentation
COMMENT ON COLUMN students.gender IS 'Student gender: M (Male) or F (Female)';