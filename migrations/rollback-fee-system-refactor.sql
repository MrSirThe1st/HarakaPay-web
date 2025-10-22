-- Rollback Migration: Refactor Fee System Database
-- This script reverts the fee system refactoring
-- Date: 2024-01-XX

-- ==============================================
-- STEP 1: Restore Old Tables (if they were dropped)
-- ==============================================

-- Recreate fee_templates table
CREATE TABLE IF NOT EXISTS fee_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  grade_level VARCHAR(50) NOT NULL,
  program_type VARCHAR(50) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  UNIQUE(school_id, academic_year_id, grade_level, program_type)
);

-- Recreate fee_template_categories table
CREATE TABLE IF NOT EXISTS fee_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES fee_templates(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(template_id, category_id)
);

-- Recreate payment_schedules table
CREATE TABLE IF NOT EXISTS payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES fee_templates(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  schedule_type VARCHAR(20) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Recreate payment_installments table
CREATE TABLE IF NOT EXISTS payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES payment_schedules(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  name VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  due_date DATE NOT NULL,
  term_id UUID REFERENCES terms(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- STEP 2: Migrate Data Back from New Tables
-- ==============================================

-- Migrate fee_structures back to fee_templates
INSERT INTO fee_templates (
  id, school_id, academic_year_id, name, grade_level, program_type, 
  total_amount, status, created_at, updated_at, created_by
)
SELECT 
  id, school_id, academic_year_id, name, grade_level, 'primary' as program_type,
  total_amount, 
  CASE WHEN is_active THEN 'published' ELSE 'draft' END as status,
  created_at, updated_at, created_by
FROM fee_structures
ON CONFLICT (school_id, academic_year_id, grade_level, program_type) DO NOTHING;

-- Migrate fee_structure_items back to fee_template_categories
INSERT INTO fee_template_categories (
  template_id, category_id, amount, is_active, created_at
)
SELECT 
  fsi.structure_id as template_id,
  fsi.category_id,
  fsi.amount,
  true as is_active,
  fsi.created_at
FROM fee_structure_items fsi
ON CONFLICT (template_id, category_id) DO NOTHING;

-- Migrate payment_plans back to payment_schedules
INSERT INTO payment_schedules (
  id, template_id, name, schedule_type, discount_percentage, is_active, created_at, updated_at, created_by
)
SELECT 
  id,
  structure_id as template_id,
  CONCAT('Payment Plan - ', type) as name,
  type as schedule_type,
  discount_percentage,
  is_active,
  created_at,
  updated_at,
  created_by
FROM payment_plans
ON CONFLICT DO NOTHING;

-- Migrate installments from JSONB back to payment_installments
INSERT INTO payment_installments (
  schedule_id, installment_number, name, amount, percentage, due_date, term_id, is_active, created_at
)
SELECT 
  pp.id as schedule_id,
  (elem->>'installment_number')::INTEGER as installment_number,
  CONCAT('Installment ', elem->>'installment_number') as name,
  (elem->>'amount')::DECIMAL(10,2) as amount,
  COALESCE((elem->>'percentage')::DECIMAL(5,2), 0) as percentage,
  (elem->>'due_date')::DATE as due_date,
  CASE 
    WHEN elem->>'term_id' IS NOT NULL AND elem->>'term_id' != 'null' 
    THEN (elem->>'term_id')::UUID 
    ELSE NULL 
  END as term_id,
  COALESCE((elem->>'is_active')::BOOLEAN, true) as is_active,
  pp.created_at
FROM payment_plans pp
CROSS JOIN jsonb_array_elements(pp.installments) elem
WHERE jsonb_typeof(pp.installments) = 'array'
ON CONFLICT DO NOTHING;

-- ==============================================
-- STEP 3: Restore student_fee_assignments columns
-- ==============================================

-- Add back old columns if they were removed
ALTER TABLE student_fee_assignments 
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES fee_templates(id),
  ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES payment_schedules(id);

-- Update old columns with data from new columns
UPDATE student_fee_assignments 
SET 
  template_id = structure_id,
  schedule_id = payment_plan_id
WHERE structure_id IS NOT NULL AND payment_plan_id IS NOT NULL;

-- ==============================================
-- STEP 4: Drop New Tables and Columns
-- ==============================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_update_fee_structure_total_amount ON fee_structure_items;
DROP TRIGGER IF EXISTS trigger_fee_structures_updated_at ON fee_structures;
DROP TRIGGER IF EXISTS trigger_payment_plans_updated_at ON payment_plans;
DROP TRIGGER IF EXISTS trigger_validate_installments_jsonb ON payment_plans;

-- Drop functions
DROP FUNCTION IF EXISTS update_fee_structure_total_amount();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS validate_installments_jsonb();

-- Drop views
DROP VIEW IF EXISTS fee_templates;
DROP VIEW IF EXISTS fee_template_categories;
DROP VIEW IF EXISTS payment_schedules;

-- Drop indexes
DROP INDEX IF EXISTS idx_fee_structures_school_year;
DROP INDEX IF EXISTS idx_fee_structures_grade;
DROP INDEX IF EXISTS idx_fee_structures_active;
DROP INDEX IF EXISTS idx_fee_structure_items_structure;
DROP INDEX IF EXISTS idx_fee_structure_items_category;
DROP INDEX IF EXISTS idx_fee_structure_items_payment_mode;
DROP INDEX IF EXISTS idx_payment_plans_structure;
DROP INDEX IF EXISTS idx_payment_plans_type;
DROP INDEX IF EXISTS idx_payment_plans_active;
DROP INDEX IF EXISTS idx_student_fee_assignments_structure;
DROP INDEX IF EXISTS idx_student_fee_assignments_payment_plan;

-- Drop new tables
DROP TABLE IF EXISTS payment_plans CASCADE;
DROP TABLE IF EXISTS fee_structure_items CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;

-- Remove new columns from student_fee_assignments
ALTER TABLE student_fee_assignments 
  DROP COLUMN IF EXISTS structure_id,
  DROP COLUMN IF EXISTS payment_plan_id,
  DROP COLUMN IF EXISTS total_due;

-- ==============================================
-- STEP 5: Restore Old Indexes
-- ==============================================

-- Restore old indexes
CREATE INDEX IF NOT EXISTS idx_fee_templates_school_year ON fee_templates(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_fee_templates_grade ON fee_templates(grade_level, program_type);
CREATE INDEX IF NOT EXISTS idx_fee_template_categories_template ON fee_template_categories(template_id);
CREATE INDEX IF NOT EXISTS idx_fee_template_categories_category ON fee_template_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_template ON payment_schedules(template_id);
CREATE INDEX IF NOT EXISTS idx_payment_installments_schedule ON payment_installments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_template ON student_fee_assignments(template_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_schedule ON student_fee_assignments(schedule_id);

-- ==============================================
-- Rollback Complete
-- ==============================================

-- Remove migration tracking
DELETE FROM schema_migrations WHERE version = '20240101000001';
