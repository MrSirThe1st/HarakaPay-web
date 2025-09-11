-- Simple migration to add parent information to students table
-- Run this in your Supabase SQL Editor

-- Add parent information columns to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS parent_name TEXT,
ADD COLUMN IF NOT EXISTS parent_phone TEXT,
ADD COLUMN IF NOT EXISTS parent_email TEXT;

-- Add helpful comments
COMMENT ON COLUMN students.parent_name IS 'Full name of the student''s parent or guardian';
COMMENT ON COLUMN students.parent_phone IS 'Phone number of the student''s parent or guardian';
COMMENT ON COLUMN students.parent_email IS 'Email address of the student''s parent or guardian';

