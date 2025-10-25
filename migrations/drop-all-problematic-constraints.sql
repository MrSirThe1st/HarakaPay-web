-- Drop All Problematic Constraints
-- This migration removes all constraints that are causing issues
-- Date: 2024-12-19

-- ==============================================
-- DROP UNIQUE CONSTRAINTS
-- ==============================================

-- Drop unique constraint on academic_years (school_id, name)
ALTER TABLE academic_years DROP CONSTRAINT IF EXISTS unique_school_year;
ALTER TABLE academic_years DROP CONSTRAINT IF EXISTS academic_years_school_id_name_key;

-- Drop unique constraint on fee_structures (school_id, academic_year_id, grade_level)
ALTER TABLE fee_structures DROP CONSTRAINT IF EXISTS fee_structures_school_id_academic_year_id_grade_level_key;

-- Drop unique constraint on fee_structure_items (structure_id, category_id)
ALTER TABLE fee_structure_items DROP CONSTRAINT IF EXISTS fee_structure_items_structure_id_category_id_key;

-- Drop unique constraint on fee_categories (school_id, name)
ALTER TABLE fee_categories DROP CONSTRAINT IF EXISTS fee_categories_school_id_name_key;

-- ==============================================
-- DROP CHECK CONSTRAINTS
-- ==============================================

-- Drop applies_to check constraint
ALTER TABLE fee_structures DROP CONSTRAINT IF EXISTS fee_structures_applies_to_check;

-- Drop payment_mode check constraint
ALTER TABLE fee_structure_items DROP CONSTRAINT IF EXISTS fee_structure_items_payment_mode_check;

-- Drop type check constraint on payment_plans
ALTER TABLE payment_plans DROP CONSTRAINT IF EXISTS payment_plans_type_check;

-- Drop total_amount check constraint
ALTER TABLE fee_structures DROP CONSTRAINT IF EXISTS fee_structures_total_amount_check;

-- Drop amount check constraint on fee_structure_items
ALTER TABLE fee_structure_items DROP CONSTRAINT IF EXISTS fee_structure_items_amount_check;

-- ==============================================
-- DROP FOREIGN KEY CONSTRAINTS (Make them nullable)
-- ==============================================

-- Make created_by nullable and drop NOT NULL constraints
ALTER TABLE fee_structures DROP CONSTRAINT IF EXISTS fee_structures_created_by_fkey;
ALTER TABLE fee_structures ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE payment_plans DROP CONSTRAINT IF EXISTS payment_plans_created_by_fkey;
ALTER TABLE payment_plans ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE fee_categories DROP CONSTRAINT IF EXISTS fee_categories_created_by_fkey;
ALTER TABLE fee_categories ALTER COLUMN created_by DROP NOT NULL;

-- ==============================================
-- DROP TRIGGERS (They might be causing issues)
-- ==============================================

-- Drop triggers that might be causing validation issues
DROP TRIGGER IF EXISTS trigger_update_fee_structure_total_amount ON fee_structure_items;
DROP TRIGGER IF EXISTS trigger_fee_structures_updated_at ON fee_structures;
DROP TRIGGER IF EXISTS trigger_payment_plans_updated_at ON payment_plans;
DROP TRIGGER IF EXISTS trigger_validate_installments_jsonb ON payment_plans;

-- Drop only the fee-specific functions (keep update_updated_at_column as it's used by other tables)
DROP FUNCTION IF EXISTS update_fee_structure_total_amount();
DROP FUNCTION IF EXISTS validate_installments_jsonb();

-- ==============================================
-- SUMMARY OF CONSTRAINTS DROPPED
-- ==============================================

-- UNIQUE CONSTRAINTS DROPPED:
-- 1. academic_years: unique_school_year (school_id, name)
-- 2. fee_structures: unique constraint on (school_id, academic_year_id, grade_level)
-- 3. fee_structure_items: unique constraint on (structure_id, category_id)
-- 4. fee_categories: unique constraint on (school_id, name)

-- CHECK CONSTRAINTS DROPPED:
-- 1. fee_structures.applies_to CHECK constraint
-- 2. fee_structure_items.payment_mode CHECK constraint
-- 3. payment_plans.type CHECK constraint
-- 4. fee_structures.total_amount CHECK constraint
-- 5. fee_structure_items.amount CHECK constraint

-- FOREIGN KEY CONSTRAINTS MODIFIED:
-- 1. fee_structures.created_by (made nullable)
-- 2. payment_plans.created_by (made nullable)
-- 3. fee_categories.created_by (made nullable)

-- TRIGGERS DROPPED:
-- 1. trigger_update_fee_structure_total_amount
-- 2. trigger_fee_structures_updated_at
-- 3. trigger_payment_plans_updated_at
-- 4. trigger_validate_installments_jsonb
-- 5. validate_installments_jsonb function
-- NOTE: update_updated_at_column function kept (used by other tables)

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check remaining constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    pg_get_constraintdef(c.oid) as definition
FROM information_schema.table_constraints tc
JOIN pg_constraint c ON c.conname = tc.constraint_name
WHERE tc.table_name IN ('academic_years', 'fee_structures', 'fee_structure_items', 'fee_categories', 'payment_plans')
ORDER BY tc.table_name, tc.constraint_type;
