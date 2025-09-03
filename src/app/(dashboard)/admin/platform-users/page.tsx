// src/app/(dashboard)/admin/platform-users/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { PlatformUsersView } from "./components/PlatformUsersView";
import { AdminManagement } from "./components/AdminManagement";

export default function PlatformUsersPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && (
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ 
              fontSize: "2rem", 
              fontWeight: 600, 
              margin: "0 0 1rem 0",
              color: "var(--cds-text-primary)"
            }}>
              Platform Users Management
            </h1>
            <p style={{ 
              fontSize: "1.125rem", 
              color: "var(--cds-text-secondary)",
              margin: "0 0 2rem 0"
            }}>
              Create and manage platform administrators and schools
            </p>
          </div>
          
          <PlatformUsersView />
          <AdminManagement />
        </div>
      )}
    </RoleBasedRoute>
  );
}
