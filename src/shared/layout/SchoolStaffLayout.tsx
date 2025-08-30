// src/shared/layout/SchoolStaffLayout.tsx
import { BaseLayout } from "./BaseLayout";
import { SchoolStaffSidebar } from "./SchoolStaffSidebar";

export function SchoolStaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout sidebar={<SchoolStaffSidebar />}>
      {children}
    </BaseLayout>
  );
}
