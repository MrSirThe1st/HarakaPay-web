"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { AdminPaymentFeesView } from "./components/AdminPaymentFeesView";

export default function PaymentFeesPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && <AdminPaymentFeesView />}
    </RoleBasedRoute>
  );
}
