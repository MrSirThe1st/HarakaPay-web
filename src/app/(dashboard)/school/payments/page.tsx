// src/app/school-staff/payments/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { SchoolStaffPaymentsView } from "./components/SchoolStaffPaymentsView";

export default function SchoolStaffPaymentsPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <SchoolStaffPaymentsView />}
    </RoleBasedRoute>
  );
}
