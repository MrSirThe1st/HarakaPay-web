// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  GraduationCap, 
  Shield, 
  Building2, 
  MessageSquare
} from "lucide-react";

function DashboardContent() {
  const dualAuth = useDualAuth();
  const profile = dualAuth?.profile;
  const isAdmin = !!dualAuth?.isAdmin;
  const isSchoolStaff = !!dualAuth?.isSchoolStaff;
  const schoolId = (profile as any)?.school_id ?? undefined;
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
  } = useDashboardStats(isAdmin, schoolId);

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
      <div className="enterprise-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-center text-lg color-text-secondary">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enterprise-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="error-message mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mb-4">{error}</p>
            </div>
            <button 
              onClick={refreshStats}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enterprise-container">
      {/* Page Header */}
      <div className="page-header-content mb-8">
        <div className="page-header-main">
          <h1 className="page-title">
            {isAdmin ? 'Platform Dashboard' : 'School Dashboard'}
          </h1>
          <p className="page-subtitle">
            {isAdmin 
              ? 'Comprehensive overview of all schools and platform metrics'
              : 'Overview of your school\'s payment activities and student data'
            }
          </p>
          <div className="user-role-badge">
            {isAdmin ? 'Platform Administrator' : 'School Staff Member'}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="enterprise-grid mb-8">
        {/* Schools Card - Admin Only */}
        {isAdmin && (
          <div className="enterprise-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm color-text-secondary mb-1">Total Schools</p>
                <p className="text-3xl font-bold color-text-main">{formatNumber(schools)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm color-text-secondary">
              <span className="text-green-600">↗ Active schools on platform</span>
            </div>
          </div>
        )}

        {/* Students Card */}
        <div className="enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm color-text-secondary mb-1">
                {isAdmin ? 'Total Students' : 'School Students'}
              </p>
              <p className="text-3xl font-bold color-text-main">{formatNumber(students)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm color-text-secondary">
            <span className="text-green-600">↗ Enrolled students</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm color-text-secondary mb-1">Total Revenue</p>
              <p className="text-3xl font-bold color-text-main">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-sm color-text-secondary">
            <span className="text-green-600">↗ Collected this month</span>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm color-text-secondary mb-1">Success Rate</p>
              <p className="text-3xl font-bold color-text-main">{successRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm color-text-secondary">
            <span className="text-green-600">↗ Payment completion rate</span>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm color-text-secondary mb-1">Pending Payments</p>
              <p className="text-3xl font-bold color-text-main">{formatNumber(pendingPayments)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-sm color-text-secondary">
            <span className="text-yellow-600">→ Awaiting processing</span>
          </div>
        </div>

        {/* Completed Payments Card */}
        <div className="enterprise-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm color-text-secondary mb-1">Completed Payments</p>
              <p className="text-3xl font-bold color-text-main">{formatNumber(completedPayments)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm color-text-secondary">
            <span className="text-green-600">↗ Successfully processed</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="enterprise-section">
        <h2 className="text-2xl font-bold color-text-main mb-6">Quick Actions</h2>
        <div className="enterprise-grid enterprise-grid-compact">
          {/* Common actions for both admin and school staff */}
          <Link href="/payments" className="enterprise-card hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-4">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold color-text-main">View Payments</h3>
                <p className="text-sm color-text-secondary">Monitor and manage payment transactions</p>
              </div>
            </div>
          </Link>

          {isSchoolStaff && (
            <Link href="/students" className="enterprise-card hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold color-text-main">Manage Students</h3>
                  <p className="text-sm color-text-secondary">Add and manage student records</p>
                </div>
              </div>
            </Link>
          )}

          {isAdmin && (
            <>
              <Link href="/schools" className="enterprise-card hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mr-4">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold color-text-main">Manage Schools</h3>
                    <p className="text-sm color-text-secondary">Approve and configure school accounts</p>
                  </div>
                </div>
              </Link>

              <Link href="/reports" className="enterprise-card hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-4">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold color-text-main">Platform Reports</h3>
                    <p className="text-sm color-text-secondary">View detailed analytics and reports</p>
                  </div>
                </div>
              </Link>
            </>
          )}

          <Link href="/settings" className="enterprise-card hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mr-4">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold color-text-main">Settings</h3>
                <p className="text-sm color-text-secondary">Configure account and system settings</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Coming Soon Features - Admin Only */}
      {isAdmin && (
        <section className="enterprise-section">
          <h2 className="text-2xl font-bold color-text-main mb-6">Coming Soon</h2>
          <div className="enterprise-grid enterprise-grid-compact">
            <div className="enterprise-card opacity-75">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-4">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold color-text-main">Communication Center</h3>
                  <p className="text-sm color-text-secondary">Bulk messaging and notification system</p>
                </div>
              </div>
              <div className="feature-card-badge">Coming Soon</div>
            </div>
          </div>
        </section>
      )}
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