"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function PaymentsContent() {
  const { profile, isAdmin, isSchoolStaff } = useDualAuth();

  return (
    <div className="enterprise-container">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <h1 className="page-title">Payment Management</h1>
            <p className="page-subtitle">Track and manage school fee payments</p>
            {profile && (
              <div className="user-role-badge">
                {profile.role === "school_staff" ? "School Staff" : "Admin"}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="enterprise-section">
        <div className="enterprise-grid">
          {/* School Staff Payment Features */}
          {isSchoolStaff && (
            <>
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-primary mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">Payment Tracking</h2>
                <p className="color-text-secondary">
                  View real-time payment status for all students in your school.
                </p>
              </div>
              
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-warning mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">Outstanding Fees</h2>
                <p className="color-text-secondary">
                  Identify students with outstanding payments and send reminders.
                </p>
              </div>
              
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-info mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">Payment Methods</h2>
                <p className="color-text-secondary">Configure available payment methods for your school.</p>
              </div>
              
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-success mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">Payment Reports</h2>
                <p className="color-text-secondary">Generate detailed payment reports and export data.</p>
              </div>
            </>
          )}

          {/* Admin Payment Features */}
          {isAdmin && (
            <>
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-primary mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">
                  Platform Transactions
                </h2>
                <p className="color-text-secondary">
                  Monitor all transactions across all schools on the platform.
                </p>
              </div>
              
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-info mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">
                  Payment Gateway Settings
                </h2>
                <p className="color-text-secondary">Configure M-Pesa, Airtel Money, Orange Money integrations.</p>
              </div>
              
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-warning mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">Dispute Resolution</h2>
                <p className="color-text-secondary">Handle payment disputes and transaction issues.</p>
              </div>
              
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-success mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">Revenue Analytics</h2>
                <p className="color-text-secondary">View platform revenue and transaction analytics.</p>
              </div>
              
              <div className="enterprise-card">
                <div className="feature-card-icon feature-card-icon-primary mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4 color-text-main">
                  Commission Management
                </h2>
                <p className="color-text-secondary">Manage platform commission rates and payouts to schools.</p>
              </div>
            </>
          )}
        </div>
      </section>
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
