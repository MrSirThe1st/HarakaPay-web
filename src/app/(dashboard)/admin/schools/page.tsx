// src/app/schools/page.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminSchoolsView } from "./components/AdminSchoolsView";

export default function SchoolsPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && <AdminSchoolsView />}
    </RoleBasedRoute>
  );
}
