// src/app/(dashboard)/school/fees/receipts/designer/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { ReceiptDesigner } from "./components/ReceiptDesigner";

export default function ReceiptDesignerPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <ReceiptDesigner />}
    </RoleBasedRoute>
  );
}
