// src/app/(dashboard)/admin/platform-users/components/PlatformUsersView.tsx
"use client";

import React, { useState } from 'react';
import { UserMinusIcon } from '@heroicons/react/24/outline';

export function PlatformUsersView() {
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

    // Simulate API call for now
    setTimeout(() => {
      setSuccess({
        email: formData.email,
        password: formData.password,
      });
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <UserMinusIcon 
          className="w-8 h-8"
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
            Create New Admin
          </h2>
          <p style={{ 
            fontSize: "1.125rem", 
            color: "var(--cds-text-secondary)",
            margin: "0.5rem 0 0 0"
          }}>
            Create a new administrator account for the platform
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#d1fae5",
          border: "1px solid #10b981",
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <h3 style={{ 
            fontSize: "1.125rem", 
            fontWeight: 600, 
            margin: "0 0 0.5rem 0",
            color: "#065f46"
          }}>
            Admin Account Created Successfully!
          </h3>
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#065f46" }}>
              Admin Account Credentials:
            </p>
            <p style={{ color: "#065f46" }}><strong>Email:</strong> {success.email}</p>
            <p style={{ color: "#065f46" }}><strong>Password:</strong> {success.password}</p>
            <p style={{ fontSize: "0.875rem", color: "#047857", marginTop: "0.5rem" }}>
              The new admin can now log in with these credentials.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#fee2e2",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <p style={{ color: "#991b1b" }}>{error}</p>
        </div>
      )}

      {/* Create Admin Form */}
      <div style={{
        padding: "2rem",
        border: "1px solid var(--cds-border-subtle)",
        borderRadius: "8px",
        background: "var(--cds-layer)"
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                Password *
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--cds-interactive-02)",
                    color: "var(--cds-text-primary)",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <button
              type="submit"
              disabled={loading}
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
              {loading ? "Creating Admin..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
