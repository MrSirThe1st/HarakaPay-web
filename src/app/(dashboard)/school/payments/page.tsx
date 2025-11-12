// src/app/school-staff/payments/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolStaffPaymentsView } from "./components/SchoolStaffPaymentsView";

export default function SchoolStaffPaymentsPage() {
  const { canAccessSchoolPanel, profile, loading } = useDualAuth();

  console.log('[PaymentsPage] Auth state:', {
    canAccessSchoolPanel,
    role: profile?.role,
    loading
  });

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel ? (
        <>
          {console.log('[PaymentsPage] Rendering SchoolStaffPaymentsView')}
          <SchoolStaffPaymentsView />
        </>
      ) : (
        <>
          {console.log('[PaymentsPage] canAccessSchoolPanel is false')}
          <div>Access Denied: You don't have school panel access</div>
        </>
      )}
    </RoleBasedRoute>
  );
}
