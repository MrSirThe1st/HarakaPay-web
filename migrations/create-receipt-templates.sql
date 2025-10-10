-- Create receipt_templates table for personalized receipt designs
CREATE TABLE receipt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'tuition', 'books', 'transport', 'other', or custom types
  
  -- Logo configuration
  show_logo BOOLEAN DEFAULT true,
  logo_position VARCHAR(20) DEFAULT 'upper-left', -- 'upper-left', 'upper-center', 'upper-right'
  
  -- Field visibility configuration (JSONB for flexibility)
  visible_fields JSONB NOT NULL DEFAULT '{
    "school_name": true,
    "school_address": true,
    "school_contact": true,
    "student_name": true,
    "student_id": true,
    "grade_level": true,
    "class_section": true,
    "amount": true,
    "payment_date": true,
    "payment_method": true,
    "transaction_id": true,
    "receipt_number": true,
    "fee_category": true,
    "academic_year": true,
    "term": true
  }'::jsonb,
  
  -- Style configuration
  style_config JSONB NOT NULL DEFAULT '{
    "primary_color": "#16a34a",
    "header_background": "#f9fafb",
    "font_family": "Inter",
    "font_size": "medium",
    "border_style": "solid",
    "show_watermark": false
  }'::jsonb,
  
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  UNIQUE(school_id, template_name)
);

-- Index for faster queries
CREATE INDEX idx_receipt_templates_school_id ON receipt_templates(school_id);
CREATE INDEX idx_receipt_templates_active ON receipt_templates(school_id, is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_receipt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_receipt_templates_updated_at
  BEFORE UPDATE ON receipt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_receipt_templates_updated_at();
