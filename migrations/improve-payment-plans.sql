-- Update payment_plans table structure to match requirements
-- Add missing columns and improve the schema

-- Add missing columns to payment_plans
ALTER TABLE payment_plans 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_fee_rule JSONB DEFAULT '{}'::jsonb;

-- Update existing records to have school_id
UPDATE payment_plans 
SET school_id = (
  SELECT fs.school_id 
  FROM fee_structures fs 
  WHERE fs.id = payment_plans.structure_id
)
WHERE school_id IS NULL;

-- Add constraints
ALTER TABLE payment_plans 
ADD CONSTRAINT chk_discount_percentage CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD CONSTRAINT chk_grace_period CHECK (grace_period_days >= 0),
ADD CONSTRAINT chk_late_fee_rule CHECK (jsonb_typeof(late_fee_rule) = 'object');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_plans_school_id ON payment_plans(school_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_structure_id ON payment_plans(structure_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_type ON payment_plans(type);
CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON payment_plans(is_active);
