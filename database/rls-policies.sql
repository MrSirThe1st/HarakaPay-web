-- HarakaPay RLS Policies Implementation
-- This implements all the access control policies from POLICIES-AND-STRUCTURE.md

-- ========================================
-- PROFILES TABLE POLICIES
-- ========================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile (during account creation)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile (non-role fields)
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Note: Role and admin_type changes are prevented by a database trigger
-- Users cannot change their own role or admin_type (except super admins)

-- Super Admins can view all profiles
CREATE POLICY "Super Admins can view all profiles" ON profiles
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can create any profile type
CREATE POLICY "Super Admins can create any profile" ON profiles
  FOR INSERT WITH CHECK (is_super_admin(auth.uid()));

-- Super Admins can update any profile
CREATE POLICY "Super Admins can update any profile" ON profiles
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- Super Admins can delete any profile (except other Super Admins)
CREATE POLICY "Super Admins can delete profiles" ON profiles
  FOR DELETE USING (
    is_super_admin(auth.uid()) 
    AND role != 'super_admin' -- Cannot delete other super admins
  );

-- Platform Admins can view all admin and school staff profiles
CREATE POLICY "Platform Admins can view admin and school staff profiles" ON profiles
  FOR SELECT USING (
    is_platform_admin(auth.uid()) 
    AND (role IN ('platform_admin', 'support_admin', 'school_admin', 'school_staff'))
  );

-- Platform Admins can create school staff profiles
CREATE POLICY "Platform Admins can create school staff profiles" ON profiles
  FOR INSERT WITH CHECK (
    is_platform_admin(auth.uid()) 
    AND role IN ('school_admin', 'school_staff')
  );

-- Platform Admins can update school staff profiles (non-payment related)
CREATE POLICY "Platform Admins can update school staff profiles" ON profiles
  FOR UPDATE USING (
    is_platform_admin(auth.uid()) 
    AND role IN ('school_admin', 'school_staff')
  );

-- Platform Admins can delete school staff profiles
CREATE POLICY "Platform Admins can delete school staff profiles" ON profiles
  FOR DELETE USING (
    is_platform_admin(auth.uid()) 
    AND role IN ('school_admin', 'school_staff')
  );

-- Support Admins can view school staff profiles only
CREATE POLICY "Support Admins can view school staff profiles" ON profiles
  FOR SELECT USING (
    is_support_admin(auth.uid()) 
    AND role IN ('school_admin', 'school_staff')
  );

-- Support Admins can update school staff profiles (limited fields)
CREATE POLICY "Support Admins can update school staff profiles" ON profiles
  FOR UPDATE USING (
    is_support_admin(auth.uid()) 
    AND role IN ('school_admin', 'school_staff')
  );

-- School Admins can view their own school staff profiles
CREATE POLICY "School Admins can view their school staff profiles" ON profiles
  FOR SELECT USING (
    is_school_admin(auth.uid(), school_id)
  );

-- School Admins can create school staff profiles for their school
CREATE POLICY "School Admins can create school staff profiles" ON profiles
  FOR INSERT WITH CHECK (
    is_school_admin(auth.uid(), school_id)
    AND role = 'school_staff'
  );

-- School Admins can update their school staff profiles
CREATE POLICY "School Admins can update their school staff profiles" ON profiles
  FOR UPDATE USING (
    is_school_admin(auth.uid(), school_id)
  );

-- School Admins can delete their own school staff (with confirmation workflow)
CREATE POLICY "School Admins can delete their school staff" ON profiles
  FOR DELETE USING (
    is_school_admin(auth.uid(), school_id)
    AND role = 'school_staff'
  );

-- School Staff can view profiles within their school
CREATE POLICY "School Staff can view profiles within their school" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff' 
      AND p.school_id = profiles.school_id
    )
  );

-- Parents can view their own profile only
CREATE POLICY "Parents can view their own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id 
    AND role = 'parent'
  );

-- ========================================
-- SCHOOLS TABLE POLICIES
-- ========================================

-- Super Admins can view all schools
CREATE POLICY "Super Admins can view all schools" ON schools
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can create schools
CREATE POLICY "Super Admins can create schools" ON schools
  FOR INSERT WITH CHECK (is_super_admin(auth.uid()));

-- Super Admins can update all school fields
CREATE POLICY "Super Admins can update all schools" ON schools
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- Super Admins can delete schools
CREATE POLICY "Super Admins can delete schools" ON schools
  FOR DELETE USING (is_super_admin(auth.uid()));

-- Platform Admins can view all schools
CREATE POLICY "Platform Admins can view all schools" ON schools
  FOR SELECT USING (is_platform_admin(auth.uid()));

-- Platform Admins can create schools
CREATE POLICY "Platform Admins can create schools" ON schools
  FOR INSERT WITH CHECK (is_platform_admin(auth.uid()));

-- Platform Admins can update basic school info (name, address, contact)
CREATE POLICY "Platform Admins can update basic school info" ON schools
  FOR UPDATE USING (
    is_platform_admin(auth.uid())
    AND (
      payment_transparency->>'platform_admin_access' = 'true'
      OR is_super_admin(auth.uid())
    )
  );

-- Support Admins can view basic school info (no payment settings)
CREATE POLICY "Support Admins can view basic school info" ON schools
  FOR SELECT USING (
    is_support_admin(auth.uid())
  );

-- School Admins can view their own school
CREATE POLICY "School Admins can view their own school" ON schools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin' 
      AND p.school_id = schools.id
    )
  );

-- School Admins can update all fields for their school
CREATE POLICY "School Admins can update their school" ON schools
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin' 
      AND p.school_id = schools.id
    )
  );

-- School Staff can view their own school (limited fields)
CREATE POLICY "School Staff can view their own school" ON schools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff' 
      AND p.school_id = schools.id
    )
  );

-- School Staff can update limited fields for their school
CREATE POLICY "School Staff can update limited fields" ON schools
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff' 
      AND p.school_id = schools.id
    )
  );

-- Parents can view basic public info of schools their children attend
CREATE POLICY "Parents can view their children's schools" ON schools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN students s ON s.id = ps.student_id
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid() 
      AND s.school_id = schools.id
    )
  );

-- ========================================
-- STUDENTS TABLE POLICIES
-- ========================================

-- Super Admins can view all students
CREATE POLICY "Super Admins can view all students" ON students
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can add students to any school
CREATE POLICY "Super Admins can add students" ON students
  FOR INSERT WITH CHECK (is_super_admin(auth.uid()));

-- Super Admins can update any student record
CREATE POLICY "Super Admins can update all students" ON students
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- Super Admins can delete any student record
CREATE POLICY "Super Admins can delete students" ON students
  FOR DELETE USING (is_super_admin(auth.uid()));

-- Platform Admins can view students based on school transparency settings
CREATE POLICY "Platform Admins can view students with transparency" ON students
  FOR SELECT USING (
    is_platform_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = students.school_id
      AND s.payment_transparency->>'platform_admin_access' = 'true'
    )
  );

-- Platform Admins can add students (with school permission)
CREATE POLICY "Platform Admins can add students" ON students
  FOR INSERT WITH CHECK (
    is_platform_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = students.school_id
      AND s.status = 'approved'
    )
  );

-- Platform Admins can update basic student info (non-financial)
CREATE POLICY "Platform Admins can update student basic info" ON students
  FOR UPDATE USING (
    is_platform_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = students.school_id
      AND s.payment_transparency->>'platform_admin_access' = 'true'
    )
  );

-- Support Admins can view student basic info (no financial data)
CREATE POLICY "Support Admins can view student basic info" ON students
  FOR SELECT USING (is_support_admin(auth.uid()));

-- Support Admins can update student basic info
CREATE POLICY "Support Admins can update student basic info" ON students
  FOR UPDATE USING (is_support_admin(auth.uid()));

-- School Admins can view all students in their school
CREATE POLICY "School Admins can view their school students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin' 
      AND p.school_id = students.school_id
    )
  );

-- School Admins can add students to their school
CREATE POLICY "School Admins can add students" ON students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin' 
      AND p.school_id = students.school_id
    )
  );

-- School Admins can update all student info in their school
CREATE POLICY "School Admins can update their students" ON students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin' 
      AND p.school_id = students.school_id
    )
  );

-- School Admins can delete students from their school
CREATE POLICY "School Admins can delete their students" ON students
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin' 
      AND p.school_id = students.school_id
    )
  );

-- School Staff can view students they are assigned to manage
CREATE POLICY "School Staff can view assigned students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff' 
      AND p.school_id = students.school_id
    )
  );

-- School Staff can add students (if permitted by School Admin)
CREATE POLICY "School Staff can add students if permitted" ON students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff' 
      AND p.school_id = students.school_id
    )
  );

-- School Staff can update assigned students (limited fields)
CREATE POLICY "School Staff can update assigned students" ON students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff' 
      AND p.school_id = students.school_id
    )
  );

-- School Staff can delete students (if permitted and with School Admin approval)
CREATE POLICY "School Staff can delete students if permitted" ON students
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff' 
      AND p.school_id = students.school_id
    )
  );

-- Parents can view only their own children
CREATE POLICY "Parents can view their own children" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid() 
      AND ps.student_id = students.id
    )
  );

-- ========================================
-- PARENTS TABLE POLICIES
-- ========================================

-- Super Admins can view all parent records
CREATE POLICY "Super Admins can view all parents" ON parents
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can create parent records
CREATE POLICY "Super Admins can create parents" ON parents
  FOR INSERT WITH CHECK (is_super_admin(auth.uid()));

-- Super Admins can update any parent record
CREATE POLICY "Super Admins can update all parents" ON parents
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- Super Admins can delete parent records
CREATE POLICY "Super Admins can delete parents" ON parents
  FOR DELETE USING (is_super_admin(auth.uid()));

-- Platform Admins can view parent records based on school transparency settings
CREATE POLICY "Platform Admins can view parents with transparency" ON parents
  FOR SELECT USING (
    is_platform_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN students s ON s.id = ps.student_id
      JOIN schools sch ON sch.id = s.school_id
      WHERE sch.payment_transparency->>'platform_admin_access' = 'true'
    )
  );

-- School Admins can view parents of students in their school
CREATE POLICY "School Admins can view their school parents" ON parents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN students s ON s.id = ps.student_id
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE p.role = 'school_admin' 
      AND p.school_id = s.school_id
      AND ps.parent_id = parents.id
    )
  );

-- School Admins can create parent records for their school students
CREATE POLICY "School Admins can create parents" ON parents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin'
    )
  );

-- School Admins can update parent records for their school (limited fields)
CREATE POLICY "School Admins can update their school parents" ON parents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN students s ON s.id = ps.student_id
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE p.role = 'school_admin' 
      AND p.school_id = s.school_id
      AND ps.parent_id = parents.id
    )
  );

-- School Staff can view parents of students they manage
CREATE POLICY "School Staff can view managed parents" ON parents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN students s ON s.id = ps.student_id
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE p.role = 'school_staff' 
      AND p.school_id = s.school_id
      AND ps.parent_id = parents.id
    )
  );

-- School Staff can create parent records (if permitted)
CREATE POLICY "School Staff can create parents if permitted" ON parents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff'
    )
  );

-- School Staff can update assigned parent records (very limited fields)
CREATE POLICY "School Staff can update assigned parents" ON parents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN students s ON s.id = ps.student_id
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE p.role = 'school_staff' 
      AND p.school_id = s.school_id
      AND ps.parent_id = parents.id
    )
  );

-- Parents can view their own record only
CREATE POLICY "Parents can view their own record" ON parents
  FOR SELECT USING (auth.uid() = user_id);

-- Parents can create their own account (mobile app registration)
CREATE POLICY "Parents can create their own account" ON parents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Parents can update their own profile information
CREATE POLICY "Parents can update their own profile" ON parents
  FOR UPDATE USING (auth.uid() = user_id);

-- Parents can deactivate their own accounts
CREATE POLICY "Parents can deactivate their own account" ON parents
  FOR UPDATE USING (
    auth.uid() = user_id
    AND is_active = false
  );

-- ========================================
-- PAYMENTS TABLE POLICIES
-- ========================================

-- Super Admins can view all payment records
CREATE POLICY "Super Admins can view all payments" ON payments
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can create payment records for any school
CREATE POLICY "Super Admins can create payments" ON payments
  FOR INSERT WITH CHECK (is_super_admin(auth.uid()));

-- Super Admins can update any payment record
CREATE POLICY "Super Admins can update all payments" ON payments
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- Super Admins can delete payment records
CREATE POLICY "Super Admins can delete payments" ON payments
  FOR DELETE USING (is_super_admin(auth.uid()));

-- Platform Admins can view payment records ONLY if school has enabled payment transparency
CREATE POLICY "Platform Admins can view payments with transparency" ON payments
  FOR SELECT USING (
    is_platform_admin(auth.uid())
    AND can_access_payment_data(auth.uid(), (
      SELECT s.school_id FROM students s WHERE s.id = payments.student_id
    ))
  );

-- School Admins can view all payments for their school
CREATE POLICY "School Admins can view their school payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE s.id = payments.student_id 
      AND p.role = 'school_admin' 
      AND p.school_id = s.school_id
    )
  );

-- School Admins can update payment records for their school (limited scenarios)
CREATE POLICY "School Admins can update their school payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE s.id = payments.student_id 
      AND p.role = 'school_admin' 
      AND p.school_id = s.school_id
    )
  );

-- School Staff can view payments (if permitted by School Admin)
CREATE POLICY "School Staff can view permitted payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE s.id = payments.student_id 
      AND p.role = 'school_staff' 
      AND p.school_id = s.school_id
    )
  );

-- Parents can view their own payment history only
CREATE POLICY "Parents can view their own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_students ps
      JOIN parents p ON p.user_id = auth.uid()
      WHERE ps.student_id = payments.student_id
    )
  );

-- ========================================
-- PAYMENT_SETTINGS TABLE POLICIES
-- ========================================

-- Super Admins can view all payment settings
CREATE POLICY "Super Admins can view all payment settings" ON payment_settings
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can create payment settings for any school
CREATE POLICY "Super Admins can create payment settings" ON payment_settings
  FOR INSERT WITH CHECK (is_super_admin(auth.uid()));

-- Super Admins can update any payment settings
CREATE POLICY "Super Admins can update all payment settings" ON payment_settings
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- Super Admins can delete payment settings
CREATE POLICY "Super Admins can delete payment settings" ON payment_settings
  FOR DELETE USING (is_super_admin(auth.uid()));

-- School Admins can view their own school payment settings
CREATE POLICY "School Admins can view their payment settings" ON payment_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin' 
      AND p.school_id = (
        SELECT school_id FROM schools WHERE id = payment_settings.school_id
      )
    )
  );

-- School Admins can request payment setting creation (requires approval)
CREATE POLICY "School Admins can request payment settings" ON payment_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin' 
      AND p.school_id = payment_settings.school_id
    )
  );

-- ========================================
-- AUDIT_LOGS TABLE POLICIES
-- ========================================

-- Super Admins can view all audit logs
CREATE POLICY "Super Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Platform Admins can view logs related to their actions and assigned schools
CREATE POLICY "Platform Admins can view related audit logs" ON audit_logs
  FOR SELECT USING (
    is_platform_admin(auth.uid())
    AND (
      user_id = auth.uid() -- Own actions
      OR EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = audit_logs.user_id
        AND p.role IN ('school_admin', 'school_staff')
      )
    )
  );

-- Support Admins can view logs related to their own actions
CREATE POLICY "Support Admins can view own audit logs" ON audit_logs
  FOR SELECT USING (
    is_support_admin(auth.uid())
    AND user_id = auth.uid()
  );

-- School Admins can view logs related to their school
CREATE POLICY "School Admins can view school audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin'
      AND (
        p.school_id = (
          SELECT school_id FROM students WHERE id = audit_logs.entity_id
        )
        OR p.school_id = audit_logs.entity_id
      )
    )
  );

-- School Staff can view logs related to their own actions
CREATE POLICY "School Staff can view own audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_staff'
      AND user_id = auth.uid()
    )
  );

-- System can create audit logs for any user
CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ========================================
-- NOTIFICATIONS TABLE POLICIES
-- ========================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Super Admins can view all notifications (for system monitoring)
CREATE POLICY "Super Admins can view all notifications" ON notifications
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can create notifications for any user
CREATE POLICY "Super Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (is_super_admin(auth.uid()));

-- Super Admins can update any notification status
CREATE POLICY "Super Admins can update all notifications" ON notifications
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- Platform Admins can create notifications for school users
CREATE POLICY "Platform Admins can create school notifications" ON notifications
  FOR INSERT WITH CHECK (
    is_platform_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = notifications.user_id
      AND p.role IN ('school_admin', 'school_staff')
    )
  );

-- School Admins can view notifications sent to their school users
CREATE POLICY "School Admins can view school notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin'
      AND p.school_id = (
        SELECT school_id FROM profiles WHERE user_id = notifications.user_id
      )
    )
  );

-- School Admins can create notifications for their school community
CREATE POLICY "School Admins can create school notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin'
      AND p.school_id = (
        SELECT school_id FROM profiles WHERE user_id = notifications.user_id
      )
    )
  );

-- ========================================
-- APPROVAL_WORKFLOWS TABLE POLICIES
-- ========================================

-- Super Admins can view all approval workflows
CREATE POLICY "Super Admins can view all approval workflows" ON approval_workflows
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can override or cancel workflows
CREATE POLICY "Super Admins can update all workflows" ON approval_workflows
  FOR UPDATE USING (is_super_admin(auth.uid()));

-- Super Admins can delete approval workflows
CREATE POLICY "Super Admins can delete workflows" ON approval_workflows
  FOR DELETE USING (is_super_admin(auth.uid()));

-- Platform Admins can view workflows they are part of
CREATE POLICY "Platform Admins can view assigned workflows" ON approval_workflows
  FOR SELECT USING (
    is_platform_admin(auth.uid())
    AND (
      requester_id = auth.uid()
      OR required_approvals::text LIKE '%"platform_admin"%'
    )
  );

-- School Admins can view workflows related to their school
CREATE POLICY "School Admins can view school workflows" ON approval_workflows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'school_admin'
      AND (
        p.user_id = requester_id
        OR required_approvals::text LIKE '%"school_admin"%'
      )
    )
  );

-- Participants can view workflows they need to approve
CREATE POLICY "Participants can view assigned workflows" ON approval_workflows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND (
        p.user_id = requester_id
        OR required_approvals::text LIKE '%"' || p.role || '"%'
      )
    )
  );

-- System creates approval workflows automatically
CREATE POLICY "System can create approval workflows" ON approval_workflows
  FOR INSERT WITH CHECK (true);

-- Approvers can update their approval status
CREATE POLICY "Approvers can update workflow status" ON approval_workflows
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND (
        p.user_id = requester_id
        OR required_approvals::text LIKE '%"' || p.role || '"%'
      )
    )
  );

-- ========================================
-- PARENT_STUDENTS TABLE POLICIES
-- ========================================

-- Super Admins can view all parent-student relationships
CREATE POLICY "Super Admins can view all parent-student relationships" ON parent_students
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Super Admins can manage all parent-student relationships
CREATE POLICY "Super Admins can manage all parent-student relationships" ON parent_students
  FOR ALL USING (is_super_admin(auth.uid()));

-- School Admins can view parent-student relationships in their school
CREATE POLICY "School Admins can view their school parent-student relationships" ON parent_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE s.id = parent_students.student_id
      AND p.role = 'school_admin'
      AND p.school_id = s.school_id
    )
  );

-- School Admins can manage parent-student relationships in their school
CREATE POLICY "School Admins can manage their school parent-student relationships" ON parent_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE s.id = parent_students.student_id
      AND p.role = 'school_admin'
      AND p.school_id = s.school_id
    )
  );

-- School Staff can view parent-student relationships they manage
CREATE POLICY "School Staff can view managed parent-student relationships" ON parent_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE s.id = parent_students.student_id
      AND p.role = 'school_staff'
      AND p.school_id = s.school_id
    )
  );

-- School Staff can manage parent-student relationships they manage
CREATE POLICY "School Staff can manage assigned parent-student relationships" ON parent_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE s.id = parent_students.student_id
      AND p.role = 'school_staff'
      AND p.school_id = s.school_id
    )
  );

-- Parents can view their own parent-student relationships
CREATE POLICY "Parents can view their own parent-student relationships" ON parent_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parents p
      WHERE p.user_id = auth.uid()
      AND p.id = parent_students.parent_id
    )
  );
