-- Fix student_fee_assignments unique constraint to allow multiple schedules per student-template
-- This allows one student to have multiple payment schedules for the same fee template

-- Drop the existing unique constraint
ALTER TABLE student_fee_assignments 
DROP CONSTRAINT IF EXISTS unique_student_template;

-- Add new unique constraint that includes schedule_id
-- This allows multiple schedules per student-template combination
ALTER TABLE student_fee_assignments 
ADD CONSTRAINT unique_student_template_schedule 
UNIQUE (student_id, template_id, schedule_id, academic_year_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_student_template_schedule ON student_fee_assignments IS 
'Ensures one assignment per student-template-schedule-year combination, allowing multiple schedules per student-template';
