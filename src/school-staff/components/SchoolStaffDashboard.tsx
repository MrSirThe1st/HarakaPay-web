// src/components/dashboard/SchoolStaffDashboard.tsx
"use client";

import React from "react";
import { useDashboardStats } from "@/shared/hooks/useDashboardStats";
import { useDualAuth } from "@/shared/hooks/useDualAuth";
import Link from "next/link";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  Tag,
  ProgressBar
} from "@carbon/react";
import { 
  Dashboard as DashboardIcon,
  ChartLine,
  Money,
  UserMultiple,
  CheckmarkFilled,
  Time,
  ArrowUpRight,
  ArrowRight,
  Education
} from "@carbon/icons-react";

export function SchoolStaffDashboard() {
  const { user, profile } = useDualAuth();
  const schoolId = profile?.school_id;
  
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
  } = useDashboardStats(false, schoolId); // canAccessAdminPanel = false, with schoolId

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

  // Mock recent activity data for school staff
  const recentActivity = [
    { id: 1, type: "payment", description: "Payment received from Marie Kalombo", amount: 50000, time: "2 hours ago", status: "success" },
    { id: 2, type: "student", description: "New student Jean Mukendi registered", time: "3 hours ago", status: "info" },
    { id: 3, type: "payment", description: "Payment failed for Grace Mbuyi", amount: 75000, time: "5 hours ago", status: "error" },
    { id: 4, type: "system", description: "Weekly school report generated", time: "1 day ago", status: "info" }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <Money size={16} style={{ color: "var(--cds-support-success)" }} />;
      case "student":
        return <UserMultiple size={16} style={{ color: "var(--cds-support-info)" }} />;
      case "system":
        return <Education size={16} style={{ color: "var(--cds-support-caution)" }} />;
      default:
        return <DashboardIcon size={16} style={{ color: "var(--cds-icon-secondary)" }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem 0" }}>
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ width: "300px", height: "2rem", background: "#e5e7eb", borderRadius: "4px" }}></div>
          <div style={{ width: "500px", height: "1.5rem", background: "#e5e7eb", borderRadius: "4px", marginTop: "1rem" }}></div>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem 0" }}>
        <div style={{ 
          padding: "1rem", 
          background: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: "4px",
          color: "#dc2626"
        }}>
          Error loading dashboard: {error}
        </div>
        <Button kind="ghost" size="sm" onClick={refreshStats} style={{ marginTop: "1rem" }}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 0" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "1rem" 
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <DashboardIcon 
              size={32} 
              style={{ 
                marginRight: "1rem", 
                color: "var(--cds-icon-primary)" 
              }} 
            />
            <div>
              <h1 style={{ 
                fontSize: "2.5rem", 
                fontWeight: 600, 
                margin: 0,
                color: "var(--cds-text-primary)"
              }}>
                School Dashboard
              </h1>
              <p style={{ 
                fontSize: "1.125rem", 
                color: "var(--cds-text-secondary)",
                margin: "0.5rem 0 0 0"
              }}>
                Overview of your school's payment activities and student data
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Button kind="ghost" size="sm" onClick={refreshStats}>
              Refresh
            </Button>
            <Button kind="secondary" size="sm">
              Export
            </Button>
          </div>
        </div>

        {/* School Staff Welcome Card */}
        <Tile style={{ 
          padding: "1.5rem",
          border: "1px solid var(--cds-border-subtle)",
          background: "var(--cds-layer-accent)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--cds-layer)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--cds-border-subtle)"
              }}>
                <Education size={24} style={{ color: "var(--cds-icon-primary)" }} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: "1.125rem", 
                  fontWeight: 600, 
                  margin: "0 0 0.25rem 0",
                  color: "var(--cds-text-primary)"
                }}>
                  Welcome back, {user?.email?.split('@')[0]}!
                </h3>
                <p style={{ 
                  color: "var(--cds-text-secondary)", 
                  margin: 0,
                  fontSize: "0.875rem"
                }}>
                  Last login: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <Tag type="blue" size="sm">School Staff Member</Tag>
          </div>
        </Tile>
      </div>

      {/* Statistics Grid */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: 600, 
          marginBottom: "1.5rem",
          color: "var(--cds-text-primary)"
        }}>
          School Metrics
        </h2>
        
        <Grid>
          {/* Students Card */}
          <Column lg={4} md={4} sm={2}>
            <Tile style={{ 
              padding: "2rem",
              border: "1px solid var(--cds-border-subtle)",
              height: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            className="dashboard-metric-tile">
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "1.5rem"
              }}>
                <div>
                  <p style={{ 
                    fontSize: "0.875rem", 
                    color: "var(--cds-text-secondary)",
                    margin: "0 0 0.5rem 0"
                  }}>
                    School Students
                  </p>
                  <p style={{ 
                    fontSize: "2.5rem", 
                    fontWeight: 600, 
                    margin: 0,
                    color: "var(--cds-text-primary)"
                  }}>
                    {formatNumber(students)}
                  </p>
                </div>
                <div style={{
                  padding: "1rem",
                  borderRadius: "50%",
                  background: "var(--cds-support-success-inverse)",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <UserMultiple size={24} style={{ color: "var(--cds-support-success)" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ArrowUpRight size={16} style={{ color: "var(--cds-support-success)" }} />
                <Tag type="green" size="sm">Enrolled students</Tag>
              </div>
            </Tile>
          </Column>

          {/* Revenue Card */}
          <Column lg={4} md={4} sm={2}>
            <Tile style={{ 
              padding: "2rem",
              border: "1px solid var(--cds-border-subtle)",
              height: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            className="dashboard-metric-tile">
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "1.5rem"
              }}>
                <div>
                  <p style={{ 
                    fontSize: "0.875rem", 
                    color: "var(--cds-text-secondary)",
                    margin: "0 0 0.5rem 0"
                  }}>
                    School Revenue
                  </p>
                  <p style={{ 
                    fontSize: "2.5rem", 
                    fontWeight: 600, 
                    margin: 0,
                    color: "var(--cds-text-primary)"
                  }}>
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div style={{
                  padding: "1rem",
                  borderRadius: "50%",
                  background: "var(--cds-support-success-inverse)",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <Money size={24} style={{ color: "var(--cds-support-success)" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ArrowUpRight size={16} style={{ color: "var(--cds-support-success)" }} />
                <Tag type="green" size="sm">↗ +12% this month</Tag>
              </div>
            </Tile>
          </Column>

          {/* Success Rate Card */}
          <Column lg={4} md={4} sm={2}>
            <Tile style={{ 
              padding: "2rem",
              border: "1px solid var(--cds-border-subtle)",
              height: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            className="dashboard-metric-tile">
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "1.5rem"
              }}>
                <div>
                  <p style={{ 
                    fontSize: "0.875rem", 
                    color: "var(--cds-text-secondary)",
                    margin: "0 0 0.5rem 0"
                  }}>
                    Success Rate
                  </p>
                  <p style={{ 
                    fontSize: "2.5rem", 
                    fontWeight: 600, 
                    margin: 0,
                    color: "var(--cds-text-primary)"
                  }}>
                    {successRate.toFixed(1)}%
                  </p>
                </div>
                <div style={{
                  padding: "1rem",
                  borderRadius: "50%",
                  background: "var(--cds-support-info-inverse)",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <ChartLine size={24} style={{ color: "var(--cds-support-info)" }} />
                </div>
              </div>
              <ProgressBar 
                value={successRate} 
                max={100}
                size="sm"
                helperText="Payment completion rate"
              />
            </Tile>
          </Column>

          {/* Pending Payments Card */}
          <Column lg={4} md={4} sm={2}>
            <Tile style={{ 
              padding: "2rem",
              border: "1px solid var(--cds-border-subtle)",
              height: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            className="dashboard-metric-tile">
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "1.5rem"
              }}>
                <div>
                  <p style={{ 
                    fontSize: "0.875rem", 
                    color: "var(--cds-text-secondary)",
                    margin: "0 0 0.5rem 0"
                  }}>
                    Pending Payments
                  </p>
                  <p style={{ 
                    fontSize: "2.5rem", 
                    fontWeight: 600, 
                    margin: 0,
                    color: "var(--cds-text-primary)"
                  }}>
                    {formatNumber(pendingPayments)}
                  </p>
                </div>
                <div style={{
                  padding: "1rem",
                  borderRadius: "50%",
                  background: "var(--cds-support-warning-inverse)",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <Time size={24} style={{ color: "var(--cds-support-warning)" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Time size={16} style={{ color: "var(--cds-support-warning)" }} />
                <Tag type="cyan" size="sm">Awaiting processing</Tag>
              </div>
            </Tile>
          </Column>
        </Grid>
      </div>

      {/* Main Content Grid */}
      <Grid>
        {/* Recent Activity */}
        <Column lg={8} md={6} sm={4}>
          <Tile style={{ 
            padding: "2rem",
            border: "1px solid var(--cds-border-subtle)",
            height: "100%"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "1.5rem"
            }}>
              <h3 style={{ 
                fontSize: "1.25rem", 
                fontWeight: 600, 
                margin: 0,
                color: "var(--cds-text-primary)"
              }}>
                Recent Activity
              </h3>
              <Button kind="ghost" size="sm" renderIcon={ArrowRight}>
                View All
              </Button>
            </div>

            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "1rem" 
            }}>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  background: "var(--cds-layer)",
                  borderRadius: "8px",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <div style={{ marginRight: "1rem" }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      margin: "0 0 0.25rem 0", 
                      color: "var(--cds-text-primary)",
                      fontSize: "0.875rem"
                    }}>
                      {activity.description}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      color: "var(--cds-text-secondary)",
                      fontSize: "0.75rem"
                    }}>
                      {activity.time}
                    </p>
                  </div>
                  {activity.amount && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ 
                        margin: 0, 
                        fontWeight: 600,
                        color: "var(--cds-text-primary)"
                      }}>
                        {formatCurrency(activity.amount)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Tile>
        </Column>

        {/* Quick Actions */}
        <Column lg={8} md={6} sm={4}>
          <Tile style={{ 
            padding: "2rem",
            border: "1px solid var(--cds-border-subtle)",
            height: "100%"
          }}>
            <h3 style={{ 
              fontSize: "1.25rem", 
              fontWeight: 600, 
              marginBottom: "1.5rem",
              color: "var(--cds-text-primary)"
            }}>
              Quick Actions
            </h3>

            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "1rem" 
            }}>
              <Link href="/payments" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  background: "var(--cds-layer)",
                  borderRadius: "8px",
                  border: "1px solid var(--cds-border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                className="quick-action-item">
                  <div style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: "var(--cds-support-success-inverse)",
                    marginRight: "1rem"
                  }}>
                    <Money size={20} style={{ color: "var(--cds-support-success)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: "0 0 0.25rem 0", 
                      color: "var(--cds-text-primary)" 
                    }}>
                      View Payments
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      color: "var(--cds-text-secondary)",
                      fontSize: "0.875rem"
                    }}>
                      Monitor payment transactions
                    </p>
                  </div>
                  <ArrowRight size={16} style={{ color: "var(--cds-icon-secondary)" }} />
                </div>
              </Link>

              <Link href="/students" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  background: "var(--cds-layer)",
                  borderRadius: "8px",
                  border: "1px solid var(--cds-border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                className="quick-action-item">
                  <div style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: "var(--cds-support-info-inverse)",
                    marginRight: "1rem"
                  }}>
                    <UserMultiple size={20} style={{ color: "var(--cds-support-info)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: "0 0 0.25rem 0", 
                      color: "var(--cds-text-primary)" 
                    }}>
                      Manage Students
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      color: "var(--cds-text-secondary)",
                      fontSize: "0.875rem"
                    }}>
                      Add and manage student records
                    </p>
                  </div>
                  <ArrowRight size={16} style={{ color: "var(--cds-icon-secondary)" }} />
                </div>
              </Link>

              <Link href="/settings" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  background: "var(--cds-layer)",
                  borderRadius: "8px",
                  border: "1px solid var(--cds-border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                className="quick-action-item">
                  <div style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: "var(--cds-layer-accent)",
                    marginRight: "1rem",
                    border: "1px solid var(--cds-border-subtle)"
                  }}>
                    <DashboardIcon size={20} style={{ color: "var(--cds-icon-primary)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: "0 0 0.25rem 0", 
                      color: "var(--cds-text-primary)" 
                    }}>
                      School Settings
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      color: "var(--cds-text-secondary)",
                      fontSize: "0.875rem"
                    }}>
                      Configure your school account
                    </p>
                  </div>
                  <ArrowRight size={16} style={{ color: "var(--cds-icon-secondary)" }} />
                </div>
              </Link>
            </div>
          </Tile>
        </Column>
      </Grid>

      {/* Custom Styles */}
      <style jsx>{`
        .dashboard-metric-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .quick-action-item:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
