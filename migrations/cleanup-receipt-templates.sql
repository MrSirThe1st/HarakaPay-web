-- Complete cleanup of receipt_templates table and all associated objects
-- This will remove everything related to receipt templates

-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_update_receipt_templates_updated_at ON receipt_templates;

-- Drop the trigger function (if it was created specifically for this table)
DROP FUNCTION IF EXISTS update_receipt_templates_updated_at();

-- Drop the indexes
DROP INDEX IF EXISTS idx_receipt_templates_school_id;
DROP INDEX IF EXISTS idx_receipt_templates_active;

-- Drop the table (this will also remove any foreign key constraints)
DROP TABLE IF EXISTS receipt_templates CASCADE;

-- Note: The general update_updated_at_column() function is kept as it might be used by other tables
-- If you want to remove it completely, uncomment the line below:
-- DROP FUNCTION IF EXISTS update_updated_at_column();
