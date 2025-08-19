"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";

function DashboardContent() {
  const { user, profile, isAdmin, isSchoolStaff, signOut } = useDualAuth();
  const { 
    schools, 
    students, 
    totalRevenue, 
    successRate, 
    pendingPayments, 
    completedPayments,
    loading, 
    error,
    refreshStats 
  } = useDashboardStats(isAdmin, profile?.school_id);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refreshStats}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <h1 className="page-title">
              {isAdmin ? "Platform Administration" : "School Dashboard"}
            </h1>
            <p className="page-subtitle">
              Welcome back, {user?.name || user?.email?.split('@')[0]}
            </p>
            {profile && (
              <div className="user-role-badge">
                {profile.role === "admin" ? "Platform Administrator" : "School Staff"}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={refreshStats}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatNumber(isAdmin ? schools : students)}</div>
              <div className="stat-label">{isAdmin ? "Active Schools" : "Students"}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(totalRevenue)}</div>
              <div className="stat-label">{isAdmin ? "Total Revenue" : "School Revenue"}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{successRate}%</div>
              <div className="stat-label">Payment Success Rate</div>
            </div>
          </div>

          {/* Additional stat card for payments */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{pendingPayments}</div>
              <div className="stat-label">Pending Payments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="main-content">
        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="content-grid">
            <Link href="/create-school" className="feature-card">
              <div className="feature-card-icon feature-card-icon-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Register New School</h3>
                <p className="feature-card-description">
                  Onboard educational institutions to the platform with comprehensive setup and verification.
                </p>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            <Link href="/create-admin" className="feature-card">
              <div className="feature-card-icon feature-card-icon-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Create Administrator</h3>
                <p className="feature-card-description">
                  Grant platform administration privileges to trusted personnel for system oversight.
                </p>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            <Link href="/reports" className="feature-card">
              <div className="feature-card-icon feature-card-icon-info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Platform Analytics</h3>
                <p className="feature-card-description">
                  Comprehensive reports and analytics across all schools and transactions.
                </p>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            <Link href="/students" className="feature-card">
              <div className="feature-card-icon feature-card-icon-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Manage Students</h3>
                <p className="feature-card-description">
                  View and manage student records across all registered schools.
                </p>
                <div className="feature-card-stat">
                  {students} total students
                </div>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          </div>
        )}

        {/* School Dashboard */}
        {isSchoolStaff && (
          <div className="content-grid">
            <Link href="/students" className="feature-card">
              <div className="feature-card-icon feature-card-icon-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Student Management</h3>
                <p className="feature-card-description">
                  Upload student databases, manage enrollments, and track student information.
                </p>
                <div className="feature-card-stat">
                  {students} active students
                </div>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            <Link href="/payments" className="feature-card">
              <div className="feature-card-icon feature-card-icon-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Payment Tracking</h3>
                <p className="feature-card-description">
                  Monitor fee payments, track defaulters, and manage payment records.
                </p>
                <div className="feature-card-stat">
                  {completedPayments} completed • {pendingPayments} pending
                </div>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            <div className="feature-card feature-card-disabled">
              <div className="feature-card-icon feature-card-icon-secondary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Communications</h3>
                <p className="feature-card-description">
                  Send announcements and notifications to parents via the mobile app.
                </p>
                <div className="feature-card-badge">Coming Soon</div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "school_staff"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}