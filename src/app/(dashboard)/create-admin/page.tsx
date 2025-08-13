"use client";

import { useState } from "react";
import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function CreateAdminContent() {
  const { user } = useDualAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const generatePassword = () => {
    const password =
      Math.random().toString(36).slice(-8) +
      "Adm!" +
      Math.floor(Math.random() * 100);
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.credentials);
        setFormData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
        });
      } else {
        setError(result.error || "Failed to create admin account");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Admin</h1>
        <p className="text-gray-600">Create a new administrator account</p>
        {user?.isPredefined && (
          <p className="text-sm text-blue-600">
            Logged in as: Predefined Admin ({user.email})
          </p>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Admin Created Successfully!
          </h3>
          <p className="text-green-700 mb-2">
            Please provide these credentials to the new admin:
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
            The new admin can now log in with these credentials.
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
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@harakapay.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Admin..." : "Create Admin"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateAdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateAdminContent />
    </ProtectedRoute>
  );
}
