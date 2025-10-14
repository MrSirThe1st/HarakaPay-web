// src/app/(dashboard)/school/store/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { StoreManagementView } from "./components/StoreManagementView";
import { StoreErrorBoundary } from "./components/StoreErrorBoundary";

export default function SchoolStorePage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && (
        <StoreErrorBoundary>
          <StoreManagementView />
        </StoreErrorBoundary>
      )}
    </RoleBasedRoute>
  );
}
