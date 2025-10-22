-- Comprehensive fix for ALL created_by foreign key constraints
-- This makes created_by nullable for all tables to avoid constraint violations

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

-- Fix student_fee_assignments table (if it has created_by)
ALTER TABLE student_fee_assignments DROP CONSTRAINT IF EXISTS student_fee_assignments_created_by_fkey;
ALTER TABLE student_fee_assignments ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE student_fee_assignments 
ADD CONSTRAINT student_fee_assignments_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix student_fee_payments table (if it has created_by)
ALTER TABLE student_fee_payments DROP CONSTRAINT IF EXISTS student_fee_payments_created_by_fkey;
ALTER TABLE student_fee_payments ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE student_fee_payments 
ADD CONSTRAINT student_fee_payments_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix fee_adjustments table (if it has created_by)
ALTER TABLE fee_adjustments DROP CONSTRAINT IF EXISTS fee_adjustments_created_by_fkey;
ALTER TABLE fee_adjustments ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE fee_adjustments 
ADD CONSTRAINT fee_adjustments_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix fee_audit_trail table (if it has created_by)
ALTER TABLE fee_audit_trail DROP CONSTRAINT IF EXISTS fee_audit_trail_created_by_fkey;
ALTER TABLE fee_audit_trail ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE fee_audit_trail 
ADD CONSTRAINT fee_audit_trail_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix any other tables that might have created_by constraints
-- Check for any remaining created_by foreign key constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find all foreign key constraints on created_by columns
    FOR constraint_record IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'created_by'
            AND tc.table_schema = 'public'
    LOOP
        -- Drop the constraint
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, 
                      constraint_record.constraint_name);
        
        -- Make the column nullable
        EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP NOT NULL', 
                      constraint_record.table_name, 
                      constraint_record.column_name);
        
        -- Re-add the constraint with ON DELETE SET NULL
        EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES profiles(id) ON DELETE SET NULL', 
                      constraint_record.table_name, 
                      constraint_record.constraint_name,
                      constraint_record.column_name);
        
        RAISE NOTICE 'Fixed constraint % on table %', constraint_record.constraint_name, constraint_record.table_name;
    END LOOP;
END $$;
