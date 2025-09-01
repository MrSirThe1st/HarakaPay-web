// Role hierarchy and permission checking utilities
export const ROLE_HIERARCHY = {
  'super_admin': 5,
  'platform_admin': 4, 
  'support_admin': 3,
  'school_admin': 2,
  'school_staff': 1
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;
export type AdminType = 'super_admin' | 'platform_admin' | 'support_admin';

// Check if user has required role level or higher
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if user has at least school_staff level access
export function hasSchoolLevelAccess(role: UserRole): boolean {
  return hasRoleLevel(role, 'school_staff');
}

// Check if user is platform-level admin or higher  
export function isPlatformAdmin(role: UserRole): boolean {
  return hasRoleLevel(role, 'platform_admin');
}

// Check if user is super admin
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

// Check if user can access specific operations
export function canPerformOperation(userRole: UserRole, operation: string): boolean {
  switch (operation) {
    case 'create_schools':
      return hasRoleLevel(userRole, 'platform_admin');
    case 'delete_schools':
      return userRole === 'super_admin';
    case 'manage_payment_settings':
      return userRole === 'super_admin';
    case 'view_audit_logs':
      return hasRoleLevel(userRole, 'support_admin');
    case 'manage_school_staff':
      return hasRoleLevel(userRole, 'school_admin');
    default:
      return false;
  }
}
