-- Fix applies_to constraint to allow any string value, not just 'school' or 'class'

-- First, let's see what the current constraint is
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'fee_structures'::regclass 
AND contype = 'c' 
AND conname LIKE '%applies_to%';

-- Drop the existing constraint
ALTER TABLE fee_structures DROP CONSTRAINT IF EXISTS fee_structures_applies_to_check;

-- The constraint was likely restricting applies_to to only 'school' or 'class'
-- But we want to allow any string value (like grade levels)
-- Since applies_to is VARCHAR, we don't need a check constraint for this

-- Verify the column type
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'fee_structures' 
AND column_name = 'applies_to';
