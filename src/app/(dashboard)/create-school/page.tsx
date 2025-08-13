"use client";

import { useState } from "react";
import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function CreateSchoolContent() {
  const { user } = useDualAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    schoolName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    registrationNumber: "",
    contactFirstName: "",
    contactLastName: "",
  });

  const generatePassword = () => {
    const password =
      Math.random().toString(36).slice(-8) +
      "Sch!" +
      Math.floor(Math.random() * 100);
    setFormData((prev) => ({ ...prev, adminPassword: password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/create-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.schoolName,
          address: formData.address,
          contactFirstName: formData.contactFirstName || "",
          contactLastName: formData.contactLastName || "",
          contactPhone: formData.contactPhone,
          registrationNumber: formData.registrationNumber || "",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.credentials);
        setFormData({
          schoolName: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          adminEmail: "",
          adminPassword: "",
        });
      } else {
        setError(result.error || "Failed to create school");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New School</h1>
        <p className="text-gray-600">
          Register a new school and create their admin account
        </p>
        {user?.isPredefined && (
          <p className="text-sm text-blue-600">
            Logged in as: Predefined Admin ({user.email})
          </p>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            School Created Successfully!
          </h3>
          <p className="text-green-700 mb-2">
            Please provide these credentials to the school:
          </p>
          <div className="bg-white p-3 rounded border">
            <p>
              <strong>Email:</strong> {success.email}
            </p>
            <p>
              <strong>Password:</strong> {success.password}
            </p>
          </div>
          <p className="text-sm text-green-600 mt-2">
            The school can now log in with these credentials to access their
            dashboard.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name *
            </label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, schoolName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactEmail: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactPhone: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            School Admin Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email *
              </label>
              <input
                type="email"
                required
                value={formData.adminEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    adminEmail: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@schoolname.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.adminPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adminPassword: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating School..." : "Create School"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateSchoolPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateSchoolContent />
    </ProtectedRoute>
  );
}
