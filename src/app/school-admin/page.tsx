import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SchoolAdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="school_staff">
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">School Admin Dashboard</h1>
        <p>Welcome! Here you can manage your school&apos;s information, students, payments, reports, and settings.</p>
        {/* Add dashboard navigation and components here */}
      </main>
    </ProtectedRoute>
  );
}
