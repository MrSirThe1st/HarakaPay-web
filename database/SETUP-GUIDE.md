# HarakaPay Database Setup Guide

This guide will help you set up the complete database structure with RLS policies as outlined in `POLICIES-AND-STRUCTURE.md`.

## Prerequisites

1. **Supabase Project**: You need a Supabase project set up
2. **Database Access**: Access to run SQL commands in your Supabase SQL editor
3. **Auth Setup**: Basic authentication should be enabled

## Setup Steps

### Step 1: Run the Complete Database Schema

1. Open your Supabase SQL editor
2. Copy and paste the contents of `setup-complete.sql`
3. Run the script

This will:
- Drop existing tables (if any)
- Create all new tables with proper structure
- Enable RLS on all tables
- Create helper functions for role checking
- Set up triggers for `updated_at` fields

### Step 2: Apply RLS Policies

1. Copy and paste the contents of `rls-policies.sql`
2. Run the script

This will create all the Row Level Security policies that implement the access control rules from your policies document.

### Step 3: Create Initial Super Admin

1. **First, create a user in Supabase Auth**:
   - Go to Authentication > Users in your Supabase dashboard
   - Click "Add User"
   - Create a user with email and password
   - Copy the generated UUID

2. **Update the seed file**:
   - Open `seed-super-admin.sql`
   - Replace `YOUR_USER_ID_HERE` with the actual UUID from step 1
   - Run the script

### Step 4: Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'students', 'parents', 'payments', 'payment_settings', 'audit_logs', 'notifications', 'approval_workflows', 'parent_students');

-- Check if policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if helper functions exist
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname IN ('is_super_admin', 'is_platform_admin', 'is_support_admin', 'get_user_school', 'is_school_admin', 'can_access_payment_data');
```

## Database Structure Overview

### Tables Created

1. **profiles** - User profiles with role hierarchy
2. **schools** - School information with verification status
3. **parents** - Parent accounts for mobile app
4. **students** - Student records
5. **parent_students** - Junction table linking parents to students
6. **payment_settings** - Payment gateway configuration
7. **payments** - Payment records
8. **audit_logs** - System audit trail
9. **notifications** - User notifications
10. **approval_workflows** - Multi-level approval system

### Role Hierarchy

- **super_admin** - Ultimate platform control
- **platform_admin** - School onboarding and management
- **support_admin** - Data management and support
- **school_admin** - School-level control
- **school_staff** - Limited school permissions
- **parent** - Mobile app access only

### Key Features

- **Row Level Security (RLS)** on all tables
- **Role-based access control** with granular permissions
- **School isolation** - staff can only access their school's data
- **Payment transparency controls** - schools control what platform admins can see
- **Audit logging** for all actions
- **Approval workflows** for sensitive changes
- **Helper functions** for role checking

## Testing the Setup

### Test Super Admin Access

```sql
-- This should work for super admin
SELECT * FROM profiles WHERE role = 'super_admin';

-- This should work for super admin
SELECT * FROM schools;
```

### Test Role Isolation

```sql
-- Create a test school admin user
INSERT INTO profiles (user_id, first_name, last_name, role, school_id)
VALUES ('test-user-id', 'Test', 'Admin', 'school_admin', 'test-school-id');

-- This user should only see their school's data
-- (when authenticated as that user)
```

## Common Issues and Solutions

### Issue: RLS policies not working
**Solution**: Ensure RLS is enabled and policies are created correctly. Check the verification queries above.

### Issue: Helper functions not found
**Solution**: Make sure you ran the complete setup script. The functions are created in that script.

### Issue: Policies too restrictive
**Solution**: Check the policy conditions. You may need to adjust them based on your specific requirements.

### Issue: Foreign key constraints failing
**Solution**: Ensure you're inserting data in the correct order (referenced tables first).

## Next Steps

After setting up the database:

1. **Update your application code** to use the new table structure
2. **Implement the new role system** in your authentication logic
3. **Add audit logging** to your application actions
4. **Set up the approval workflow system** for payment changes
5. **Test all access patterns** to ensure security is working correctly

## Security Notes

- **Never disable RLS** on production tables
- **Test all policies thoroughly** before going live
- **Monitor audit logs** for suspicious activity
- **Regularly review permissions** and access patterns
- **Use the helper functions** for consistent role checking

## Support

If you encounter issues:

1. Check the Supabase logs for errors
2. Verify all SQL scripts ran successfully
3. Test individual policies with simple queries
4. Ensure your user has the correct role assigned

The setup implements the complete security model from your policies document, providing a robust foundation for your HarakaPay platform.
