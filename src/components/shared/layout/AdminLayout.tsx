// src/shared/layout/AdminLayout.tsx
import BaseLayout from "@/components/shared/layout/BaseLayout";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout sidebar={<AdminSidebar />}>
      {children}
    </BaseLayout>
  );
}
