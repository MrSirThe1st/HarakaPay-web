// src/admin/layout/AdminLayout.tsx
import BaseLayout from "@/shared/layout/BaseLayout";
import AdminSidebar from "./AdminSidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout sidebar={<AdminSidebar />}>
      {children}
    </BaseLayout>
  );
}
