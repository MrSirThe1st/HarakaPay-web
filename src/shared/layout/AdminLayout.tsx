// src/shared/layout/AdminLayout.tsx
import { BaseLayout } from "./BaseLayout";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout sidebar={<AdminSidebar />}>
      {children}
    </BaseLayout>
  );
}
