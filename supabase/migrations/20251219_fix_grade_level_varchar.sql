-- Migration: Fix grade_level column length in fee_structures
-- Date: 2025-12-19
-- Issue: VARCHAR(50) too short for comma-separated multiple grade levels

-- Increase grade_level column size to accommodate multiple grades
ALTER TABLE fee_structures
ALTER COLUMN grade_level TYPE VARCHAR(255);

-- Add helpful comment
COMMENT ON COLUMN fee_structures.grade_level IS 'Grade level(s) this fee structure applies to. Can be comma-separated for multiple grades (e.g., "Primaire 1,Primaire 2,Primaire 3")';