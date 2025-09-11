export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole = 
  | "super_admin" 
  | "platform_admin" 
  | "support_admin" 
  | "school_admin" 
  | "school_staff"
  | "parent";

export type AdminType = 
  | "super_admin" 
  | "platform_admin" 
  | "support_admin";

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  admin_type?: AdminType | null;
  school_id?: string; // School staff, school admin will be associated with a specific school
  phone?: string;
  avatar_url?: string;
  permissions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Helper types for role checking
export interface RolePermissions {
  canManageUsers: boolean;
  canManageSchools: boolean;
  canManagePayments: boolean;
  canViewPaymentData: boolean;
  canManageSystemSettings: boolean;
  canAccessAdminPanel: boolean;
  canAccessSchoolPanel: boolean;
}

// Role hierarchy constants
export const ROLE_HIERARCHY = {
  super_admin: 5,
  platform_admin: 4,
  support_admin: 3,
  school_admin: 2,
  school_staff: 1,
} as const;

// Note: Role hierarchy checking is handled by hasRoleLevel() in src/lib/roleUtils.ts

// Helper function to check if user is an admin type
export function isAdminType(role: UserRole): role is AdminType {
  return ['super_admin', 'platform_admin', 'support_admin'].includes(role);
}

// Helper function to check if user is school level
export function isSchoolLevel(role: UserRole): boolean {
  return ['school_admin', 'school_staff'].includes(role);
}
