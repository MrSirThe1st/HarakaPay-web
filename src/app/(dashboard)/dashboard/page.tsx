"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";

function DashboardContent() {
  const { user, profile, isAdmin, isSchoolStaff, signOut } = useDualAuth();

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
          <div className="page-header-actions">
            <button onClick={signOut} className="btn btn-secondary">
              Sign Out
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
              <div className="stat-value">{isAdmin ? "45" : "847"}</div>
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
              <div className="stat-value">{isAdmin ? "₣3.2M" : "₣125K"}</div>
              <div className="stat-label">Monthly Revenue</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">98.7%</div>
              <div className="stat-label">Success Rate</div>
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
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Analytics & Reports</h3>
                <p className="feature-card-description">
                  Comprehensive insights into platform performance, financial metrics, and operational data.
                </p>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            <Link href="/settings" className="feature-card">
              <div className="feature-card-icon feature-card-icon-warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">System Configuration</h3>
                <p className="feature-card-description">
                  Configure platform-wide settings, security policies, and operational parameters.
                </p>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          </div>
        )}

        {/* School Staff Dashboard */}
        {isSchoolStaff && (
          <div className="content-grid">
            <Link href="/students" className="feature-card">
              <div className="feature-card-icon feature-card-icon-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"/>
                </svg>
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">Student Management</h3>
                <p className="feature-card-description">
                  Manage student records, enrollment data, and academic information efficiently.
                </p>
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
                  Monitor fee payments, track outstanding balances, and manage financial records.
                </p>
              </div>
              <div className="feature-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          </div>
        )}
      </section>

      <style jsx>{`
        .dashboard-container {
          background: var(--color-base-bg);
          min-height: 100vh;
          font-family: var(--font-family-base);
        }

        .page-header {
          background: var(--color-base-bg-elevated);
          border-bottom: 1px solid var(--color-border);
          padding: var(--space-xl) 0;
        }

        .page-header-content {
          max-width: var(--container-max-width);
          margin: 0 auto;
          padding: 0 var(--space-xl);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .page-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-main);
          margin: 0 0 var(--space-xs) 0;
          line-height: var(--line-height-tight);
        }

        .page-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          margin: 0 0 var(--space-sm) 0;
        }

        .user-role-badge {
          display: inline-flex;
          align-items: center;
          padding: var(--space-xs) var(--space-md);
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          border: var(--input-border);
          border-radius: var(--radius-lg);
          font-family: var(--font-family-base);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-all);
        }

        .btn-secondary {
          background: var(--color-base-bg);
          color: var(--color-text-main);
          border-color: var(--color-border);
        }

        .btn-secondary:hover {
          background: var(--color-base-bg-alt);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .stats-section {
          padding: var(--space-xl) 0;
          background: var(--color-base-bg-alt);
        }

        .stats-grid {
          max-width: var(--container-max-width);
          margin: 0 auto;
          padding: 0 var(--space-xl);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .stat-card {
          background: var(--card-bg);
          border: var(--card-border);
          border-radius: var(--card-radius);
          padding: var(--card-padding);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-primary { background: var(--color-primary-light); color: var(--color-primary); }
        .stat-icon-success { background: var(--color-success-light); color: var(--color-success); }
        .stat-icon-info { background: var(--color-info-light); color: var(--color-info); }

        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-main);
          line-height: var(--line-height-tight);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: var(--font-weight-medium);
        }

        .main-content {
          max-width: none;
          margin: 0;
          padding: var(--space-3xl) var(--layout-padding-x);
          width: 100%;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--grid-gap-lg);
        }

        .feature-card {
          background: var(--card-bg);
          border: var(--card-border);
          border-radius: var(--card-radius);
          padding: var(--card-padding);
          text-decoration: none;
          color: var(--color-text-main);
          display: flex;
          align-items: flex-start;
          gap: var(--space-lg);
          transition: var(--transition-all);
          position: relative;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--card-shadow-hover);
          border-color: var(--color-border-strong);
        }

        .feature-card-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-card-icon-primary { background: var(--color-primary-light); color: var(--color-primary); }
        .feature-card-icon-success { background: var(--color-success-light); color: var(--color-success); }
        .feature-card-icon-info { background: var(--color-info-light); color: var(--color-info); }
        .feature-card-icon-warning { background: var(--color-warning-light); color: var(--color-warning); }

        .feature-card-content {
          flex: 1;
        }

        .feature-card-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-main);
          margin: 0 0 var(--space-sm) 0;
        }

        .feature-card-description {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          line-height: var(--line-height-normal);
          margin: 0;
        }

        .feature-card-arrow {
          color: var(--color-text-light);
          margin-top: var(--space-xs);
        }

        .feature-card:hover .feature-card-arrow {
          color: var(--color-primary);
          transform: translateX(2px);
        }

        @media (max-width: 768px) {
          .page-header-content {
            flex-direction: column;
            gap: var(--space-lg);
            align-items: flex-start;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
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