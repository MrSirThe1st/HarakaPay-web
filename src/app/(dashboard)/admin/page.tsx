// src/app/(dashboard)/admin/page.tsx
"use client";

import { useState } from "react";
import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  Tag,
  InlineNotification
} from "@carbon/react";
import { 
  UserAdmin,
  Add
} from "@carbon/icons-react";

function CreateAdminContent() {
  const { user } = useDualAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const generatePassword = () => {
    const password =
      Math.random().toString(36).slice(-8) +
      "Adm!" +
      Math.floor(Math.random() * 100);
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.credentials);
        setFormData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
        });
      } else {
        setError(result.error || "Failed to create admin account");
      }
    } catch {
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
          <UserAdmin 
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
              Create New Admin
            </h1>
            <p style={{ 
              fontSize: "1.125rem", 
              color: "var(--cds-text-secondary)",
              margin: "0.5rem 0 0 0"
            }}>
              Create a new administrator account for the platform
            </p>
          </div>
        </div>

        {/* Current Admin Info */}
        <InlineNotification
          kind="info"
          title="Current Session"
          subtitle={`Logged in as: ${user?.email} | Platform Administrator`}
          style={{ marginBottom: "2rem" }}
        />
      </div>

      {/* Create Admin Form */}
      <Grid>
        <Column lg={10} md={8} sm={4}>
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
                  Admin Created Successfully!
                </h3>
                <p style={{ 
                  color: "var(--cds-support-success)", 
                  margin: "0 0 1rem 0" 
                }}>
                  Please provide these credentials to the new admin:
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
                  The new admin can now log in with these credentials.
                </p>
              </div>
            )}

            {error && (
              <InlineNotification
                kind="error"
                title="Error creating admin"
                subtitle={error}
                style={{ marginBottom: "2rem" }}
              />
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, firstName: e.target.value }))
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
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lastName: e.target.value }))
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

              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "var(--cds-text-primary)",
                  marginBottom: "0.5rem"
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
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
                  placeholder="admin@harakapay.com"
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
                  Password *
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      border: "1px solid var(--cds-border-strong)",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      color: "var(--cds-text-primary)",
                      background: "var(--cds-field)"
                    }}
                  />
                  <Button
                    type="button"
                    kind="secondary"
                    size="md"
                    onClick={generatePassword}
                  >
                    Generate
                  </Button>
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
                  {loading ? "Creating Admin..." : "Create Admin"}
                </Button>
              </div>
            </form>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateAdminContent />
    </ProtectedRoute>
  );
}