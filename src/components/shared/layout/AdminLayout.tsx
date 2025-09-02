// src/shared/layout/AdminLayout.tsx
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
