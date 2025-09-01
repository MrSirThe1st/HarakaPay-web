// src/shared/layout/LayoutFactory.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { AdminLayout } from "./AdminLayout";
import { SchoolStaffLayout } from "./SchoolStaffLayout";
import BaseLayout from "./BaseLayout";

export default function LayoutFactory({ children }: { children: React.ReactNode }) {
  const { canAccessAdminPanel, canAccessSchoolPanel, loading } = useDualAuth();

  if (loading) {
    return (
      <BaseLayout sidebar={
        <div style={{
          width: 64,
          position: "fixed",
          height: "100vh",
          top: 48,
          backgroundColor: "var(--cds-layer)",
          borderRight: "1px solid var(--cds-border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ fontSize: "12px", color: "var(--cds-border-subtle)" }}>
            Loading...
          </div>
        </div>
      }>
        {children}
      </BaseLayout>
    );
  }

  if (canAccessAdminPanel) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  if (canAccessSchoolPanel) {
    return <SchoolStaffLayout>{children}</SchoolStaffLayout>;
  }

  // Fallback for unauthenticated users - minimal layout without navigation
  return (
    <BaseLayout sidebar={
      <div style={{
        width: 64,
        position: "fixed",
        height: "100vh",
        top: 48,
        backgroundColor: "var(--cds-layer)",
        borderRight: "1px solid var(--cds-border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
          Login Required
        </div>
      </div>
    }>
      {children}
    </BaseLayout>
  );
}
