-- Minimal RLS Policies - Service Role Approach
-- This approach eliminates recursion by using service role for admin operations

-- ========================================
-- PROFILES TABLE - Minimal Policies
-- ========================================

-- Drop all existing complex policies
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can create any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Platform Admins can view admin and school staff profiles" ON profiles;
DROP POLICY IF EXISTS "Platform Admins can create school staff profiles" ON profiles;
DROP POLICY IF EXISTS "Platform Admins can update school staff profiles" ON profiles;
DROP POLICY IF EXISTS "Platform Admins can delete school staff profiles" ON profiles;
DROP POLICY IF EXISTS "Support Admins can view school staff profiles" ON profiles;
DROP POLICY IF EXISTS "Support Admins can update school staff profiles" ON profiles;
DROP POLICY IF EXISTS "School Admins can view their school staff profiles" ON profiles;
DROP POLICY IF EXISTS "School Admins can create school staff profiles" ON profiles;
DROP POLICY IF EXISTS "School Admins can update their school staff profiles" ON profiles;

-- Create simple, non-recursive policies
-- Users can view their own profile (for parents)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile (for parents)
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile (for parents)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- SCHOOLS TABLE - Minimal Policies
-- ========================================

-- Drop all existing complex policies
DROP POLICY IF EXISTS "Super admins can view all schools" ON schools;
DROP POLICY IF EXISTS "Super admins can create schools" ON schools;
DROP POLICY IF EXISTS "Super admins can update all schools" ON schools;
DROP POLICY IF EXISTS "Super admins can delete schools" ON schools;
DROP POLICY IF EXISTS "Platform Admins can view all schools" ON schools;
DROP POLICY IF EXISTS "Platform Admins can create schools" ON schools;
DROP POLICY IF EXISTS "Platform Admins can update basic school info" ON schools;
DROP POLICY IF EXISTS "Support Admins can view basic school info" ON schools;
DROP POLICY IF EXISTS "School Admins can view their own school" ON schools;
DROP POLICY IF EXISTS "School Admins can update their school" ON schools;
DROP POLICY IF EXISTS "School Staff can view their own school" ON schools;
DROP POLICY IF EXISTS "School Staff can update limited fields" ON schools;

-- No RLS policies needed - admin operations use service role

-- ========================================
-- STUDENTS TABLE - Minimal Policies
-- ========================================

-- Drop all existing complex policies
DROP POLICY IF EXISTS "Super admins can view all students" ON students;
DROP POLICY IF EXISTS "Super admins can add students" ON students;
DROP POLICY IF EXISTS "Super admins can update all students" ON students;
DROP POLICY IF EXISTS "Super admins can delete students" ON students;
DROP POLICY IF EXISTS "Platform Admins can view students" ON students;
DROP POLICY IF EXISTS "Platform Admins can add students" ON students;
DROP POLICY IF EXISTS "Platform Admins can update basic student info" ON students;
DROP POLICY IF EXISTS "Support Admins can view student basic info" ON students;
DROP POLICY IF EXISTS "Support Admins can update student info" ON students;
DROP POLICY IF EXISTS "School Admins can view all students in their school" ON students;
DROP POLICY IF EXISTS "School Admins can add students to their school" ON students;
DROP POLICY IF EXISTS "School Admins can update all student info in their school" ON students;
DROP POLICY IF EXISTS "School Admins can delete students from their school" ON students;
DROP POLICY IF EXISTS "School Staff can view assigned students" ON students;
DROP POLICY IF EXISTS "School Staff can add students" ON students;
DROP POLICY IF EXISTS "School Staff can update assigned students" ON students;
DROP POLICY IF EXISTS "School Staff can delete students" ON students;

-- No RLS policies needed - admin operations use service role

-- ========================================
-- PAYMENTS TABLE - Minimal Policies
-- ========================================

-- Drop all existing complex policies
DROP POLICY IF EXISTS "Super admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Super admins can create payments" ON payments;
DROP POLICY IF EXISTS "Super admins can update all payments" ON payments;
DROP POLICY IF EXISTS "Super admins can delete payments" ON payments;
DROP POLICY IF EXISTS "Platform Admins can view payments if transparency enabled" ON payments;
DROP POLICY IF EXISTS "School Admins can view all payments for their school" ON payments;
DROP POLICY IF EXISTS "School Admins can create payment records" ON payments;
DROP POLICY IF EXISTS "School Admins can update payment records" ON payments;
DROP POLICY IF EXISTS "School Staff can view payments if permitted" ON payments;
DROP POLICY IF EXISTS "Parents can view their own payment history" ON payments;

-- Only policy for parents to view their own payments
CREATE POLICY "Parents can view their own payment history" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN students s ON s.id = ps.student_id
      WHERE s.id = payments.student_id
      AND ps.parent_id IN (
        SELECT id FROM parents WHERE user_id = auth.uid()
      )
    )
  );

-- ========================================
-- OTHER TABLES - No RLS Policies
-- ========================================

-- For all other tables, no RLS policies are needed
-- Admin operations use service role, parent operations are handled at application level

-- Disable RLS on tables that don't need parent protection
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled only on profiles and payments (for parent data protection)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
