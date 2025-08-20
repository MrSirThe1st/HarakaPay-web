// src/app/(dashboard)/schools/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  Loading,
  InlineNotification
} from "@carbon/react";
import { 
  Add,
  View,
  Edit,
  TrashCan
} from "@carbon/icons-react";

interface School {
  id: string;
  name: string;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  registration_number: string | null;
  status: "pending" | "approved" | "suspended";
  created_at: string;
  updated_at: string;
}

function SchoolsListContent() {
  const { user } = useDualAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const supabase = createClient();

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("schools")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setSchools(data || []);
    } catch (err) {
      console.error("Error fetching schools:", err);
      setError("Failed to load schools. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleRefresh = () => {
    fetchSchools();
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "approved":
        return <Tag type="green" size="sm">Approved</Tag>;
      case "pending":
        return <Tag type="yellow" size="sm">Pending</Tag>;
      case "suspended":
        return <Tag type="red" size="sm">Suspended</Tag>;
      default:
        return <Tag type="gray" size="sm">{status}</Tag>;
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers = [
    { key: "name", header: "School Name" },
    { key: "contact_email", header: "Contact Email" },
    { key: "contact_phone", header: "Phone" },
    { key: "registration_number", header: "Registration #" },
    { key: "status", header: "Status" },
    { key: "created_at", header: "Created" },
    { key: "actions", header: "Actions" }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "400px" 
      }}>
        <Loading description="Loading schools..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
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
            Schools Management
          </h1>
          <p style={{ 
            fontSize: "1.125rem", 
            color: "var(--cds-text-secondary)",
            margin: 0
          }}>
            Manage all registered schools on the platform
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Button 
            kind="ghost" 
            size="md" 
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Link href="/schools/register">
            <Button 
              kind="primary" 
              size="md" 
              renderIcon={Add}
            >
              Register New School
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <div style={{ marginBottom: "2rem" }}>
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
          />
        </div>
      )}

      {/* Statistics */}
      <Grid style={{ marginBottom: "2rem" }}>
        <Column lg={4} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <h3 style={{ 
              fontSize: "2rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-text-primary)"
            }}>
              {schools.length}
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
        <Column lg={4} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <h3 style={{ 
              fontSize: "2rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-support-success)"
            }}>
              {schools.filter(s => s.status === "approved").length}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Approved
            </p>
          </Tile>
        </Column>
        <Column lg={4} md={4} sm={2}>
          <Tile style={{ 
            padding: "1.5rem",
            border: "1px solid var(--cds-border-subtle)",
            textAlign: "center"
          }}>
            <h3 style={{ 
              fontSize: "2rem", 
              fontWeight: 600, 
              margin: "0 0 0.5rem 0",
              color: "var(--cds-support-warning)"
            }}>
              {schools.filter(s => s.status === "pending").length}
            </h3>
            <p style={{ 
              fontSize: "0.875rem", 
              color: "var(--cds-text-secondary)",
              margin: 0
            }}>
              Pending
            </p>
          </Tile>
        </Column>
      </Grid>

      {/* Schools Table */}
      <DataTable
        rows={filteredSchools.map(school => ({
          id: school.id,
          name: school.name,
          contact_email: school.contact_email || "—",
          contact_phone: school.contact_phone || "—",
          registration_number: school.registration_number || "—",
          status: school.status,
          created_at: formatDate(school.created_at),
          actions: school.id
        }))}
        headers={headers}
      >
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer
            title="Registered Schools"
            description="List of all schools registered on the platform"
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search schools..."
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const school = schools.find(s => s.id === row.id);
                  return (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      <TableCell>{row.cells[0].value}</TableCell>
                      <TableCell>{row.cells[1].value}</TableCell>
                      <TableCell>{row.cells[2].value}</TableCell>
                      <TableCell>{row.cells[3].value}</TableCell>
                      <TableCell>
                        {school && getStatusTag(school.status)}
                      </TableCell>
                      <TableCell>{row.cells[5].value}</TableCell>
                      <TableCell>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={View}
                            iconDescription="View details"
                            hasIconOnly
                          />
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Edit}
                            iconDescription="Edit school"
                            hasIconOnly
                          />
                          <Button
                            kind="danger-ghost"
                            size="sm"
                            renderIcon={TrashCan}
                            iconDescription="Delete school"
                            hasIconOnly
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      {filteredSchools.length === 0 && !loading && (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem",
          color: "var(--cds-text-secondary)"
        }}>
          <p style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
            {searchTerm ? "No schools found matching your search." : "No schools registered yet."}
          </p>
          {!searchTerm && (
            <Link href="/schools/register">
              <Button kind="primary" renderIcon={Add}>
                Register First School
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function SchoolsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SchoolsListContent />
    </ProtectedRoute>
  );
}