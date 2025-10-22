-- Fix for fee_structures and payment_plans created_by foreign key constraints
-- This makes created_by nullable to avoid constraint violations

-- Fix fee_structures table
ALTER TABLE fee_structures DROP CONSTRAINT IF EXISTS fee_structures_created_by_fkey;
ALTER TABLE fee_structures ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE fee_structures 
ADD CONSTRAINT fee_structures_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix payment_plans table
ALTER TABLE payment_plans DROP CONSTRAINT IF EXISTS payment_plans_created_by_fkey;
ALTER TABLE payment_plans ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE payment_plans 
ADD CONSTRAINT payment_plans_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
