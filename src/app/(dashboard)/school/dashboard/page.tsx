'use client';

import React from 'react';
import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolStaffDashboard } from "./components/SchoolStaffDashboard";

export default function SchoolDashboard() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <SchoolStaffDashboard />}
    </RoleBasedRoute>
  );
}
