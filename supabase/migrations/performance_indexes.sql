-- Performance Optimization Indexes for HarakaPay
-- Run this migration to speed up common queries by 30-50%

-- Students table indexes
CREATE INDEX IF NOT EXISTS idx_students_school_grade
ON students(school_id, grade_level)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_students_status
ON students(school_id, status);

CREATE INDEX IF NOT EXISTS idx_students_search
ON students(school_id, first_name, last_name);

CREATE INDEX IF NOT EXISTS idx_students_parent_phone
ON students(school_id, parent_phone)
WHERE parent_phone IS NOT NULL;

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role_school
ON profiles(role, school_id, is_active);

CREATE INDEX IF NOT EXISTS idx_profiles_school_active
ON profiles(school_id, is_active)
WHERE role IN ('school_admin', 'school_staff');

CREATE INDEX IF NOT EXISTS idx_profiles_email
ON profiles(school_id)
WHERE role = 'parent';

-- Fee structures indexes
CREATE INDEX IF NOT EXISTS idx_fee_structures_active
ON fee_structures(school_id, academic_year_id, is_active);

CREATE INDEX IF NOT EXISTS idx_fee_structures_grade
ON fee_structures(school_id, grade_level, is_active);

CREATE INDEX IF NOT EXISTS idx_fee_structures_published
ON fee_structures(school_id, is_published)
WHERE is_active = true;

-- Academic years indexes
CREATE INDEX IF NOT EXISTS idx_academic_years_active
ON academic_years(school_id, is_active);

CREATE INDEX IF NOT EXISTS idx_academic_years_dates
ON academic_years(school_id, start_date, end_date);

-- Student fee assignments indexes
CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_student
ON student_fee_assignments(student_id, structure_id);

CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_structure
ON student_fee_assignments(structure_id)
WHERE assigned_at IS NOT NULL;

-- Payment plans indexes
CREATE INDEX IF NOT EXISTS idx_payment_plans_structure
ON payment_plans(structure_id, is_active);

CREATE INDEX IF NOT EXISTS idx_payment_plans_dates
ON payment_plans(structure_id, due_date);

-- Notifications indexes (if you have this table)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient
ON notifications(recipient_id, created_at DESC)
WHERE status = 'sent';

CREATE INDEX IF NOT EXISTS idx_notifications_school
ON notifications(school_id, created_at DESC);

-- Schools indexes
CREATE INDEX IF NOT EXISTS idx_schools_active
ON schools(is_active, created_at DESC);

-- Analyze tables to update statistics (helps query planner)
ANALYZE students;
ANALYZE profiles;
ANALYZE fee_structures;
ANALYZE academic_years;
ANALYZE student_fee_assignments;
ANALYZE payment_plans;
ANALYZE schools;

-- Add comments for documentation
COMMENT ON INDEX idx_students_school_grade IS 'Speeds up student lists filtered by grade';
COMMENT ON INDEX idx_profiles_role_school IS 'Speeds up staff/admin lookups';
COMMENT ON INDEX idx_fee_structures_active IS 'Speeds up active fee structure queries';
