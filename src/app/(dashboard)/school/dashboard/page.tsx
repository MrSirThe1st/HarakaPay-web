'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";

// Lazy load dashboard component for better code splitting
const SchoolStaffDashboard = dynamic(() => import("./components/SchoolStaffDashboard").then(mod => ({ default: mod.SchoolStaffDashboard })), {
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

export default function SchoolDashboard() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <SchoolStaffDashboard />}
    </RoleBasedRoute>
  );
}
