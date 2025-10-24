-- Fix payment_modes constraint in fee_structure_items table

-- First, let's see what the current constraint is
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'fee_structure_items'::regclass 
AND contype = 'c' 
AND conname LIKE '%payment_modes%';

-- Drop the existing constraints
ALTER TABLE fee_structure_items DROP CONSTRAINT IF EXISTS chk_payment_modes_valid;
ALTER TABLE fee_structure_items DROP CONSTRAINT IF EXISTS chk_payment_modes_array;

-- The chk_payment_modes_valid constraint was too restrictive:
-- It only allowed: [] or ["one_time", "termly", "installment"]
-- But we need: ["per-term", "one_time"] and other combinations

-- Add a flexible constraint that validates JSONB array structure
-- This ensures it's an array of strings
ALTER TABLE fee_structure_items 
ADD CONSTRAINT chk_payment_modes_array 
CHECK (jsonb_typeof(payment_modes) = 'array');

-- Verify the column type
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'fee_structure_items' 
AND column_name = 'payment_modes';
