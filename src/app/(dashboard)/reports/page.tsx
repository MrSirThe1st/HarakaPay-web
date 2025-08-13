"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDualAuth } from "@/hooks/useDualAuth";

function ReportsContent() {
  const { profile } = useDualAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Platform Reports</h1>
        <p className="text-gray-600">
          Comprehensive analytics and reporting (Admin only)
        </p>
        {profile && <p className="text-sm text-gray-500">Role: Admin</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">School Performance</h2>
          <p>Analyze performance metrics across all registered schools.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Transaction Analytics</h2>
          <p>Detailed analysis of payment transactions and success rates.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Platform Usage</h2>
          <p>Monitor platform adoption and user engagement metrics.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue Reports</h2>
          <p>Track platform revenue, commissions, and financial performance.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mobile App Analytics</h2>
          <p>Parent mobile app usage and engagement statistics.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <p>Monitor system performance, uptime, and technical metrics.</p>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ReportsContent />
    </ProtectedRoute>
  );
}
