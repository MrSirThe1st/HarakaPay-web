// src/admin/components/AdminDashboard.tsx
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  Tag,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  ProgressBar,
  InlineNotification
} from "@carbon/react";
import { 
  Money, 
  Report, 
  Settings as SettingsIcon,
  ChartLine,
  Warning,
  CheckmarkFilled,
  Time,
  Add,
  Download,
  Filter,
  UserMultiple,
  Building
} from "@carbon/icons-react";

export function AdminDashboard() {
  const { profile, isAdmin, isSchoolStaff, user } = useDualAuth();

  // Mock data for demonstration - PLATFORM WIDE
  const dashboardStats = {
    totalSchools: 24,
    totalStudents: 15420,
    totalRevenue: 45000000, // CDF
    activeUsers: 89
  };

  const recentActivity = [
    { id: 1, action: "New school registered", school: "Lycee Mwanga", time: "2 hours ago", status: "completed" },
    { id: 2, action: "Payment processed", school: "Institut Bwenge", time: "4 hours ago", status: "completed" },
    { id: 3, action: "Student bulk import", school: "College Saint Joseph", time: "6 hours ago", status: "completed" },
    { id: 4, action: "Admin user created", school: "Platform", time: "8 hours ago", status: "completed" },
    { id: 5, action: "System backup", school: "Platform", time: "1 day ago", status: "completed" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      completed: { type: "green", text: "Completed" },
      pending: { type: "cyan", text: "Pending" },
      failed: { type: "red", text: "Failed" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag type={config.type as any} size="sm">{config.text}</Tag>;
  };

  const tableHeaders = [
    { key: 'action', header: 'Action' },
    { key: 'school', header: 'School' },
    { key: 'time', header: 'Time' },
    { key: 'status', header: 'Status' }
  ];

  return (
    <div style={{ padding: "2rem 0" }}>
      {/* Header Section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <div>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: 600, 
            margin: "0 0 0.5rem 0",
            color: "var(--cds-text-primary)"
          }}>
            Platform Dashboard
          </h1>
          <p style={{ 
            fontSize: "1.125rem", 
            color: "var(--cds-text-secondary)",
            margin: 0
          }}>
            Monitor platform-wide metrics and manage all schools
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Button 
            kind="ghost" 
            size="md" 
            renderIcon={Download}
          >
            Export Report
          </Button>
          <Button 
            kind="primary" 
            size="md" 
            renderIcon={Add}
          >
            Quick Action
          </Button>
        </div>
      </div>

      {/* Statistics - PLATFORM WIDE */}
      <Grid style={{ marginBottom: "2rem" }}>
        <Column lg={3} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <Building size={32} style={{ color: "var(--cds-support-info)", marginBottom: "1rem" }} />
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-text-primary)"
            }}>
              {dashboardStats.totalSchools}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Total Schools
            </p>
          </Tile>
        </Column>
        <Column lg={3} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <UserMultiple size={32} style={{ color: "var(--cds-support-success)", marginBottom: "1rem" }} />
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-text-primary)"
            }}>
              {dashboardStats.totalStudents.toLocaleString()}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Total Students
            </p>
          </Tile>
        </Column>
        <Column lg={3} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <Money size={32} style={{ color: "var(--cds-support-success)", marginBottom: "1rem" }} />
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-text-primary)"
            }}>
              {formatCurrency(dashboardStats.totalRevenue)}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Platform Revenue
            </p>
          </Tile>
        </Column>
        <Column lg={3} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <ChartLine size={32} style={{ color: "var(--cds-support-info)", marginBottom: "1rem" }} />
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-text-primary)"
            }}>
              {dashboardStats.activeUsers}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Active Users
            </p>
          </Tile>
        </Column>
      </Grid>

      {/* Tabs for different views */}
      <Tabs>
        <TabList aria-label="Dashboard views">
          <Tab>Recent Activity</Tab>
          <Tab>Quick Actions</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ 
                fontSize: "1.25rem", 
                fontWeight: 600, 
                marginBottom: "1.5rem",
                color: "var(--cds-text-primary)"
              }}>
                Recent Platform Activity
              </h3>
              
              <DataTable
                rows={recentActivity.map(activity => ({
                  id: activity.id,
                  action: activity.action,
                  school: activity.school,
                  time: activity.time,
                  status: activity.status
                }))}
                headers={tableHeaders}
              >
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          <TableCell>{row.cells[0].value}</TableCell>
                          <TableCell>{row.cells[1].value}</TableCell>
                          <TableCell>{row.cells[2].value}</TableCell>
                          <TableCell>
                            {getStatusTag(row.cells[3].value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ 
                fontSize: "1.25rem", 
                fontWeight: 600, 
                marginBottom: "1.5rem",
                color: "var(--cds-text-primary)"
              }}>
                Quick Actions
              </h3>
              
              <Grid>
                <Column lg={4} md={4} sm={2}>
                  <Tile style={{ 
                    padding: "1.5rem",
                    border: "1px solid var(--cds-border-subtle)"
                  }}>
                    <h4 style={{ 
                      fontSize: "1.125rem", 
                      fontWeight: 600, 
                      marginBottom: "1rem",
                      color: "var(--cds-text-primary)"
                    }}>
                      Add New School
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      Register a new school on the platform
                    </p>
                    <Button kind="primary" size="sm" renderIcon={Add}>
                      Add School
                    </Button>
                  </Tile>
                </Column>

                <Column lg={4} md={4} sm={2}>
                  <Tile style={{ 
                    padding: "1.5rem",
                    border: "1px solid var(--cds-border-subtle)"
                  }}>
                    <h4 style={{ 
                      fontSize: "1.125rem", 
                      fontWeight: 600, 
                      marginBottom: "1rem",
                      color: "var(--cds-text-primary)"
                    }}>
                      Create Admin User
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      Add a new platform administrator
                    </p>
                    <Button kind="primary" size="sm" renderIcon={Add}>
                      Add Admin
                    </Button>
                  </Tile>
                </Column>

                <Column lg={4} md={4} sm={2}>
                  <Tile style={{ 
                    padding: "1.5rem",
                    border: "1px solid var(--cds-border-subtle)"
                  }}>
                    <h4 style={{ 
                      fontSize: "1.125rem", 
                      fontWeight: 600, 
                      marginBottom: "1rem",
                      color: "var(--cds-text-primary)"
                    }}>
                      Generate Report
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      Create platform-wide analytics report
                    </p>
                    <Button kind="primary" size="sm" renderIcon={Report}>
                      Generate
                    </Button>
                  </Tile>
                </Column>
              </Grid>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
