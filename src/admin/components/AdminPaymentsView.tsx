// src/components/features/admin/AdminPaymentsView.tsx
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
  Filter
} from "@carbon/icons-react";

export function AdminPaymentsView() {
  const { profile, isAdmin, isSchoolStaff, user } = useDualAuth();

  // Mock data for demonstration - PLATFORM WIDE
  const paymentStats = {
    totalCollected: 45000000, // CDF - Platform total
    pendingAmount: 8500000,
    successRate: 94.2,
    transactionsToday: 127
  };

  const recentTransactions = [
    { id: "TXN001", student: "Marie Kalombo", school: "School A", amount: 50000, status: "completed", date: "2024-01-15", method: "M-Pesa" },
    { id: "TXN002", student: "Jean Mukendi", school: "School B", amount: 75000, status: "pending", date: "2024-01-15", method: "Airtel Money" },
    { id: "TXN003", student: "Grace Mbuyi", school: "School A", amount: 50000, status: "completed", date: "2024-01-14", method: "Orange Money" },
    { id: "TXN004", student: "Paul Kasongo", school: "School C", amount: 100000, status: "failed", date: "2024-01-14", method: "M-Pesa" },
    { id: "TXN005", student: "Ruth Tshienda", school: "School B", amount: 50000, status: "completed", date: "2024-01-13", method: "Airtel Money" }
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

  const tableHeaders = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'student', header: 'Student' },
    { key: 'school', header: 'School' },
    { key: 'amount', header: 'Amount' },
    { key: 'status', header: 'Status' },
    { key: 'date', header: 'Date' },
    { key: 'method', header: 'Payment Method' }
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
            Platform Payments Overview
          </h1>
          <p style={{ 
            fontSize: "1.125rem", 
            color: "var(--cds-text-secondary)",
            margin: 0
          }}>
            Monitor all payment transactions across the platform
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
            Generate Report
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
            <Money size={32} style={{ color: "var(--cds-support-success)", marginBottom: "1rem" }} />
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-text-primary)"
            }}>
              {formatCurrency(paymentStats.totalCollected)}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Total Platform Revenue
            </p>
          </Tile>
        </Column>
        <Column lg={3} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <Time size={32} style={{ color: "var(--cds-support-warning)", marginBottom: "1rem" }} />
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-text-primary)"
            }}>
              {formatCurrency(paymentStats.pendingAmount)}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Pending Amount
            </p>
          </Tile>
        </Column>
        <Column lg={3} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <CheckmarkFilled size={32} style={{ color: "var(--cds-support-success)", marginBottom: "1rem" }} />
            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-text-primary)"
            }}>
              {paymentStats.successRate}%
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Success Rate
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
              {paymentStats.transactionsToday}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Today's Transactions
            </p>
          </Tile>
        </Column>
      </Grid>

      {/* Tabs for different views */}
      <Tabs>
        <TabList aria-label="Payment views">
          <Tab>Recent Transactions</Tab>
          <Tab>Payment Reports</Tab>
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
                Recent Platform Transactions
              </h3>
              
              <DataTable
                rows={recentTransactions.map(txn => ({
                  id: txn.id,
                  student: txn.student,
                  school: txn.school,
                  amount: formatCurrency(txn.amount),
                  status: txn.status,
                  date: txn.date,
                  method: txn.method
                }))}
                headers={tableHeaders}
              >
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <TableContainer
                    title="Recent Transactions"
                    description="Latest payment transactions across all schools"
                  >
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
                            <TableCell>{row.cells[3].value}</TableCell>
                            <TableCell>
                              {getStatusTag(row.cells[4].value)}
                            </TableCell>
                            <TableCell>{row.cells[5].value}</TableCell>
                            <TableCell>{row.cells[6].value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                Platform Payment Reports
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
                      Platform Summary
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      Generate comprehensive platform payment reports
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
                      School Comparison
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      Compare payment performance across schools
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
                      Revenue Analytics
                    </h4>
                    <p style={{ 
                      color: "var(--cds-text-secondary)", 
                      marginBottom: "1rem"
                    }}>
                      Detailed revenue analysis and trends
                    </p>
                    <Button kind="primary" size="sm" renderIcon={Download}>
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
