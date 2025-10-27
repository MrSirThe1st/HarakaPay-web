"use client";

import React from "react";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolRequestsView } from "./components/SchoolRequestsView";

export default function SchoolRequestsPage() {
  return (
    <RoleBasedRoute requiredRole="admin_type">
      <SchoolRequestsView />
    </RoleBasedRoute>
  );
}

