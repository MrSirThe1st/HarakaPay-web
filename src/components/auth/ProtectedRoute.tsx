"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDualAuth } from "@/hooks/useDualAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "school_staff" | ("admin" | "school_staff")[];
  fallbackUrl?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackUrl = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, isAdmin, isSchoolStaff } = useDualAuth();
  const router = useRouter();

  const hasRequiredRole = useCallback(
    (
      role?: "admin" | "school_staff" | ("admin" | "school_staff")[]
    ): boolean => {
      if (!role) return true;

      if (Array.isArray(role)) {
        return role.some((r) => (r === "admin" ? isAdmin : isSchoolStaff));
      }

      return role === "admin" ? isAdmin : isSchoolStaff;
    },
    [isAdmin, isSchoolStaff]
  );

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push(fallbackUrl);
      return;
    }

    if (requiredRole && !hasRequiredRole(requiredRole)) {
      router.push("/unauthorized");
      return;
    }
  }, [
    isAuthenticated,
    loading,
    requiredRole,
    isAdmin,
    isSchoolStaff,
    router,
    fallbackUrl,
    hasRequiredRole,
  ]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required role
  if (!isAuthenticated || (requiredRole && !hasRequiredRole(requiredRole))) {
    return null;
  }

  return <>{children}</>;
}
