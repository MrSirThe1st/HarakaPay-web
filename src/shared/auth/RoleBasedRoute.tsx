// src/components/auth/RoleBasedRoute.tsx - UPDATED FOR NEW ROLE HIERARCHY (NO PARENTS)
"use client";

import React from "react";
import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "@/types/user";

interface RoleBasedRouteProps {
  requiredRole: UserRole | UserRole[] | 'admin_type' | 'school_level' | 'any';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minRole?: UserRole; // Minimum role level required
}

export function RoleBasedRoute({ 
  requiredRole, 
  children, 
  fallback,
  minRole 
}: RoleBasedRouteProps) {
  const { 
    isSuperAdmin, 
    isPlatformAdmin, 
    isSupportAdmin, 
    isSchoolAdmin, 
    isSchoolStaff, 
    canAccessAdminPanel,
    canAccessSchoolPanel,
    hasRole,
    hasAnyRole,
    hasHigherRoleThan,
    loading, 
    isAuthenticated,
    profile,
    user
  } = useDualAuth();
  
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Check role-based access
  let hasAccess = false;

  if (requiredRole === 'admin_type') {
    hasAccess = canAccessAdminPanel;
  } else if (requiredRole === 'school_level') {
    hasAccess = canAccessSchoolPanel;
  } else if (requiredRole === 'any') {
    hasAccess = isAuthenticated;
  } else if (Array.isArray(requiredRole)) {
    hasAccess = hasAnyRole(requiredRole);
  } else {
    hasAccess = hasRole(requiredRole);
  }

  // Check minimum role level if specified
  if (minRole && hasAccess) {
    hasAccess = hasHigherRoleThan(minRole);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        padding: "2rem"
      }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Access Denied</h1>
        <p style={{ textAlign: "center", marginBottom: "2rem" }}>
          You don't have permission to access this page.
        </p>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--cds-button-primary)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
