-- Simplify fee structures to use single publish button
-- Remove status field and use simple is_published boolean

-- Add is_published column to fee_structures
ALTER TABLE fee_structures 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Update existing records to set is_published based on current status
UPDATE fee_structures 
SET is_published = CASE 
  WHEN is_active = true THEN true 
  ELSE false 
END;

-- Remove the old status-based logic (if any exists)
-- Note: We're keeping is_active for now as it serves a different purpose
