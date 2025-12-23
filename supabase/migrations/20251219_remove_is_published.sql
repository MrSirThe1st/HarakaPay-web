-- Migration: Remove is_published column from fee_structures
-- Date: 2025-12-19
-- Reason: is_published provides no actual functionality - only is_active is needed

-- Drop the is_published column
ALTER TABLE fee_structures DROP COLUMN IF EXISTS is_published;

-- Add comment explaining the change
COMMENT ON TABLE fee_structures IS 'Fee structures use is_active to control whether fees are assigned to students. Draft status is implied by is_active = false.';
