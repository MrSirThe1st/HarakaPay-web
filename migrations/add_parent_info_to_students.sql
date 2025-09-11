-- Migration: Add parent information columns to students table
-- This migration adds parent_name, parent_phone, and parent_email columns to the students table

-- Add the new columns to the students table
ALTER TABLE students 
ADD COLUMN parent_name TEXT,
ADD COLUMN parent_phone TEXT,
ADD COLUMN parent_email TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN students.parent_name IS 'Full name of the student''s parent or guardian';
COMMENT ON COLUMN students.parent_phone IS 'Phone number of the student''s parent or guardian';
COMMENT ON COLUMN students.parent_email IS 'Email address of the student''s parent or guardian';

-- Create an index on parent_email for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email);

-- Create an index on parent_phone for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone);
