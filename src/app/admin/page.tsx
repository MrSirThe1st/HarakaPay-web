// src/app/admin/page.tsx - UPDATED FOR NEW ROLE HIERARCHY
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminAdminView } from "@/admin/components/AdminAdminView";

export default function AdminPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && <AdminAdminView />}
    </RoleBasedRoute>
  );
}
