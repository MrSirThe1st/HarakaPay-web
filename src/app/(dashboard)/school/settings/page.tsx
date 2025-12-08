// src/app/school-staff/settings/page.tsx
"use client";

import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolStaffSettingsView } from "./components/SchoolStaffSettingsView";

export default function SchoolStaffSettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <RoleBasedRoute requiredRole="school_level">
        <SchoolStaffSettingsView />
      </RoleBasedRoute>
    </div>
  );
}
