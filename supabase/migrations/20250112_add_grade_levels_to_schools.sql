-- Add grade_levels column to schools table
-- This stores the grade values (e.g., ['primaire-1', 'primaire-2']) that the school offers

ALTER TABLE schools
ADD COLUMN IF NOT EXISTS grade_levels TEXT[] DEFAULT '{}';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_schools_grade_levels ON schools USING GIN (grade_levels);

-- Add comment for documentation
COMMENT ON COLUMN schools.grade_levels IS 'Array of grade level values from CONGOLESE_GRADES (e.g., primaire-1, humanites-2). Set during school creation and editable in school settings.';
