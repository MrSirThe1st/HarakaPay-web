// src/app/school-staff/students/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolStaffStudentsView } from "./components/SchoolStaffStudentsView";

export default function SchoolStaffStudentsPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <SchoolStaffStudentsView />}
    </RoleBasedRoute>
  );
}
