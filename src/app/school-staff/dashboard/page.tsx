// src/app/school-staff/dashboard/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { SchoolStaffDashboard } from "@/school-staff/components/SchoolStaffDashboard";

export default function SchoolStaffDashboardPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <SchoolStaffDashboard />}
    </RoleBasedRoute>
  );
}
