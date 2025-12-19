-- Fix VARCHAR(50) constraint on fee_structures.grade_level
-- This allows storing multiple grade levels joined by commas

ALTER TABLE fee_structures
ALTER COLUMN grade_level TYPE VARCHAR(255);

-- Optional: Add a comment
COMMENT ON COLUMN fee_structures.grade_level IS 'Grade level(s) this fee structure applies to. Can be comma-separated for multiple grades.';