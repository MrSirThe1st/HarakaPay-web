// src/app/(dashboard)/admin/payments/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminPaymentsView } from "@/admin/components/AdminPaymentsView";

export default function AdminPaymentsPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && <AdminPaymentsView />}
    </RoleBasedRoute>
  );
}
