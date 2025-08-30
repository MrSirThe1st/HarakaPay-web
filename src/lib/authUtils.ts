import { createAdminClient } from './supabaseServerOnly';
import { hasRoleLevel, type UserRole } from './roleUtils';

// Get user profile using admin client (bypasses RLS)
export async function getUserProfile(userId: string) {
  const adminClient = createAdminClient();
  
  try {
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
}

// Check user permissions for specific operations
export async function checkUserPermission(
  userId: string, 
  operation: string,
  resourceId?: string
): Promise<{ allowed: boolean; profile: any; reason?: string }> {
  
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    return { allowed: false, profile: null, reason: 'Profile not found' };
  }
  
  if (!profile.is_active) {
    return { allowed: false, profile, reason: 'Account inactive' };
  }
  
  // Handle different operation types
  switch (operation) {
    case 'view_all_schools':
      return { 
        allowed: hasRoleLevel(profile.role, 'support_admin'), 
        profile 
      };
      
    case 'create_schools':
      return { 
        allowed: hasRoleLevel(profile.role, 'platform_admin'), 
        profile 
      };
      
    case 'delete_schools':
      return { 
        allowed: profile.role === 'super_admin', 
        profile 
      };
      
    case 'view_payment_data':
      // Super admins can always see payment data
      if (profile.role === 'super_admin') {
        return { allowed: true, profile };
      }
      
      // Platform admins need transparency permission
      if (profile.role === 'platform_admin' && resourceId) {
        const adminClient = createAdminClient();
        const { data: school } = await adminClient
          .from('schools')
          .select('payment_transparency')
          .eq('id', resourceId)
          .single();
          
        return { 
          allowed: school?.payment_transparency?.platform_admin_access === true, 
          profile,
          reason: school?.payment_transparency?.platform_admin_access ? undefined : 'School has not enabled transparency'
        };
      }
      
      // School staff can see their own school's payment data
      if (profile.role in ['school_admin', 'school_staff'] && profile.school_id === resourceId) {
        return { allowed: true, profile };
      }
      
      return { allowed: false, profile, reason: 'Insufficient permissions for payment data' };
      
    case 'manage_school_staff':
      return { 
        allowed: profile.role === 'school_admin', 
        profile,
        reason: profile.role === 'school_admin' ? undefined : 'Only school admins can manage staff'
      };
      
    case 'access_admin_panel':
      return {
        allowed: hasRoleLevel(profile.role, 'support_admin'),
        profile,
        reason: hasRoleLevel(profile.role, 'support_admin') ? undefined : 'Admin panel requires admin role'
      };
      
    case 'access_school_panel':
      return {
        allowed: hasRoleLevel(profile.role, 'school_staff'),
        profile,
        reason: hasRoleLevel(profile.role, 'school_staff') ? undefined : 'School panel requires school staff role'
      };
      
    default:
      return { allowed: false, profile, reason: 'Unknown operation' };
  }
}
