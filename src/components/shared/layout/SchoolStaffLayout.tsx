// src/shared/layout/SchoolStaffLayout.tsx
import BaseLayout from "./BaseLayout";
import SchoolSidebar from "@/components/school/layout/SchoolSidebar";

export function SchoolStaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout sidebar={<SchoolSidebar />}>
      {children}
    </BaseLayout>
  );
}
