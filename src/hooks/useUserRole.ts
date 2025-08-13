"use client";

import { useAuth } from "./useAuth";

export function useUserRole() {
  const { profile, user, loading } = useAuth();

  const hasRole = (
    requiredRole: "admin" | "school_staff" | ("admin" | "school_staff")[]
  ) => {
    if (!profile) return false;

    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    return allowedRoles.includes(profile.role);
  };

  const isAdmin = () => hasRole("admin");
  const isSchoolStaff = () => hasRole("school_staff");

  return {
    profile,
    user,
    loading,
    hasRole,
    isAdmin,
    isSchoolStaff,
    role: profile?.role,
  };
}
