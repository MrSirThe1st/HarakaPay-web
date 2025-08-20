"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import MainLayout from "@/components/layout/MainLayout";
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
      {/* Removed old top navbar and header. You can add a Carbon page header here if needed. */}

      {/* Stats Overview */}
      <section className="enterprise-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <Users className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatNumber(isAdmin ? schools : students)}</div>
              <div className="stat-label">{isAdmin ? "Active Schools" : "Students"}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(totalRevenue)}</div>
              <div className="stat-label">{isAdmin ? "Total Revenue" : "School Revenue"}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{successRate}%</div>
              <div className="stat-label">Payment Success Rate</div>
            </div>
          </div>

          {/* Additional stat card for payments */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <Clock className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{pendingPayments}</div>
              <div className="stat-label">Pending Payments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="enterprise-section">
        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="enterprise-grid">
            <Link href="/create-school" className="feature-card">
              <div className="feature-card-icon feature-card-icon-success">
                <Building2 className="w-6 h-6" />
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
                <Shield className="w-6 h-6" />
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
                <BarChart3 className="w-6 h-6" />
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
                <GraduationCap className="w-6 h-6" />
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
          <div className="enterprise-grid">
            <Link href="/students" className="feature-card">
              <div className="feature-card-icon feature-card-icon-primary">
                <GraduationCap className="w-6 h-6" />
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
                <DollarSign className="w-6 h-6" />
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
                <MessageSquare className="w-6 h-6" />
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
    <MainLayout>
      <ProtectedRoute requiredRole={["admin", "school_staff"]}>
        <DashboardContent />
      </ProtectedRoute>
    </MainLayout>
  );
}