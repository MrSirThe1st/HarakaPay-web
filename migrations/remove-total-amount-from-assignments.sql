-- Remove total_amount and outstanding_amount columns from student_fee_assignments
-- Fees should be displayed by category, not as total amounts
-- Outstanding amounts will be calculated from payment installments

-- Drop the outstanding_amount column first (depends on total_amount)
ALTER TABLE student_fee_assignments 
DROP COLUMN IF EXISTS outstanding_amount;

-- Drop the total_amount column
ALTER TABLE student_fee_assignments 
DROP COLUMN IF EXISTS total_amount;

-- Add comment explaining the change
COMMENT ON TABLE student_fee_assignments IS 
'Student fee assignments - amounts are calculated from payment installments, not stored as totals';
