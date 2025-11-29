-- Add or update check constraint for students.level column
-- This ensures level values match the Congolese education system levels

-- Drop existing constraint if it exists
ALTER TABLE students
DROP CONSTRAINT IF EXISTS students_level_check;

-- Add check constraint for level
-- Valid levels: Maternelle, Primaire, Éducation de Base, Humanités, Université
ALTER TABLE students
ADD CONSTRAINT students_level_check
CHECK (level IS NULL OR level IN (
  'Maternelle',
  'Primaire',
  'Éducation de Base',
  'Humanités',
  'Université'
));

-- Add comment for documentation
COMMENT ON COLUMN students.level IS 'Education level: Maternelle, Primaire, Éducation de Base, Humanités, or Université';

