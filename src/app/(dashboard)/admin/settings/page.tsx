// src/app/(dashboard)/admin/settings/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";

export default function AdminSettingsPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && (
        <div style={{ padding: "2rem 0" }}>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: 600, 
            margin: "0 0 1rem 0",
            color: "var(--cds-text-primary)"
          }}>
            Platform Settings
          </h1>
          <p style={{ 
            fontSize: "1.125rem", 
            color: "var(--cds-text-secondary)",
            margin: "0 0 2rem 0"
          }}>
            Platform settings and configuration
          </p>
          
          <div style={{
            padding: "2rem",
            border: "1px solid var(--cds-border-subtle)",
            borderRadius: "8px",
            background: "var(--cds-layer)"
          }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 600, 
              margin: "0 0 1rem 0",
              color: "var(--cds-text-primary)"
            }}>
              Platform Configuration
            </h2>
            <p style={{ color: "var(--cds-text-secondary)" }}>
              Platform settings configuration coming soon...
            </p>
          </div>
        </div>
      )}
    </RoleBasedRoute>
  );
}
