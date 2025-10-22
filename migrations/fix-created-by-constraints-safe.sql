-- Safe fix for created_by foreign key constraints
-- Only fixes tables that actually have created_by columns

-- Fix fee_structures table (we know this exists)
ALTER TABLE fee_structures DROP CONSTRAINT IF EXISTS fee_structures_created_by_fkey;
ALTER TABLE fee_structures ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE fee_structures 
ADD CONSTRAINT fee_structures_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix payment_plans table (we know this exists)
ALTER TABLE payment_plans DROP CONSTRAINT IF EXISTS payment_plans_created_by_fkey;
ALTER TABLE payment_plans ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE payment_plans 
ADD CONSTRAINT payment_plans_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix receipt_templates table (we know this exists from the receipts API)
ALTER TABLE receipt_templates DROP CONSTRAINT IF EXISTS receipt_templates_created_by_fkey;
ALTER TABLE receipt_templates ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE receipt_templates 
ADD CONSTRAINT receipt_templates_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Safe dynamic fix for any other tables that actually have created_by columns
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
            AND tc.table_name NOT IN ('fee_structures', 'payment_plans', 'receipt_templates') -- Skip already fixed tables
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
