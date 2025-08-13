"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

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
  const { isAuthenticated, loading } = useAuth();
  const { hasRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push(fallbackUrl);
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, loading, requiredRole, hasRole, router, fallbackUrl]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required role
  if (!isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
    return null;
  }

  return <>{children}</>;
}
