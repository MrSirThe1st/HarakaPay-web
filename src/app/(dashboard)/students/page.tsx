"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function StudentsContent() {
  const { user, profile } = useAuth();
  const { isAdmin, isSchoolStaff } = useUserRole();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600">Welcome, {user?.name || user?.email}</p>
        {profile && (
          <p className="text-sm text-gray-500">
            Role: {profile.role === "school_staff" ? "School Staff" : "Admin"}
            {profile.school_id && ` | School ID: ${profile.school_id}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* School Staff Features */}
        {isSchoolStaff() && (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Student Database</h2>
              <p>
                Upload and manage student and parent databases for your school.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Fee Tracking</h2>
              <p>Track fee payments in real-time and identify defaulters.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Communications</h2>
              <p>Send bulk communications and reminders to parents.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Fee Configuration</h2>
              <p>Configure fee structures and payment methods.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Reports</h2>
              <p>Generate reports and export payment data.</p>
            </div>
          </>
        )}

        {/* Admin Features - School Management */}
        {isAdmin() && (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                School Registration
              </h2>
              <p>Register, approve, and manage schools on the platform.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Transaction Monitoring
              </h2>
              <p>Monitor transactions, platform usage, and resolve disputes.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <p>Manage user roles and permissions for school staff.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Security Policies</h2>
              <p>
                Enforce security policies, including blocking accounts if
                necessary.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
              <p>View comprehensive platform analytics and usage reports.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <StudentsContent />
    </ProtectedRoute>
  );
}
