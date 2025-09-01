// src/app/(dashboard)/admin/platform-users/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminAdminView } from "./components/AdminAdminView";
import { CreateSchoolView } from "./components/CreateSchoolView";

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
          
          <AdminAdminView />
          <CreateSchoolView />
        </div>
      )}
    </RoleBasedRoute>
  );
}
