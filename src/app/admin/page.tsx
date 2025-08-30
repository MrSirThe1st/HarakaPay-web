// src/app/admin/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminAdminView } from "@/admin/components/AdminAdminView";

export default function AdminPage() {
  const { isAdmin } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin">
      {isAdmin && <AdminAdminView />}
    </RoleBasedRoute>
  );
}
