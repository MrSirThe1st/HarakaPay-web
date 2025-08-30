// src/shared/layout/LayoutFactory.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { AdminLayout } from "@/admin/layout/AdminLayout";
import { SchoolStaffLayout } from "@/school-staff/layout/SchoolStaffLayout";
import BaseLayout from "./BaseLayout";

export default function LayoutFactory({ children }: { children: React.ReactNode }) {
  const { isAdmin, isSchoolStaff, loading } = useDualAuth();

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
          <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
            Loading...
          </div>
        </div>
      }>
        {children}
      </BaseLayout>
    );
  }

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  if (isSchoolStaff) {
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
