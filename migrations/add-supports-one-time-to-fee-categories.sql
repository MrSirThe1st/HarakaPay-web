-- Add supports_one_time field to fee_categories table
-- This field will track whether a fee category supports one-time payments

ALTER TABLE fee_categories 
ADD COLUMN supports_one_time BOOLEAN DEFAULT true;

-- Update existing records to have supports_one_time = true by default
-- (since most fees should support one-time payments)
UPDATE fee_categories 
SET supports_one_time = true 
WHERE supports_one_time IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE fee_categories 
ALTER COLUMN supports_one_time SET NOT NULL;

-- Add a comment to document the field
COMMENT ON COLUMN fee_categories.supports_one_time IS 'Indicates whether this fee category supports one-time payments';
