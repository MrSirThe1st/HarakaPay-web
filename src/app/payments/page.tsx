// src/app/payments/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminPaymentsView } from "@/admin/components/AdminPaymentsView";
import { SchoolStaffPaymentsView } from "@/school-staff/components/SchoolStaffPaymentsView";

export default function PaymentsPage() {
  const { canAccessAdminPanel, canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="any">
      {canAccessAdminPanel ? (
        <AdminPaymentsView />
      ) : canAccessSchoolPanel ? (
        <SchoolStaffPaymentsView />
      ) : null}
    </RoleBasedRoute>
  );
}
