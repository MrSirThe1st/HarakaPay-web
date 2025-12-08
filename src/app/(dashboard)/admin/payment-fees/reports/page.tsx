"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { AdminPaymentFeeReportsView } from "./components/AdminPaymentFeeReportsView";

export default function PaymentFeeReportsPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && <AdminPaymentFeeReportsView />}
    </RoleBasedRoute>
  );
}
