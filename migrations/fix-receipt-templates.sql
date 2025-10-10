-- Simplified receipt_templates table without complex defaults
CREATE TABLE IF NOT EXISTS receipt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL DEFAULT 'other',
  
  -- Logo configuration
  show_logo BOOLEAN DEFAULT true,
  logo_position VARCHAR(20) DEFAULT 'upper-left',
  
  -- Field visibility configuration (simplified JSONB)
  visible_fields JSONB DEFAULT '{}',
  
  -- Style configuration (simplified JSONB)
  style_config JSONB DEFAULT '{}',
  
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  UNIQUE(school_id, template_name)
);

-- Simple indexes
CREATE INDEX IF NOT EXISTS idx_receipt_templates_school_id ON receipt_templates(school_id);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_active ON receipt_templates(school_id, is_active);

-- Simple updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_receipt_templates_updated_at ON receipt_templates;

-- Create simple trigger
CREATE TRIGGER trigger_update_receipt_templates_updated_at
  BEFORE UPDATE ON receipt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
