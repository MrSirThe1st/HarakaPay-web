// src/app/school-staff/communications/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolStaffCommunicationsView } from "./components/SchoolStaffCommunicationsView";

export default function SchoolStaffCommunicationsPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <SchoolStaffCommunicationsView />}
    </RoleBasedRoute>
  );
}
