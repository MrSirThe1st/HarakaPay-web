// src/app/school-staff/payments/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolStaffPaymentsView } from "./components/SchoolStaffPaymentsView";

export default function SchoolStaffPaymentsPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel ? (
        <SchoolStaffPaymentsView />
      ) : (
        <div>Access Denied: You don&apos;t have school panel access</div>
      )}
    </RoleBasedRoute>
  );
}
