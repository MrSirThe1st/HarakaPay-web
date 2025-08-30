// src/school-staff/layout/SchoolStaffLayout.tsx
import BaseLayout from "@/shared/layout/BaseLayout";
import SchoolStaffSidebar from "./SchoolStaffSidebar";

export function SchoolStaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout sidebar={<SchoolStaffSidebar />}>
      {children}
    </BaseLayout>
  );
}
