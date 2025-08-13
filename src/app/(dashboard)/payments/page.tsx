"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function PaymentsContent() {
  const { profile, isAdmin, isSchoolStaff } = useDualAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600">Track and manage school fee payments</p>
        {profile && (
          <p className="text-sm text-gray-500">
            Role: {profile.role === "school_staff" ? "School Staff" : "Admin"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* School Staff Payment Features */}
        {isSchoolStaff && (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Tracking</h2>
              <p>
                View real-time payment status for all students in your school.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Outstanding Fees</h2>
              <p>
                Identify students with outstanding payments and send reminders.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
              <p>Configure available payment methods for your school.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Reports</h2>
              <p>Generate detailed payment reports and export data.</p>
            </div>
          </>
        )}

        {/* Admin Payment Features */}
        {isAdmin && (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Platform Transactions
              </h2>
              <p>
                Monitor all transactions across all schools on the platform.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Payment Gateway Settings
              </h2>
              <p>Configure M-Pesa, Airtel Money, Orange Money integrations.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Dispute Resolution</h2>
              <p>Handle payment disputes and transaction issues.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Revenue Analytics</h2>
              <p>View platform revenue and transaction analytics.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Commission Management
              </h2>
              <p>Manage platform commission rates and payouts to schools.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <PaymentsContent />
    </ProtectedRoute>
  );
}
