// src/app/(dashboard)/school/fees/receipts/page.tsx
"use client";

import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/components/shared/auth/RoleBasedRoute";
import { ReceiptTemplatesList } from "./components/ReceiptTemplatesList";

export default function ReceiptTemplatesPage() {
  const { canAccessSchoolPanel } = useDualAuth();

  return (
    <RoleBasedRoute requiredRole="school_level">
      {canAccessSchoolPanel && <ReceiptTemplatesList />}
    </RoleBasedRoute>
  );
}
