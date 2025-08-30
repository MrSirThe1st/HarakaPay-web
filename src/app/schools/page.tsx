// src/app/schools/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminStudentsView } from "@/admin/components/AdminStudentsView";

export default function SchoolsPage() {
  const { isAdmin } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin">
      {isAdmin && <AdminStudentsView />}
    </RoleBasedRoute>
  );
}
