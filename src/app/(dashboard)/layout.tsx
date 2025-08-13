import { DashboardNavigation } from "@/components/navigation/DashboardNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
