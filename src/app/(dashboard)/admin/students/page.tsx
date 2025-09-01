// src/app/(dashboard)/admin/students/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { AdminStudentsView } from "./components/AdminStudentsView";

export default function AdminStudentsPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && <AdminStudentsView />}
    </RoleBasedRoute>
  );
}
