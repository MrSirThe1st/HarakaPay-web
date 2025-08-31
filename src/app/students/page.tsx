// src/app/students/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { SchoolStaffStudentsView } from "@/school-staff/components/SchoolStaffStudentsView";

export default function StudentsPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <SchoolStaffStudentsView />}
    </RoleBasedRoute>
  );
}
