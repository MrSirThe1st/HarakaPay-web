// src/app/(dashboard)/admin/payments/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { AdminPaymentsView } from "./components/AdminPaymentsView";

export default function AdminPaymentsPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && <AdminPaymentsView />}
    </RoleBasedRoute>
  );
}
