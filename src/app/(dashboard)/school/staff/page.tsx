// src/app/(dashboard)/school/staff/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { StaffManagementView } from "./components/StaffManagementView";

export default function SchoolStaffPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <StaffManagementView />}
    </RoleBasedRoute>
  );
}


