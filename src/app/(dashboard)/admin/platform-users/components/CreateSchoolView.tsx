// src/app/(dashboard)/admin/platform-users/components/CreateSchoolView.tsx
"use client";

import React, { useState } from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export function CreateSchoolView() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    city: "",
    country: "",
    contactEmail: "",
    contactPhone: "",
    adminEmail: "",
    adminPassword: "",
  });

  const generatePassword = () => {
    const password = "School" + Math.random().toString(36).slice(-6) + "!";
    setFormData((prev) => ({ ...prev, adminPassword: password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate API call for now
    setTimeout(() => {
      setSuccess(`School "${formData.schoolName}" created successfully!`);
      setFormData({
        schoolName: "",
        address: "",
        city: "",
        country: "",
        contactEmail: "",
        contactPhone: "",
        adminEmail: "",
        adminPassword: "",
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
        <BuildingOfficeIcon 
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
        <div style={{
          padding: "1rem",
          backgroundColor: "#d1fae5",
          border: "1px solid #10b981",
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <p style={{ color: "#065f46", margin: 0 }}>{success}</p>
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

      {/* Create School Form */}
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
                School Name *
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
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

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                Address
              </label>
              <input
                type="text"
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

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
                placeholder="Enter city"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
                placeholder="Enter country"
              />
            </div>

            <div>
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
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                Admin Email *
              </label>
              <input
                type="email"
                required
                value={formData.adminEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
                placeholder="Enter admin email"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "var(--cds-text-primary)"
              }}>
                Admin Password *
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  required
                  value={formData.adminPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid var(--cds-border-subtle)",
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                  placeholder="Enter admin password"
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
              {loading ? "Creating School..." : "Create School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
