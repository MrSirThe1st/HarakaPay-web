-- Migration: Refactor Fee System Database
-- This migration implements the new simplified fee system schema
-- Date: 2024-01-XX

-- ==============================================
-- STEP 1: Create New Tables
-- ==============================================

-- 1. Create fee_structures table (renamed from fee_templates)
CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  grade_level VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  applies_to VARCHAR(20) NOT NULL DEFAULT 'school' CHECK (applies_to IN ('school', 'class')),
  total_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  -- Constraints
  UNIQUE(school_id, academic_year_id, grade_level),
  CHECK (total_amount >= 0)
);

-- 2. Create fee_structure_items table (merged from fee_template_categories)
CREATE TABLE fee_structure_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT true,
  payment_mode VARCHAR(20) NOT NULL DEFAULT 'installment' CHECK (payment_mode IN ('one_time', 'termly', 'installment')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(structure_id, category_id),
  CHECK (amount >= 0)
);

-- 3. Create payment_plans table (merged from payment_schedules + payment_installments)
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('monthly', 'per-term', 'upfront')),
  discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  installments JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  -- Constraints
  CHECK (jsonb_typeof(installments) = 'array')
);

-- 4. Update student_fee_assignments table
-- First add new columns
ALTER TABLE student_fee_assignments 
  ADD COLUMN structure_id UUID,
  ADD COLUMN payment_plan_id UUID,
  ADD COLUMN total_due DECIMAL(10,2) DEFAULT 0,
  ADD CONSTRAINT chk_total_due CHECK (total_due >= 0);

-- Add foreign key constraints after data migration
-- (We'll add these later after the data is migrated)

-- 5. Update student_fee_payments table (add missing columns if needed)
ALTER TABLE student_fee_payments 
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ==============================================
-- STEP 2: Migrate Data from Old Tables
-- ==============================================

-- Migrate fee_templates to fee_structures
INSERT INTO fee_structures (
  id, school_id, academic_year_id, grade_level, name, 
  applies_to, total_amount, is_active, created_at, updated_at, created_by
)
SELECT 
  id, school_id, academic_year_id, grade_level, name,
  'school' as applies_to, total_amount, 
  CASE WHEN status = 'published' THEN true ELSE false END as is_active,
  created_at, updated_at, created_by
FROM fee_templates;

-- Migrate fee_template_categories to fee_structure_items
INSERT INTO fee_structure_items (
  structure_id, category_id, amount, is_mandatory, is_recurring, payment_mode, created_at
)
SELECT 
  ftc.template_id as structure_id,
  ftc.category_id,
  ftc.amount,
  fc.is_mandatory,
  fc.is_recurring,
  CASE 
    WHEN fc.supports_one_time = true AND fc.is_recurring = false THEN 'one_time'
    WHEN fc.is_recurring = true THEN 'installment'
    ELSE 'termly'
  END as payment_mode,
  ftc.created_at
FROM fee_template_categories ftc
JOIN fee_categories fc ON ftc.category_id = fc.id;

-- Migrate payment_schedules + payment_installments to payment_plans
INSERT INTO payment_plans (
  id, structure_id, type, discount_percentage, installments, is_active, created_at, updated_at, created_by
)
SELECT 
  ps.id,
  ps.template_id as structure_id,
  ps.schedule_type as type,
  COALESCE(ps.discount_percentage, 0) as discount_percentage,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'installment_number', pi.installment_number,
        'amount', pi.amount,
        'due_date', pi.due_date,
        'percentage', pi.percentage,
        'term_id', pi.term_id,
        'is_active', pi.is_active
      ) ORDER BY pi.installment_number
    ) FILTER (WHERE pi.id IS NOT NULL),
    '[]'::jsonb
  ) as installments,
  ps.is_active,
  ps.created_at,
  ps.updated_at,
  ps.created_by
FROM payment_schedules ps
LEFT JOIN payment_installments pi ON ps.id = pi.schedule_id
GROUP BY ps.id, ps.template_id, ps.schedule_type, ps.discount_percentage, ps.is_active, ps.created_at, ps.updated_at, ps.created_by;

-- Update student_fee_assignments with new foreign keys
UPDATE student_fee_assignments sfa
SET 
  structure_id = sfa.template_id,
  payment_plan_id = sfa.schedule_id,
  total_due = (
    SELECT ft.total_amount 
    FROM fee_templates ft 
    WHERE ft.id = sfa.template_id
  )
WHERE sfa.template_id IS NOT NULL AND sfa.schedule_id IS NOT NULL;

-- Add foreign key constraints after data migration
ALTER TABLE student_fee_assignments 
  ADD CONSTRAINT fk_student_fee_assignments_structure 
    FOREIGN KEY (structure_id) REFERENCES fee_structures(id),
  ADD CONSTRAINT fk_student_fee_assignments_payment_plan 
    FOREIGN KEY (payment_plan_id) REFERENCES payment_plans(id);

-- Drop old columns after successful migration
ALTER TABLE student_fee_assignments 
  DROP COLUMN IF EXISTS template_id,
  DROP COLUMN IF EXISTS schedule_id;

-- ==============================================
-- STEP 3: Add Indexes for Performance
-- ==============================================

-- Core indexes for fee_structures
CREATE INDEX idx_fee_structures_school_year ON fee_structures(school_id, academic_year_id);
CREATE INDEX idx_fee_structures_grade ON fee_structures(grade_level, applies_to);
CREATE INDEX idx_fee_structures_active ON fee_structures(is_active) WHERE is_active = true;

-- Core indexes for fee_structure_items
CREATE INDEX idx_fee_structure_items_structure ON fee_structure_items(structure_id);
CREATE INDEX idx_fee_structure_items_category ON fee_structure_items(category_id);
CREATE INDEX idx_fee_structure_items_payment_mode ON fee_structure_items(payment_mode);

-- Core indexes for payment_plans
CREATE INDEX idx_payment_plans_structure ON payment_plans(structure_id);
CREATE INDEX idx_payment_plans_type ON payment_plans(type);
CREATE INDEX idx_payment_plans_active ON payment_plans(is_active) WHERE is_active = true;

-- Core indexes for student_fee_assignments
CREATE INDEX idx_student_fee_assignments_student_year ON student_fee_assignments(student_id, academic_year_id);
CREATE INDEX idx_student_fee_assignments_structure ON student_fee_assignments(structure_id);
CREATE INDEX idx_student_fee_assignments_payment_plan ON student_fee_assignments(payment_plan_id);
CREATE INDEX idx_student_fee_assignments_status ON student_fee_assignments(status);

-- Core indexes for student_fee_payments
CREATE INDEX idx_student_fee_payments_assignment ON student_fee_payments(assignment_id);
CREATE INDEX idx_student_fee_payments_date ON student_fee_payments(payment_date);
CREATE INDEX idx_student_fee_payments_status ON student_fee_payments(status);

-- Core indexes for fee_categories
CREATE INDEX idx_fee_categories_school ON fee_categories(school_id);
CREATE INDEX idx_fee_categories_type ON fee_categories(category_type);
CREATE INDEX idx_fee_categories_active ON fee_categories(is_active) WHERE is_active = true;

-- ==============================================
-- STEP 4: Add Triggers for Data Integrity
-- ==============================================

-- Trigger to update fee_structures.total_amount when items change
CREATE OR REPLACE FUNCTION update_fee_structure_total_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fee_structures 
  SET total_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM fee_structure_items 
    WHERE structure_id = COALESCE(NEW.structure_id, OLD.structure_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.structure_id, OLD.structure_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fee_structure_total_amount
  AFTER INSERT OR UPDATE OR DELETE ON fee_structure_items
  FOR EACH ROW EXECUTE FUNCTION update_fee_structure_total_amount();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_fee_structures_updated_at
  BEFORE UPDATE ON fee_structures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_plans_updated_at
  BEFORE UPDATE ON payment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- STEP 5: Add Constraints and Validation
-- ==============================================

-- Ensure installments JSONB structure is valid
CREATE OR REPLACE FUNCTION validate_installments_jsonb()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if installments is an array
  IF jsonb_typeof(NEW.installments) != 'array' THEN
    RAISE EXCEPTION 'installments must be a JSON array';
  END IF;
  
  -- Validate each installment has required fields
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(NEW.installments) elem
    WHERE NOT (elem ? 'amount' AND elem ? 'due_date' AND elem ? 'installment_number')
  ) THEN
    RAISE EXCEPTION 'Each installment must have amount, due_date, and installment_number';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_installments_jsonb
  BEFORE INSERT OR UPDATE ON payment_plans
  FOR EACH ROW EXECUTE FUNCTION validate_installments_jsonb();

-- ==============================================
-- STEP 6: Create Views for Backward Compatibility (Optional)
-- ==============================================

-- View to simulate old fee_templates table
CREATE VIEW fee_templates AS
SELECT 
  id,
  school_id,
  academic_year_id,
  name,
  grade_level,
  program_type,
  total_amount,
  CASE WHEN is_active THEN 'published' ELSE 'draft' END as status,
  created_at,
  updated_at,
  created_by
FROM fee_structures;

-- View to simulate old fee_template_categories table
CREATE VIEW fee_template_categories AS
SELECT 
  fsi.id,
  fsi.structure_id as template_id,
  fsi.category_id,
  fsi.amount,
  fsi.is_mandatory as is_active,
  fsi.created_at
FROM fee_structure_items fsi;

-- View to simulate old payment_schedules table
CREATE VIEW payment_schedules AS
SELECT 
  id,
  structure_id as template_id,
  CONCAT('Payment Plan - ', type) as name,
  '' as description,
  type as schedule_type,
  discount_percentage,
  is_active,
  created_at,
  updated_at,
  created_by
FROM payment_plans;

==============================================
STEP 7: Cleanup (Run after application is updated)
==============================================

Uncomment these lines AFTER updating the application code:
DROP TABLE IF EXISTS payment_installments CASCADE;
DROP TABLE IF EXISTS payment_schedules CASCADE;
DROP TABLE IF EXISTS fee_template_categories CASCADE;
DROP TABLE IF EXISTS fee_templates CASCADE;

==============================================
STEP 8: Grant Permissions
==============================================

Grant permissions to application user (adjust as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON fee_structures TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON fee_structure_items TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_plans TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON student_fee_assignments TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON student_fee_payments TO app_user;

==============================================
Migration Complete
==============================================

-- Add migration tracking
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('20240101000001', NOW())
ON CONFLICT (version) DO NOTHING;
