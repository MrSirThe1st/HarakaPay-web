-- Add level column to students table for Congolese education system
-- This column will categorize students into the main education levels

ALTER TABLE students 
ADD COLUMN level VARCHAR(50);

-- Add a check constraint to ensure only valid levels are allowed
ALTER TABLE students 
ADD CONSTRAINT students_level_check 
CHECK (level IN ('Primaire', 'Humanités', 'Éducation de Base', 'Enseignement supérieur'));

-- Add a comment to document the column purpose
COMMENT ON COLUMN students.level IS 'Main education level category: Primaire, Humanités, Éducation de Base, or Enseignement supérieur';

-- Optional: Create an index for better query performance
CREATE INDEX idx_students_level ON students(level);

-- Optional: Update existing students based on their current grade_level
-- This will map existing grades to the appropriate level
UPDATE students 
SET level = CASE 
    WHEN grade_level IN ('maternelle-1', 'maternelle-2', 'maternelle-3', 'primaire-1', 'primaire-2', 'primaire-3', 'primaire-4', 'primaire-5', 'primaire-6') 
    THEN 'Primaire'
    WHEN grade_level IN ('base-7', 'base-8') 
    THEN 'Éducation de Base'
    WHEN grade_level IN ('humanites-1', 'humanites-2', 'humanites-3', 'humanites-4') 
    THEN 'Humanités'
    WHEN grade_level IN ('licence-1', 'licence-2', 'licence-3', 'master-1', 'master-2', 'doctorat') 
    THEN 'Enseignement supérieur'
    ELSE NULL
END
WHERE grade_level IS NOT NULL;
