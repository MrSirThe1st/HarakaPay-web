// DEPRECATED: This students page has been replaced with separate admin/school students pages
// See: src/app/(dashboard)/admin/students/page.tsx and src/app/(dashboard)/school/students/page.tsx

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
