// src/app/reports/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";

export default function ReportsPage() {
  const { isAdmin } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin">
      {isAdmin && (
        <div style={{ padding: "2rem 0" }}>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: 600, 
            margin: "0 0 1rem 0",
            color: "var(--cds-text-primary)"
          }}>
            Reports
          </h1>
          <p style={{ 
            fontSize: "1.125rem", 
            color: "var(--cds-text-secondary)",
            margin: "0 0 2rem 0"
          }}>
            Generate and view platform reports
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
              Platform Reports
            </h2>
            <p style={{ color: "var(--cds-text-secondary)" }}>
              Reports functionality coming soon...
            </p>
          </div>
        </div>
      )}
    </RoleBasedRoute>
  );
}
