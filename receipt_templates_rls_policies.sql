-- RLS Policies for receipt_templates table
-- Based on HarakaPay codebase authorization patterns

-- Enable RLS on receipt_templates table
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;

-- School staff can manage receipt templates for their school
CREATE POLICY "School staff can manage receipt templates" ON receipt_templates
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.school_id = receipt_templates.school_id
        AND profiles.role IN ('school_admin', 'school_staff')
        AND profiles.is_active = true
    )
);

-- Platform admins can manage all receipt templates
CREATE POLICY "Platform admins can manage all receipt templates" ON receipt_templates
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('super_admin', 'platform_admin', 'support_admin')
        AND profiles.is_active = true
    )
);

-- Service role has full access (for admin client operations)
CREATE POLICY "Service role full access" ON receipt_templates
FOR ALL USING (auth.role() = 'service_role');

-- Optional: Parents can view receipt templates for their children's school
-- (This might be useful if parents need to see receipt formatting)
CREATE POLICY "Parents can view receipt templates" ON receipt_templates
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM parent_students ps
        JOIN parents p ON ps.parent_id = p.id
        JOIN students s ON ps.student_id = s.id
        WHERE p.user_id = auth.uid()
        AND s.school_id = receipt_templates.school_id
    )
);
