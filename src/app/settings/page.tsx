// DEPRECATED: This mixed role settings page has been replaced with separate admin/school settings pages
// See: src/app/(dashboard)/admin/settings/page.tsx and src/app/(dashboard)/school/settings/page.tsx

// src/app/settings/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";

export default function SettingsPage() {
  const { canAccessAdminPanel, canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="any">
      <div style={{ padding: "2rem 0" }}>
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: 600, 
          margin: "0 0 1rem 0",
          color: "var(--cds-text-primary)"
        }}>
          Settings
        </h1>
        <p style={{ 
          fontSize: "1.125rem", 
          color: "var(--cds-text-secondary)",
          margin: "0 0 2rem 0"
        }}>
          {canAccessAdminPanel ? "Platform settings and configuration" : "School settings and preferences"}
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
            {canAccessAdminPanel ? "Platform Settings" : "School Settings"}
          </h2>
          <p style={{ color: "var(--cds-text-secondary)" }}>
            Settings configuration coming soon...
          </p>
        </div>
      </div>
    </RoleBasedRoute>
  );
}
