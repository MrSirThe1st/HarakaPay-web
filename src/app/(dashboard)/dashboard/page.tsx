"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";

function DashboardContent() {
  const { user, profile, isAdmin, isSchoolStaff, signOut } = useDualAuth();

  return (
    <div
      className="container"
      style={{
        background: "var(--color-base-bg)",
        color: "var(--color-text-main)",
        fontFamily: "var(--font-family-base)",
        padding: "var(--space-lg)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header with Sign Out */}
      <div style={{ display: "flex", justifyContent: "end", marginBottom: "var(--space-md)" }}>
        <button
          onClick={signOut}
          style={{
            padding: "var(--space-sm) var(--space-md)",
            border: "none",
            fontSize: "1rem",
            fontWeight: "var(--font-weight-bold)",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            background: "var(--color-primary)",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Welcome Section */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ 
          fontSize: "var(--font-size-heading)", 
          fontWeight: "var(--font-weight-bold)", 
          color: "var(--color-text-main)", 
          margin: 0 
        }}>
          Dashboard
        </h1>
        <p className="muted">Welcome, {user?.name || user?.email}</p>
        {profile && (
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            Role: {profile.role === "school_staff" ? "School Staff" : "Admin"}
            {profile.school_id && ` | School ID: ${profile.school_id}`}
          </p>
        )}
      </div>

      {/* Admin Dashboard */}
      {isAdmin && (
        <div style={{ display: "grid", gap: "var(--space-lg)" }}>
          <div style={{
            background: "linear-gradient(90deg, #0080ff 0%, #6c63ff 100%)",
            color: "#fff",
            padding: "var(--space-lg)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-md)",
          }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "var(--font-weight-bold)", 
              marginBottom: "var(--space-xs)" 
            }}>
              Platform Administrator
            </h2>
            <p style={{ opacity: 0.9 }}>
              Manage schools, monitor transactions, and oversee the entire platform
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "var(--space-lg)" 
          }}>
            {/* Create School Card */}
            <Link 
              href="/create-school" 
              style={{ 
                background: "#fff", 
                padding: "var(--space-lg)", 
                borderRadius: "var(--radius-md)", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
                borderLeft: "4px solid #22c55e", 
                textDecoration: "none", 
                color: "var(--color-text-main)", 
                transition: "box-shadow 0.2s", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between" 
              }}
            >
              <div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "var(--font-weight-bold)", 
                  margin: 0 
                }}>
                  Create School
                </h3>
                <p className="muted" style={{ marginTop: "var(--space-sm)" }}>
                  Register new schools on the platform
                </p>
              </div>
            </Link>

            {/* Create Admin Card */}
            <Link 
              href="/create-admin" 
              style={{ 
                background: "#fff", 
                padding: "var(--space-lg)", 
                borderRadius: "var(--radius-md)", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
                borderLeft: "4px solid #0080ff", 
                textDecoration: "none", 
                color: "var(--color-text-main)", 
                transition: "box-shadow 0.2s", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between" 
              }}
            >
              <div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "var(--font-weight-bold)", 
                  margin: 0 
                }}>
                  Create Admin
                </h3>
                <p className="muted" style={{ marginTop: "var(--space-sm)" }}>
                  Add new platform administrators
                </p>
              </div>
            </Link>

            {/* Platform Reports Card */}
            <Link 
              href="/reports" 
              style={{ 
                background: "#fff", 
                padding: "var(--space-lg)", 
                borderRadius: "var(--radius-md)", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
                borderLeft: "4px solid #a259ff", 
                textDecoration: "none", 
                color: "var(--color-text-main)", 
                transition: "box-shadow 0.2s", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between" 
              }}
            >
              <div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "var(--font-weight-bold)", 
                  margin: 0 
                }}>
                  Platform Reports
                </h3>
                <p className="muted" style={{ marginTop: "var(--space-sm)" }}>
                  View comprehensive analytics
                </p>
              </div>
            </Link>

            {/* Transaction Monitoring Card */}
            <Link 
              href="/payments" 
              style={{ 
                background: "#fff", 
                padding: "var(--space-lg)", 
                borderRadius: "var(--radius-md)", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
                borderLeft: "4px solid #fbbf24", 
                textDecoration: "none", 
                color: "var(--color-text-main)", 
                transition: "box-shadow 0.2s", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between" 
              }}
            >
              <div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "var(--font-weight-bold)", 
                  margin: 0 
                }}>
                  Transaction Monitoring
                </h3>
                <p className="muted" style={{ marginTop: "var(--space-sm)" }}>
                  Monitor all platform payments
                </p>
              </div>
            </Link>

            {/* Platform Settings Card */}
            <Link 
              href="/settings" 
              style={{ 
                background: "#fff", 
                padding: "var(--space-lg)", 
                borderRadius: "var(--radius-md)", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
                borderLeft: "4px solid #ef4444", 
                textDecoration: "none", 
                color: "var(--color-text-main)", 
                transition: "box-shadow 0.2s", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between" 
              }}
            >
              <div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "var(--font-weight-bold)", 
                  margin: 0 
                }}>
                  Platform Settings
                </h3>
                <p className="muted" style={{ marginTop: "var(--space-sm)" }}>
                  Configure platform policies
                </p>
              </div>
            </Link>

            {/* Schools Overview Card */}
            <div style={{ 
              background: "#fff", 
              padding: "var(--space-lg)", 
              borderRadius: "var(--radius-md)", 
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
              borderLeft: "4px solid #6366f1", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between" 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "var(--font-weight-bold)", 
                  margin: 0 
                }}>
                  Schools Overview
                </h3>
                <p className="muted" style={{ marginTop: "var(--space-sm)" }}>
                  Quick stats and management
                </p>
                <div style={{ 
                  marginTop: "var(--space-md)", 
                  display: "grid", 
                  gap: "var(--space-xs)" 
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontSize: "0.95rem" 
                  }}>
                    <span className="muted">Active Schools:</span>
                    <span style={{ fontWeight: "var(--font-weight-bold)" }}>--</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontSize: "0.95rem" 
                  }}>
                    <span className="muted">Total Transactions:</span>
                    <span style={{ fontWeight: "var(--font-weight-bold)" }}>--</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* School Staff Dashboard */}
      {isSchoolStaff && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-4">
            <h2 className="text-2xl font-bold mb-2">School Staff Portal</h2>
            <p className="opacity-90">
              Manage your school&apos;s students, payments, and communications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student Management Card */}
            <Link
              href="/students"
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Student Management
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Manage your school&apos;s student database
                  </p>
                </div>
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </Link>

            {/* Fee Management Card */}
            <Link
              href="/payments"
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Fee Management
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Track payments and manage fees
                  </p>
                </div>
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </Link>

            {/* Quick Stats Card */}
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Quick Stats
                  </h3>
                  <p className="text-gray-600 mt-2">Your school overview</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Students:</span>
                      <span className="font-medium">--</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending Payments:</span>
                      <span className="font-medium">--</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}