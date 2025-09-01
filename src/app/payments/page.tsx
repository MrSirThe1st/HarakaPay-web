// DEPRECATED: This mixed role payments page has been replaced with separate admin/school payments pages
// See: src/app/(dashboard)/admin/payments/page.tsx and src/app/(dashboard)/school/payments/page.tsx

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
