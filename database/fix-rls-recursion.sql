-- Fix RLS Recursion Issue
-- This script fixes the infinite recursion in RLS policies by making helper functions bypass RLS

-- Drop existing functions first
DROP FUNCTION IF EXISTS is_super_admin(UUID);
DROP FUNCTION IF EXISTS is_platform_admin(UUID);
DROP FUNCTION IF EXISTS is_support_admin(UUID);
DROP FUNCTION IF EXISTS get_user_school(UUID);
DROP FUNCTION IF EXISTS is_school_admin(UUID, UUID);
DROP FUNCTION IF EXISTS can_access_payment_data(UUID, UUID);
DROP FUNCTION IF EXISTS prevent_role_self_change();

-- Create a special role for RLS helper functions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rls_helper') THEN
    CREATE ROLE rls_helper;
  END IF;
END
$$;

-- Grant necessary permissions to the rls_helper role
GRANT USAGE ON SCHEMA public TO rls_helper;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rls_helper;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO rls_helper;

-- Recreate helper functions with SECURITY DEFINER and rls_helper role
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = $1 AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_platform_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = $1 AND role = 'platform_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_support_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = $1 AND role = 'support_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_school(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT school_id FROM profiles 
    WHERE user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_school_admin(user_id UUID, school_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = $1 AND role = 'school_admin' AND school_id = school_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_access_payment_data(user_id UUID, school_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admins can always access payment data
  IF is_super_admin(user_id) THEN
    RETURN true;
  END IF;
  
  -- Check if school has enabled payment transparency for platform admins
  RETURN EXISTS (
    SELECT 1 FROM schools s
    WHERE s.id = school_uuid 
    AND s.payment_transparency->>'platform_admin_access' = 'true'
    AND is_platform_admin(user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply this check if the user is not a super admin
  IF NOT is_super_admin(NEW.user_id) THEN
    -- Prevent changing own role
    IF OLD.role != NEW.role THEN
      RAISE EXCEPTION 'Users cannot change their own role';
    END IF;
    
    -- Prevent changing own admin_type
    IF OLD.admin_type != NEW.admin_type THEN
      RAISE EXCEPTION 'Users cannot change their own admin_type';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set the owner of all functions to rls_helper role
ALTER FUNCTION is_super_admin(UUID) OWNER TO rls_helper;
ALTER FUNCTION is_platform_admin(UUID) OWNER TO rls_helper;
ALTER FUNCTION is_support_admin(UUID) OWNER TO rls_helper;
ALTER FUNCTION get_user_school(UUID) OWNER TO rls_helper;
ALTER FUNCTION is_school_admin(UUID, UUID) OWNER TO rls_helper;
ALTER FUNCTION can_access_payment_data(UUID, UUID) OWNER TO rls_helper;
ALTER FUNCTION prevent_role_self_change() OWNER TO rls_helper;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_platform_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_support_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_school(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_school_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_payment_data(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION prevent_role_self_change() TO authenticated;
