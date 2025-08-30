// src/app/school-staff/students/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { SchoolStaffStudentsView } from "@/school-staff/components/SchoolStaffStudentsView";

export default function SchoolStaffStudentsPage() {
  const { isSchoolStaff } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_staff">
      {isSchoolStaff && <SchoolStaffStudentsView />}
    </RoleBasedRoute>
  );
}
