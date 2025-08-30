"use client";
import { useDualAuth } from "@/shared/hooks/useDualAuth";

export function useUserRole() {
  const { profile, user, loading, isAdmin, isSchoolStaff } = useDualAuth();

  const hasRole = (
    requiredRole: "admin" | "school_staff" | ("admin" | "school_staff")[]
  ) => {
    if (!profile) return false;
    
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    
    return allowedRoles.includes(profile.role);
  };

  // Use the optimized role checks from useDualAuth, but keep the function interface
  const isAdminRole = () => isAdmin;
  const isSchoolStaffRole = () => isSchoolStaff;

  return {
    profile,
    user,
    loading,
    hasRole,
    isAdmin: isAdminRole,
    isSchoolStaff: isSchoolStaffRole,
    role: profile?.role,
  };
}