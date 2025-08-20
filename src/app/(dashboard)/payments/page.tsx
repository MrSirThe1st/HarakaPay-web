// src/app/(dashboard)/payments/page.tsx
"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
  Filter
} from "@carbon/icons-react";

function PaymentsContent() {
  const { profile, isAdmin, isSchoolStaff, user } = useDualAuth();

  // Mock data for demonstration
  const paymentStats = {
    totalCollected: 45000000, // CDF
    pendingAmount: 8500000,
    successRate: 94.2,
    transactionsToday: 127
  };

  const recentTransactions = [
    { id: "TXN001", student: "Marie Kalombo", amount: 50000, status: "completed", date: "2024-01-15", method: "M-Pesa" },
    { id: "TXN002", student: "Jean Mukendi", amount: 75000, status: "pending", date: "2024-01-15", method: "Airtel Money" },
    { id: "TXN003", student: "Grace Mbuyi", amount: 50000, status: "completed", date: "2024-01-14", method: "Orange Money" },
    { id: "TXN004", student: "Paul Kasongo", amount: 100000, status: "failed", date: "2024-01-14", method: "M-Pesa" },
    { id: "TXN005", student: "Ruth Tshienda", amount: 50000, status: "completed", date: "2024-01-13", method: "Airtel Money" }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckmarkFilled size={16} style={{ color: "var(--cds-support-success)" }} />;
      case "pending":
        return <Time size={16} style={{ color: "var(--cds-support-warning)" }} />;
      case "failed":
        return <Warning size={16} style={{ color: "var(--cds-support-error)" }} />;
      default:
        return null;
    }
  };

  const getUserRole = () => {
    if (isAdmin) return "Platform Administrator";
    if (isSchoolStaff) return "School Staff Member";
    return "User";
  };

  const tableHeaders = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'student', header: 'Student' },
    { key: 'amount', header: 'Amount' },
    { key: 'method', header: 'Payment Method' },
    { key: 'date', header: 'Date' },
    { key: 'status', header: 'Status' }
  ];

  const tableRows = recentTransactions.map(transaction => ({
    id: transaction.id,
    student: transaction.student,
    amount: formatCurrency(transaction.amount),
    method: transaction.method,
    date: new Date(transaction.date).toLocaleDateString(),
    status: transaction.status
  }));

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
            <Money 
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
                Payment Management
              </h1>
              <p style={{ 
                fontSize: "1.125rem", 
                color: "var(--cds-text-secondary)",
                margin: "0.5rem 0 0 0"
              }}>
                Track and manage school fee payments across the platform
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Button kind="secondary" renderIcon={Filter}>
              Filter
            </Button>
            <Button kind="secondary" renderIcon={Download}>
              Export
            </Button>
            {isSchoolStaff && (
              <Button kind="primary" renderIcon={Add}>
                New Payment
              </Button>
            )}
          </div>
        </div>

        {/* User Role Info */}
        <Tile style={{ 
          padding: "1rem",
          border: "1px solid var(--cds-border-subtle)",
          background: "var(--cds-layer-accent)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem" 
          }}>
            <div>
              <span style={{ 
                fontSize: "0.875rem", 
                color: "var(--cds-text-secondary)" 
              }}>
                Viewing as: 
              </span>
              <span style={{ 
                fontWeight: 600, 
                marginLeft: "0.5rem",
                color: "var(--cds-text-primary)"
              }}>
                {user?.email}
              </span>
            </div>
            <Tag type="blue" size="sm">{getUserRole()}</Tag>
          </div>
        </Tile>
      </div>

      {/* Payment Statistics */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: 600, 
          marginBottom: "1.5rem",
          color: "var(--cds-text-primary)"
        }}>
          Payment Overview
        </h2>
        
        <Grid>
          <Column lg={4} md={4} sm={2}>
            <Tile style={{ 
              padding: "1.5rem",
              border: "1px solid var(--cds-border-subtle)",
              height: "100%"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "1rem"
              }}>
                <div>
                  <p style={{ 
                    fontSize: "0.875rem", 
                    color: "var(--cds-text-secondary)",
                    margin: "0 0 0.5rem 0"
                  }}>
                    Total Collected
                  </p>
                  <p style={{ 
                    fontSize: "2rem", 
                    fontWeight: 600, 
                    margin: 0,
                    color: "var(--cds-text-primary)"
                  }}>
                    {formatCurrency(paymentStats.totalCollected)}
                  </p>
                </div>
                <div style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "var(--cds-support-success-inverse)"
                }}>
                  <Money size={24} style={{ color: "var(--cds-support-success)" }} />
                </div>
              </div>
              <Tag type="green" size="sm">↗ +12% this month</Tag>
            </Tile>
          </Column>

          <Column lg={4} md={4} sm={2}>
            <Tile style={{ 
              padding: "1.5rem",
              border: "1px solid var(--cds-border-subtle)",
              height: "100%"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "1rem"
              }}>
                <div>
                  <p style={{ 
                    fontSize: "0.875rem", 
                    color: "var(--cds-text-secondary)",
                    margin: "0 0 0.5rem 0"
                  }}>
                    Pending Amount
                  </p>
                  <p style={{ 
                    fontSize: "2rem", 
                    fontWeight: 600, 
                    margin: 0,
                    color: "var(--cds-text-primary)"
                  }}>
                    {formatCurrency(paymentStats.pendingAmount)}
                  </p>
                </div>
                <div style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "var(--cds-support-warning-inverse)"
                }}>
                  <Time size={24} style={{ color: "var(--cds-support-warning)" }} />
                </div>
              </div>
              <Tag type="cyan" size="sm">47 transactions</Tag>
            </Tile>
          </Column>

          <Column lg={4} md={4} sm={2}>
            <Tile style={{ 
              padding: "1.5rem",
              border: "1px solid var(--cds-border-subtle)",
              height: "100%"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "1rem"
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
                    fontSize: "2rem", 
                    fontWeight: 600, 
                    margin: 0,
                    color: "var(--cds-text-primary)"
                  }}>
                    {paymentStats.successRate}%
                  </p>
                </div>
                <div style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "var(--cds-support-info-inverse)"
                }}>
                  <ChartLine size={24} style={{ color: "var(--cds-support-info)" }} />
                </div>
              </div>
              <ProgressBar 
                value={paymentStats.successRate} 
                max={100}
                size="sm"
                helperText={`${paymentStats.transactionsToday} transactions today`}
              />
            </Tile>
          </Column>
        </Grid>
      </div>

      {/* Payment Management Tabs */}
      <Tabs>
        <TabList aria-label="Payment management sections">
          <Tab>Recent Transactions</Tab>
          <Tab>Payment Methods</Tab>
          {isAdmin && <Tab>Platform Analytics</Tab>}
          <Tab>Reports</Tab>
        </TabList>

        <TabPanels>
          {/* Recent Transactions Tab */}
          <TabPanel>
            <div style={{ padding: "2rem 0" }}>
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
                  Recent Transactions
                </h3>
                <Button kind="ghost" size="sm">
                  View All
                </Button>
              </div>

              <DataTable rows={tableRows} headers={tableHeaders}>
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
                        <TableRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === 'status' ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  {getStatusIcon(cell.value)}
                                  {getStatusTag(cell.value)}
                                </div>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            </div>
          </TabPanel>

          {/* Payment Methods Tab */}
          <TabPanel>
            <div style={{ padding: "2rem 0" }}>
              <h3 style={{ 
                fontSize: "1.25rem", 
                fontWeight: 600, 
                marginBottom: "1.5rem",
                color: "var(--cds-text-primary)"
              }}>
                Available Payment Methods
              </h3>
              
              <Grid>
                {['M-Pesa', 'Airtel Money', 'Orange Money'].map((method, index) => (
                  <Column key={index} lg={4} md={4} sm={2}>
                    <Tile style={{ 
                      padding: "1.5rem",
                      border: "1px solid var(--cds-border-subtle)",
                      textAlign: "center"
                    }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "var(--cds-layer-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem auto",
                        border: "2px solid var(--cds-border-subtle)"
                      }}>
                        <Money size={24} style={{ color: "var(--cds-icon-primary)" }} />
                      </div>
                      <h4 style={{ 
                        fontSize: "1.125rem", 
                        fontWeight: 600, 
                        marginBottom: "0.5rem",
                        color: "var(--cds-text-primary)"
                      }}>
                        {method}
                      </h4>
                      <p style={{ 
                        color: "var(--cds-text-secondary)", 
                        fontSize: "0.875rem",
                        marginBottom: "1rem"
                      }}>
                        Mobile money payments
                      </p>
                      <Tag type="green" size="sm">Active</Tag>
                    </Tile>
                  </Column>
                ))}
              </Grid>

              {isSchoolStaff && (
                <div style={{ marginTop: "2rem" }}>
                  <Button kind="primary" renderIcon={SettingsIcon}>
                    Configure Payment Methods
                  </Button>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Platform Analytics Tab (Admin Only) */}
          {isAdmin && (
            <TabPanel>
              <div style={{ padding: "2rem 0" }}>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600, 
                  marginBottom: "1.5rem",
                  color: "var(--cds-text-primary)"
                }}>
                  Platform Analytics
                </h3>
                
                <InlineNotification
                  kind="info"
                  title="Analytics Dashboard"
                  subtitle="Comprehensive platform-wide payment analytics coming soon."
                  style={{ marginBottom: "2rem" }}
                />

                <Grid>
                  <Column lg={6} md={4} sm={2}>
                    <Tile style={{ 
                      padding: "2rem",
                      border: "1px solid var(--cds-border-subtle)",
                      textAlign: "center"
                    }}>
                      <Report size={48} style={{ 
                        color: "var(--cds-icon-secondary)", 
                        marginBottom: "1rem" 
                      }} />
                      <h4 style={{ 
                        fontSize: "1.125rem", 
                        fontWeight: 600, 
                        marginBottom: "0.5rem",
                        color: "var(--cds-text-primary)"
                      }}>
                        Cross-School Analytics
                      </h4>
                      <p style={{ 
                        color: "var(--cds-text-secondary)", 
                        marginBottom: "1rem"
                      }}>
                        Compare payment performance across all schools
                      </p>
                      <Button kind="ghost" size="sm" disabled>
                        Coming Soon
                      </Button>
                    </Tile>
                  </Column>

                  <Column lg={6} md={4} sm={2}>
                    <Tile style={{ 
                      padding: "2rem",
                      border: "1px solid var(--cds-border-subtle)",
                      textAlign: "center"
                    }}>
                      <ChartLine size={48} style={{ 
                        color: "var(--cds-icon-secondary)", 
                        marginBottom: "1rem" 
                      }} />
                      <h4 style={{ 
                        fontSize: "1.125rem", 
                        fontWeight: 600, 
                        marginBottom: "0.5rem",
                        color: "var(--cds-text-primary)"
                      }}>
                        Revenue Trends
                      </h4>
                      <p style={{ 
                        color: "var(--cds-text-secondary)", 
                        marginBottom: "1rem"
                      }}>
                        Track platform revenue and commission trends
                      </p>
                      <Button kind="ghost" size="sm" disabled>
                        Coming Soon
                      </Button>
                    </Tile>
                  </Column>
                </Grid>
              </div>
            </TabPanel>
          )}

          {/* Reports Tab */}
          <TabPanel>
            <div style={{ padding: "2rem 0" }}>
              <h3 style={{ 
                fontSize: "1.25rem", 
                fontWeight: 600, 
                marginBottom: "1.5rem",
                color: "var(--cds-text-primary)"
              }}>
                Payment Reports
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
                      Daily Summary
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      Generate daily payment summaries and transaction reports
                    </p>
                    <Button kind="primary" size="sm" renderIcon={Download}>
                      Generate Report
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
                      Monthly Overview
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      Comprehensive monthly payment analysis and trends
                    </p>
                    <Button kind="primary" size="sm" renderIcon={Download}>
                      Generate Report
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
                      Outstanding Fees
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      List of students with pending or failed payments
                    </p>
                    <Button kind="secondary" size="sm" renderIcon={Download}>
                      Generate Report
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

export default function PaymentsPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "school_staff"]}>
      <PaymentsContent />
    </ProtectedRoute>
  );
}