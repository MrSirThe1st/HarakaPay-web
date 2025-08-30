// src/components/auth/RoleBasedRoute.tsx
"use client";

import React from "react";
import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleBasedRouteProps {
  requiredRole: 'admin' | 'school_staff' | 'both' | ('admin' | 'school_staff')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleBasedRoute({ 
  requiredRole, 
  children, 
  fallback 
}: RoleBasedRouteProps) {
  const { isAdmin, isSchoolStaff, loading, isAuthenticated } = useDualAuth();
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
  const hasAccess = 
    (requiredRole === 'admin' && isAdmin) ||
    (requiredRole === 'school_staff' && isSchoolStaff) ||
    (requiredRole === 'both' && (isAdmin || isSchoolStaff)) ||
    (Array.isArray(requiredRole) && requiredRole.some(role => 
      (role === 'admin' && isAdmin) || (role === 'school_staff' && isSchoolStaff)
    ));

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
