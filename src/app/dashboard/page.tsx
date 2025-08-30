// src/app/dashboard/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminDashboard } from "@/admin/components/AdminDashboard";
import { SchoolStaffDashboard } from "@/school-staff/components/SchoolStaffDashboard";

export default function DashboardPage() {
  const { isAdmin, isSchoolStaff } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole={["admin", "school_staff"]}>
      {isAdmin ? (
        <AdminDashboard />
      ) : isSchoolStaff ? (
        <SchoolStaffDashboard />
      ) : null}
    </RoleBasedRoute>
  );
}
