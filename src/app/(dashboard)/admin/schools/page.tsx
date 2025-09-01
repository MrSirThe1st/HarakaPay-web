// src/app/schools/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { AdminSchoolsView } from "./components/AdminSchoolsView";

export default function SchoolsPage() {
  const { canAccessAdminPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="admin_type">
      {canAccessAdminPanel && <AdminSchoolsView />}
    </RoleBasedRoute>
  );
}
