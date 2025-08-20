// src/app/(dashboard)/reports/page.tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDualAuth } from "@/hooks/useDualAuth";
import { 
  Grid, 
  Column, 
  Tile, 
  Loading,
  Button,
  Tag
} from "@carbon/react";
import { 
  Analytics, 
  ChartLine, 
  Report, 
  Money,
  Phone,
  ServerTime,
  Scooter,
  UserMultiple,
chool
} from "@carbon/icons-react";

function ReportsContent() {
  const { profile, user } = useDualAuth();

  const reportCategories = [
    {
      title: "School Performance",
      description: "Analyze performance metrics across all registered schools.",
  icon: Scooter,
      color: "blue",
      metrics: ["Payment Success Rate", "Student Enrollment", "Revenue Trends"],
      status: "available"
    },
    {
      title: "Transaction Analytics", 
      description: "Detailed analysis of payment transactions and success rates.",
      icon: Money,
      color: "green",
      metrics: ["Transaction Volume", "Failed Payments", "Processing Times"],
      status: "available"
    },
    {
      title: "Platform Usage",
      description: "Monitor platform adoption and user engagement metrics.",
      icon: Analytics,
      color: "purple",
      metrics: ["Active Users", "Feature Usage", "Geographic Distribution"],
      status: "available"
    },
    {
      title: "Revenue Reports",
      description: "Track platform revenue, commissions, and financial performance.",
      icon: ChartLine,
      color: "cyan",
      metrics: ["Monthly Revenue", "Commission Tracking", "Growth Metrics"],
      status: "available"
    },
    {
      title: "Mobile App Analytics",
      description: "Parent mobile app usage and engagement statistics.",
      icon: Phone,
      color: "magenta",
      metrics: ["App Downloads", "User Retention", "Feature Usage"],
      status: "coming-soon"
    },
    {
      title: "System Health",
      description: "Monitor system performance, uptime, and technical metrics.",
      icon: ServerTime,
      color: "teal",
      metrics: ["System Uptime", "API Response Times", "Error Rates"],
      status: "available"
    }
  ];

  const getStatusTag = (status: string) => {
    if (status === "available") {
      return <Tag type="green" size="sm">Available</Tag>;
    }
    return <Tag type="outline" size="sm">Coming Soon</Tag>;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: "var(--cds-support-info)",
      green: "var(--cds-support-success)", 
      purple: "var(--cds-support-caution)",
      cyan: "var(--cds-support-info)",
      magenta: "var(--cds-support-error)",
      teal: "var(--cds-support-success)"
    };
    return colors[color as keyof typeof colors] || "var(--cds-icon-primary)";
  };

  return (
    <div style={{ padding: "2rem 0" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "1rem" 
        }}>
          <Report 
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
              Platform Reports
            </h1>
            <p style={{ 
              fontSize: "1.125rem", 
              color: "var(--cds-text-secondary)",
              margin: "0.5rem 0 0 0"
            }}>
              Comprehensive analytics and reporting for platform administrators
            </p>
          </div>
        </div>

        {/* User Info */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "1rem",
          padding: "1rem",
          background: "var(--cds-layer)",
          borderRadius: "8px",
          border: "1px solid var(--cds-border-subtle)"
        }}>
          <UserMultiple size={20} style={{ color: "var(--cds-icon-secondary)" }} />
          <div>
            <span style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)" 
            }}>
              Logged in as: 
            </span>
            <span style={{ 
              fontWeight: 600, 
              marginLeft: "0.5rem",
              color: "var(--cds-text-primary)"
            }}>
              {user?.email}
            </span>
            <Tag type="blue" size="sm" style={{ marginLeft: "1rem" }}>
              Platform Administrator
            </Tag>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <Grid>
        {reportCategories.map((report, index) => {
          const IconComponent = report.icon;
          
          return (
            <Column key={index} lg={8} md={8} sm={4}>
              <Tile 
                style={{ 
                  height: "100%",
                  minHeight: "280px",
                  padding: "2rem",
                  cursor: report.status === "available" ? "pointer" : "default",
                  opacity: report.status === "available" ? 1 : 0.7,
                  transition: "all 0.2s ease",
                  border: "1px solid var(--cds-border-subtle)"
                }}
                className="carbon-tile-hover"
              >
                <div style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  justifyContent: "space-between",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    background: "var(--cds-layer-accent)",
                    border: "1px solid var(--cds-border-subtle)"
                  }}>
                    <IconComponent 
                      size={24} 
                      style={{ color: getIconColor(report.color) }}
                    />
                  </div>
                  {getStatusTag(report.status)}
                </div>

                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600, 
                  marginBottom: "0.75rem",
                  color: "var(--cds-text-primary)"
                }}>
                  {report.title}
                </h3>
                
                <p style={{ 
                  color: "var(--cds-text-secondary)", 
                  marginBottom: "1.5rem",
                  lineHeight: 1.5
                }}>
                  {report.description}
                </p>

                {/* Metrics */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ 
                    fontSize: "0.875rem", 
                    fontWeight: 600, 
                    marginBottom: "0.75rem",
                    color: "var(--cds-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em"
                  }}>
                    Key Metrics
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {report.metrics.map((metric, idx) => (
                      <Tag key={idx} type="outline" size="sm">
                        {metric}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  kind={report.status === "available" ? "primary" : "ghost"}
                  size="sm"
                  disabled={report.status !== "available"}
                  style={{ marginTop: "auto" }}
                >
                  {report.status === "available" ? "View Report" : "Coming Soon"}
                </Button>
              </Tile>
            </Column>
          );
        })}
      </Grid>

      {/* Footer Info */}
      <div style={{ 
        marginTop: "3rem", 
        padding: "2rem",
        background: "var(--cds-layer)",
        borderRadius: "8px",
        border: "1px solid var(--cds-border-subtle)",
        textAlign: "center"
      }}>
        <h3 style={{ 
          fontSize: "1.125rem", 
          fontWeight: 600, 
          marginBottom: "1rem",
          color: "var(--cds-text-primary)"
        }}>
          Need Custom Reports?
        </h3>
        <p style={{ 
          color: "var(--cds-text-secondary)", 
          marginBottom: "1.5rem" 
        }}>
          Contact our support team to create custom reports tailored to your specific needs.
        </p>
        <Button kind="tertiary" size="md">
          Contact Support
        </Button>
      </div>

      <style jsx>{`
        .carbon-tile-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ReportsContent />
    </ProtectedRoute>
  );
}