// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  Tag,
  SkeletonPlaceholder,
  SkeletonText,
  InlineNotification,
  ProgressBar,
  OverflowMenu,
  OverflowMenuItem,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from "@carbon/react";
import { 
  Dashboard as DashboardIcon,
  ChartLine,
  Money,
  UserMultiple,
  CheckmarkFilled,
  Time,
  Warning,
  ArrowUpRight,
  ArrowRight,
  Add,
  View,
  Download,
  Report
} from "@carbon/icons-react";

function DashboardContent() {
  const dualAuth = useDualAuth();
  const profile = dualAuth?.profile;
  const isAdmin = !!dualAuth?.isAdmin;
  const isSchoolStaff = !!dualAuth?.isSchoolStaff;
  const user = dualAuth?.user;
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

  // Mock recent activity data
  const recentActivity = [
    { id: 1, type: "payment", description: "Payment received from Marie Kalombo", amount: 50000, time: "2 hours ago", status: "success" },
    { id: 2, type: "student", description: "New student Jean Mukendi registered", time: "3 hours ago", status: "info" },
    { id: 3, type: "payment", description: "Payment failed for Grace Mbuyi", amount: 75000, time: "5 hours ago", status: "error" },
    { id: 4, type: "system", description: "Weekly report generated", time: "1 day ago", status: "info" }
  ];

  const getUserRole = () => {
    if (isAdmin) return "Platform Administrator";
    if (isSchoolStaff) return "School Staff Member";
    return "User";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <Money size={16} style={{ color: "var(--cds-support-success)" }} />;
      case "student":
        return <UserMultiple size={16} style={{ color: "var(--cds-support-info)" }} />;
      case "system":
        return <Report size={16} style={{ color: "var(--cds-support-caution)" }} />;
      default:
        return <View size={16} style={{ color: "var(--cds-icon-secondary)" }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem 0" }}>
        {/* Loading Header */}
        <div style={{ marginBottom: "3rem" }}>
          <SkeletonText width="300px" />
          <SkeletonText width="500px" />
        </div>

        {/* Loading Stats Grid */}
        <Grid style={{ marginBottom: "3rem" }}>
          {[1, 2, 3, 4].map((_, index) => (
            <Column key={index} lg={4} md={4} sm={2}>
              <Tile style={{ padding: "2rem", border: "1px solid var(--cds-border-subtle)" }}>
                <SkeletonPlaceholder style={{ width: "48px", height: "48px", marginBottom: "1rem" }} />
                <SkeletonText width="120px" />
                <SkeletonText width="80px" />
              </Tile>
            </Column>
          ))}
        </Grid>

        {/* Loading Content */}
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <Tile style={{ padding: "2rem", border: "1px solid var(--cds-border-subtle)" }}>
              <SkeletonText width="200px" />
              <SkeletonText />
              <SkeletonText />
              <SkeletonText />
            </Tile>
          </Column>
          <Column lg={8} md={6} sm={4}>
            <Tile style={{ padding: "2rem", border: "1px solid var(--cds-border-subtle)" }}>
              <SkeletonText width="200px" />
              <SkeletonText />
              <SkeletonText />
              <SkeletonText />
            </Tile>
          </Column>
        </Grid>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem 0" }}>
        <InlineNotification
          kind="error"
          title="Error loading dashboard"
          subtitle={error}
        />
        <Button kind="ghost" size="sm" onClick={refreshStats} renderIcon={View} style={{ marginTop: "1rem" }}>
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
                {isAdmin ? 'Platform Dashboard' : 'School Dashboard'}
              </h1>
              <p style={{ 
                fontSize: "1.125rem", 
                color: "var(--cds-text-secondary)",
                margin: "0.5rem 0 0 0"
              }}>
                {isAdmin 
                  ? 'Comprehensive overview of all schools and platform metrics'
                  : 'Overview of your school\'s payment activities and student data'
                }
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Button kind="ghost" size="sm" renderIcon={View} onClick={refreshStats}>
              Refresh
            </Button>
            <Button kind="secondary" size="sm" renderIcon={Download}>
              Export
            </Button>
          </div>
        </div>

        {/* User Welcome Card */}
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
                <UserMultiple size={24} style={{ color: "var(--cds-icon-primary)" }} />
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
            <Tag type="blue" size="sm">{getUserRole()}</Tag>
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
          Key Metrics
        </h2>
        
        <Grid>
          {/* Schools Card - Admin Only */}
          {isAdmin && (
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
                      Total Schools
                    </p>
                    <p style={{ 
                      fontSize: "2.5rem", 
                      fontWeight: 600, 
                      margin: 0,
                      color: "var(--cds-text-primary)"
                    }}>
                      {formatNumber(schools)}
                    </p>
                  </div>
                  <div style={{
                    padding: "1rem",
                    borderRadius: "50%",
                    background: "var(--cds-support-info-inverse)",
                    border: "1px solid var(--cds-border-subtle)"
                  }}>
                    <UserMultiple size={24} style={{ color: "var(--cds-support-info)" }} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ArrowUpRight size={16} style={{ color: "var(--cds-support-success)" }} />
                  <Tag type="green" size="sm">Active platforms</Tag>
                </div>
              </Tile>
            </Column>
          )}

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
                    {isAdmin ? 'Total Students' : 'School Students'}
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
                    Total Revenue
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

          {/* Completed Payments Card */}
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
                    Completed Payments
                  </p>
                  <p style={{ 
                    fontSize: "2.5rem", 
                    fontWeight: 600, 
                    margin: 0,
                    color: "var(--cds-text-primary)"
                  }}>
                    {formatNumber(completedPayments)}
                  </p>
                </div>
                <div style={{
                  padding: "1rem",
                  borderRadius: "50%",
                  background: "var(--cds-support-success-inverse)",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <CheckmarkFilled size={24} style={{ color: "var(--cds-support-success)" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckmarkFilled size={16} style={{ color: "var(--cds-support-success)" }} />
                <Tag type="green" size="sm">Successfully processed</Tag>
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
              {/* Common actions */}
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

              {/* School staff actions */}
              {isSchoolStaff && (
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
              )}

              {/* Admin actions */}
              {isAdmin && (
                <Link href="/reports" style={{ textDecoration: "none" }}>
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
                      background: "var(--cds-support-caution-inverse)",
                      marginRight: "1rem"
                    }}>
                      <Report size={20} style={{ color: "var(--cds-support-caution)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: "0 0 0.25rem 0", 
                        color: "var(--cds-text-primary)" 
                      }}>
                        Platform Reports
                      </h4>
                      <p style={{ 
                        margin: 0, 
                        color: "var(--cds-text-secondary)",
                        fontSize: "0.875rem"
                      }}>
                        View analytics and reports
                      </p>
                    </div>
                    <ArrowRight size={16} style={{ color: "var(--cds-icon-secondary)" }} />
                  </div>
                </Link>
              )}

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
                      Settings
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      color: "var(--cds-text-secondary)",
                      fontSize: "0.875rem"
                    }}>
                      Configure your account
                    </p>
                  </div>
                  <ArrowRight size={16} style={{ color: "var(--cds-icon-secondary)" }} />
                </div>
              </Link>
            </div>
          </Tile>
        </Column>
      </Grid>

      {/* Coming Soon Section for Admin */}
      {isAdmin && (
        <div style={{ marginTop: "3rem" }}>
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: 600, 
            marginBottom: "1.5rem",
            color: "var(--cds-text-primary)"
          }}>
            Coming Soon
          </h2>
          
          <Grid>
            <Column lg={5} md={4} sm={2}>
              <Tile style={{ 
                padding: "2rem",
                border: "1px solid var(--cds-border-subtle)",
                textAlign: "center",
                opacity: 0.8
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "var(--cds-layer-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem auto",
                  border: "2px solid var(--cds-border-subtle)"
                }}>
                  <ChartLine size={32} style={{ color: "var(--cds-icon-secondary)" }} />
                </div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600, 
                  marginBottom: "1rem",
                  color: "var(--cds-text-primary)"
                }}>
                  Advanced Analytics
                </h3>
                <p style={{ 
                  color: "var(--cds-text-secondary)", 
                  marginBottom: "1.5rem" 
                }}>
                  Comprehensive analytics dashboard with charts, trends, and predictive insights for better decision making.
                </p>
                <Tag type="outline" size="sm">Coming Q2 2024</Tag>
              </Tile>
            </Column>

            <Column lg={5} md={4} sm={2}>
              <Tile style={{ 
                padding: "2rem",
                border: "1px solid var(--cds-border-subtle)",
                textAlign: "center",
                opacity: 0.8
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "var(--cds-layer-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem auto",
                  border: "2px solid var(--cds-border-subtle)"
                }}>
                  <UserMultiple size={32} style={{ color: "var(--cds-icon-secondary)" }} />
                </div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600, 
                  marginBottom: "1rem",
                  color: "var(--cds-text-primary)"
                }}>
                  Communication Center
                </h3>
                <p style={{ 
                  color: "var(--cds-text-secondary)", 
                  marginBottom: "1.5rem" 
                }}>
                  Integrated messaging system for bulk communications, notifications, and parent-school interactions.
                </p>
                <Tag type="outline" size="sm">Coming Q3 2024</Tag>
              </Tile>
            </Column>

            <Column lg={6} md={4} sm={2}>
              <Tile style={{ 
                padding: "2rem",
                border: "1px solid var(--cds-border-subtle)",
                textAlign: "center",
                opacity: 0.8
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "var(--cds-layer-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem auto",
                  border: "2px solid var(--cds-border-subtle)"
                }}>
                  <Money size={32} style={{ color: "var(--cds-icon-secondary)" }} />
                </div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600, 
                  marginBottom: "1rem",
                  color: "var(--cds-text-primary)"
                }}>
                  Financial AI Insights
                </h3>
                <p style={{ 
                  color: "var(--cds-text-secondary)", 
                  marginBottom: "1.5rem" 
                }}>
                  AI-powered financial predictions, payment pattern analysis, and automated risk assessment tools.
                </p>
                <Tag type="outline" size="sm">Coming 2025</Tag>
              </Tile>
            </Column>
          </Grid>
        </div>
      )}

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
        
        .quick-action-item:hover .arrow-icon {
          transform: translateX(4px);
        }
      `}</style>
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