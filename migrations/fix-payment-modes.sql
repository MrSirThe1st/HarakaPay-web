-- Fix payment_mode to support multiple options
-- Change from ENUM to JSONB array to allow multiple payment modes

-- Add new payment_modes JSONB column
ALTER TABLE fee_structure_items 
ADD COLUMN payment_modes JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data from payment_mode to payment_modes
UPDATE fee_structure_items 
SET payment_modes = jsonb_build_array(payment_mode)
WHERE payment_mode IS NOT NULL;

-- Add constraint to ensure payment_modes is an array
ALTER TABLE fee_structure_items 
ADD CONSTRAINT chk_payment_modes_array 
CHECK (jsonb_typeof(payment_modes) = 'array');

-- Add constraint to ensure valid payment mode values
ALTER TABLE fee_structure_items 
ADD CONSTRAINT chk_payment_modes_valid 
CHECK (
  payment_modes = '[]'::jsonb OR 
  payment_modes <@ '["one_time", "termly", "installment"]'::jsonb
);

-- Drop the old payment_mode column (after confirming migration worked)
-- ALTER TABLE fee_structure_items DROP COLUMN payment_mode;
