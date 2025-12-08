"use client";

import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { SchoolPaymentFeesView } from "./components/SchoolPaymentFeesView";

export default function SchoolPaymentFeesPage() {
  return (
    <RoleBasedRoute requiredRole="school_admin">
      <SchoolPaymentFeesView />
    </RoleBasedRoute>
  );
}
