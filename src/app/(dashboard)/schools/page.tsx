// src/app/(dashboard)/schools/page.tsx
"use client";

import { useState } from "react";
import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  InlineNotification
} from "@carbon/react";
import { 
  Add
} from "@carbon/icons-react";

function CreateSchoolContent() {
  const { user } = useDualAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    schoolName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    registrationNumber: "",
    contactFirstName: "",
    contactLastName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/create-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.schoolName,
          address: formData.address,
          contactFirstName: formData.contactFirstName || "",
          contactLastName: formData.contactLastName || "",
          contactPhone: formData.contactPhone,
          registrationNumber: formData.registrationNumber || "",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.credentials);
        setFormData({
          schoolName: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          registrationNumber: "",
          contactFirstName: "",
          contactLastName: "",
        });
      } else {
        setError(result.error || "Failed to create school");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <Add 
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
              Create New School
            </h1>
            <p style={{ 
              fontSize: "1.125rem", 
              color: "var(--cds-text-secondary)",
              margin: "0.5rem 0 0 0"
            }}>
              Register a new school and create their admin account
            </p>
          </div>
        </div>

        {/* Current Admin Info */}
        <InlineNotification
          kind="info"
          title="Administrator Access"
          subtitle={`Logged in as: ${user?.email} | Platform Administrator`}
          style={{ marginBottom: "2rem" }}
        />
      </div>

      {/* Create School Form */}
      <Grid>
        <Column lg={12} md={8} sm={4}>
          <Tile style={{ 
            padding: "2rem",
            border: "1px solid var(--cds-border-subtle)"
          }}>
            {success && (
              <div style={{ 
                padding: "1.5rem", 
                background: "var(--cds-support-success-inverse)", 
                border: "1px solid var(--cds-support-success)",
                borderRadius: "8px",
                marginBottom: "2rem"
              }}>
                <h3 style={{ 
                  fontSize: "1.125rem", 
                  fontWeight: 600, 
                  color: "var(--cds-support-success)",
                  margin: "0 0 1rem 0"
                }}>
                  School Created Successfully!
                </h3>
                <p style={{ 
                  color: "var(--cds-support-success)", 
                  margin: "0 0 1rem 0" 
                }}>
                  Please provide these credentials to the school:
                </p>
                <div style={{ 
                  background: "var(--cds-layer)", 
                  padding: "1rem", 
                  borderRadius: "4px",
                  border: "1px solid var(--cds-border-subtle)"
                }}>
                  <p style={{ margin: "0 0 0.5rem 0", color: "var(--cds-text-primary)" }}>
                    <strong>Email:</strong> {success.email}
                  </p>
                  <p style={{ margin: 0, color: "var(--cds-text-primary)" }}>
                    <strong>Password:</strong> {success.password}
                  </p>
                </div>
                <p style={{ 
                  fontSize: "0.875rem", 
                  color: "var(--cds-support-success)",
                  margin: "1rem 0 0 0"
                }}>
                  The school can now log in with these credentials to access their dashboard.
                </p>
              </div>
            )}

            {error && (
              <InlineNotification
                kind="error"
                title="Error creating school"
                subtitle={error}
                style={{ marginBottom: "2rem" }}
              />
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* School Information Section */}
              <div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600,
                  color: "var(--cds-text-primary)",
                  margin: "0 0 1.5rem 0"
                }}>
                  School Information
                </h3>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                  gap: "1.5rem" 
                }}>
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.875rem", 
                      fontWeight: 500, 
                      color: "var(--cds-text-primary)",
                      marginBottom: "0.5rem"
                    }}>
                      School Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.schoolName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, schoolName: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--cds-border-strong)",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        color: "var(--cds-text-primary)",
                        background: "var(--cds-field)"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.875rem", 
                      fontWeight: 500, 
                      color: "var(--cds-text-primary)",
                      marginBottom: "0.5rem"
                    }}>
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contactPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactPhone: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--cds-border-strong)",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        color: "var(--cds-text-primary)",
                        background: "var(--cds-field)"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.875rem", 
                      fontWeight: 500, 
                      color: "var(--cds-text-primary)",
                      marginBottom: "0.5rem"
                    }}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--cds-border-strong)",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        color: "var(--cds-text-primary)",
                        background: "var(--cds-field)"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.875rem", 
                      fontWeight: 500, 
                      color: "var(--cds-text-primary)",
                      marginBottom: "0.5rem"
                    }}>
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          registrationNumber: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--cds-border-strong)",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        color: "var(--cds-text-primary)",
                        background: "var(--cds-field)"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div style={{
                borderTop: "1px solid var(--cds-border-subtle)",
                paddingTop: "2rem"
              }}>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600,
                  color: "var(--cds-text-primary)",
                  margin: "0 0 1.5rem 0"
                }}>
                  Primary Contact Information
                </h3>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                  gap: "1.5rem" 
                }}>
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.875rem", 
                      fontWeight: 500, 
                      color: "var(--cds-text-primary)",
                      marginBottom: "0.5rem"
                    }}>
                      Contact First Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactFirstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactFirstName: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--cds-border-strong)",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        color: "var(--cds-text-primary)",
                        background: "var(--cds-field)"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.875rem", 
                      fontWeight: 500, 
                      color: "var(--cds-text-primary)",
                      marginBottom: "0.5rem"
                    }}>
                      Contact Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactLastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactLastName: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--cds-border-strong)",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        color: "var(--cds-text-primary)",
                        background: "var(--cds-field)"
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <Button
                  type="submit"
                  kind="primary"
                  size="md"
                  disabled={loading}
                  renderIcon={Add}
                >
                  {loading ? "Creating School..." : "Create School"}
                </Button>
              </div>
            </form>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}

export default function SchoolsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateSchoolContent />
    </ProtectedRoute>
  );
}