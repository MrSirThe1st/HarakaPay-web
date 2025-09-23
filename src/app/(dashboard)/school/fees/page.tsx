// src/app/(dashboard)/school/fees/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolStaffFeesView } from "./components/SchoolStaffFeesView";

export default function SchoolStaffFeesPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <SchoolStaffFeesView />}
    </RoleBasedRoute>
  );
}
