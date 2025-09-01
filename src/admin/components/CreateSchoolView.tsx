// src/admin/components/CreateSchoolView.tsx
"use client";

import { useState } from "react";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  InlineNotification
} from "@carbon/react";
import { 
  Building,
  Add
} from "@carbon/icons-react";

export function CreateSchoolView() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    email: string;
    password: string;
    schoolName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactFirstName: "",
    contactLastName: "",
    contactPhone: "",
    registrationNumber: "",
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
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess({
          email: result.credentials.email,
          password: result.credentials.password,
          schoolName: formData.name,
        });
        setFormData({
          name: "",
          address: "",
          contactFirstName: "",
          contactLastName: "",
          contactPhone: "",
          registrationNumber: "",
        });
      } else {
        setError(result.error || "Failed to create school");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "3rem" }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <Building 
          size={32} 
          style={{ 
            marginRight: "1rem", 
            color: "var(--cds-icon-primary)" 
          }} 
        />
        <div>
          <h2 style={{ 
            fontSize: "2rem", 
            fontWeight: 600, 
            margin: 0,
            color: "var(--cds-text-primary)"
          }}>
            Create New School
          </h2>
          <p style={{ 
            fontSize: "1.125rem", 
            color: "var(--cds-text-secondary)",
            margin: "0.5rem 0 0 0"
          }}>
            Register a new school on the platform
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <InlineNotification
          kind="success"
          title="School Created Successfully!"
          subtitle={`School: ${success.schoolName}`}
          style={{ marginBottom: "2rem" }}
        >
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
              School Account Credentials:
            </p>
            <p><strong>Email:</strong> {success.email}</p>
            <p><strong>Password:</strong> {success.password}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)", marginTop: "0.5rem" }}>
              Please provide these credentials to the school contact.
            </p>
          </div>
        </InlineNotification>
      )}

      {/* Error Message */}
      {error && (
        <InlineNotification
          kind="error"
          title="Error Creating School"
          subtitle={error}
          style={{ marginBottom: "2rem" }}
        />
      )}

      {/* Create School Form */}
      <Tile style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          <Grid condensed>
            <Column lg={6} md={8} sm={4}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "var(--cds-text-primary)"
                }}>
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                  placeholder="Enter school name"
                />
              </div>
            </Column>

            <Column lg={6} md={8} sm={4}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "var(--cds-text-primary)"
                }}>
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                  placeholder="Enter school address"
                />
              </div>
            </Column>

            <Column lg={6} md={8} sm={4}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "var(--cds-text-primary)"
                }}>
                  Contact First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactFirstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactFirstName: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                  placeholder="Enter contact first name"
                />
              </div>
            </Column>

            <Column lg={6} md={8} sm={4}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "var(--cds-text-primary)"
                }}>
                  Contact Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactLastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactLastName: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                  placeholder="Enter contact last name"
                />
              </div>
            </Column>

            <Column lg={6} md={8} sm={4}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "var(--cds-text-primary)"
                }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                  placeholder="Enter contact phone"
                />
              </div>
            </Column>

            <Column lg={6} md={8} sm={4}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  color: "var(--cds-text-primary)"
                }}>
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                  placeholder="Enter registration number"
                />
              </div>
            </Column>
          </Grid>

          <div style={{ marginTop: "2rem" }}>
            <Button
              type="submit"
              disabled={loading}
              renderIcon={Add}
              style={{
                backgroundColor: "var(--cds-interactive-01)",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Creating School..." : "Create School"}
            </Button>
          </div>
        </form>
      </Tile>
    </div>
  );
}
