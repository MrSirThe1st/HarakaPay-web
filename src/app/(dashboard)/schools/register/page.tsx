// src/app/(dashboard)/schools/register/page.tsx
"use client";

import { useState } from "react";
import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Grid, 
  Column, 
  Tile, 
  Button,
  TextInput,
  Form,
  FormGroup,
  InlineNotification,
  Modal,
  Loading
} from "@carbon/react";
import { 
  ArrowLeft,
  Save,
  Information
} from "@carbon/icons-react";

function RegisterSchoolContent() {
  const { user } = useDualAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    registrationNumber: "",
    contactFirstName: "",
    contactLastName: "",
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.schoolName.trim()) {
      errors.schoolName = "School name is required";
    }

    if (!formData.contactPhone.trim()) {
      errors.contactPhone = "Contact phone is required";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (!formData.contactFirstName.trim()) {
      errors.contactFirstName = "Contact first name is required";
    }

    if (!formData.contactLastName.trim()) {
      errors.contactLastName = "Contact last name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
          contactFirstName: formData.contactFirstName,
          contactLastName: formData.contactLastName,
          contactPhone: formData.contactPhone,
          registrationNumber: formData.registrationNumber || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.credentials);
        setShowCredentialsModal(true);
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
      console.error("Error creating school:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowCredentialsModal(false);
    setSuccess(null);
    router.push("/schools");
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header Section */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "1rem", 
          marginBottom: "1rem" 
        }}>
          <Link href="/schools">
            <Button 
              kind="ghost" 
              size="sm" 
              renderIcon={ArrowLeft}
              iconDescription="Back to schools"
              hasIconOnly
            />
          </Link>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: 600, 
            margin: 0,
            color: "var(--cds-text-primary)"
          }}>
            Register New School
          </h1>
        </div>
        <p style={{ 
          fontSize: "1.125rem", 
          color: "var(--cds-text-secondary)",
          margin: 0
        }}>
          Create a new school account on the HarakaPay platform
        </p>
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

      {/* Information Note */}
      <div style={{ marginBottom: "2rem" }}>
        <InlineNotification
          kind="info"
          title="School Registration"
          subtitle="A school account will be created automatically with generated login credentials."
          hideCloseButton
        />
      </div>

      {/* Registration Form */}
      <Grid>
        <Column lg={12} md={8} sm={4}>
          <Tile style={{ 
            padding: "2rem",
            border: "1px solid var(--cds-border-subtle)"
          }}>
            <Form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600, 
                  marginBottom: "1rem",
                  color: "var(--cds-text-primary)"
                }}>
                  School Information
                </h3>
                
                <FormGroup legendText="">
                  <Grid>
                    <Column lg={8} md={6} sm={4}>
                      <TextInput
                        id="schoolName"
                        labelText="School Name *"
                        placeholder="Enter the full school name"
                        value={formData.schoolName}
                        onChange={(e) => handleInputChange("schoolName", e.target.value)}
                        invalid={!!formErrors.schoolName}
                        invalidText={formErrors.schoolName}
                        disabled={loading}
                      />
                    </Column>
                    <Column lg={8} md={6} sm={4}>
                      <TextInput
                        id="registrationNumber"
                        labelText="Registration Number"
                        placeholder="School registration number (optional)"
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                        disabled={loading}
                      />
                    </Column>
                  </Grid>
                </FormGroup>

                <FormGroup legendText="">
                  <TextInput
                    id="address"
                    labelText="School Address *"
                    placeholder="Enter the complete address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    invalid={!!formErrors.address}
                    invalidText={formErrors.address}
                    disabled={loading}
                  />
                </FormGroup>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 600, 
                  marginBottom: "1rem",
                  color: "var(--cds-text-primary)"
                }}>
                  Contact Information
                </h3>
                
                <FormGroup legendText="">
                  <Grid>
                    <Column lg={8} md={6} sm={4}>
                      <TextInput
                        id="contactFirstName"
                        labelText="Contact First Name *"
                        placeholder="First name of primary contact"
                        value={formData.contactFirstName}
                        onChange={(e) => handleInputChange("contactFirstName", e.target.value)}
                        invalid={!!formErrors.contactFirstName}
                        invalidText={formErrors.contactFirstName}
                        disabled={loading}
                      />
                    </Column>
                    <Column lg={8} md={6} sm={4}>
                      <TextInput
                        id="contactLastName"
                        labelText="Contact Last Name *"
                        placeholder="Last name of primary contact"
                        value={formData.contactLastName}
                        onChange={(e) => handleInputChange("contactLastName", e.target.value)}
                        invalid={!!formErrors.contactLastName}
                        invalidText={formErrors.contactLastName}
                        disabled={loading}
                      />
                    </Column>
                  </Grid>
                </FormGroup>

                <FormGroup legendText="">
                  <TextInput
                    id="contactPhone"
                    labelText="Contact Phone *"
                    placeholder="Phone number for the school"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    invalid={!!formErrors.contactPhone}
                    invalidText={formErrors.contactPhone}
                    disabled={loading}
                  />
                </FormGroup>
              </div>

              {/* Form Actions */}
              <div style={{ 
                display: "flex", 
                gap: "1rem", 
                justifyContent: "flex-end",
                paddingTop: "1rem",
                borderTop: "1px solid var(--cds-border-subtle)"
              }}>
                <Link href="/schools">
                  <Button 
                    kind="secondary" 
                    size="md"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  kind="primary" 
                  size="md"
                  renderIcon={loading ? undefined : Save}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loading 
                        small 
                        withOverlay={false} 
                        description="Creating school..."
                      />
                      Creating School...
                    </>
                  ) : (
                    "Create School"
                  )}
                </Button>
              </div>
            </Form>
          </Tile>
        </Column>
      </Grid>

      {/* Success Modal with Credentials */}
      <Modal
        open={showCredentialsModal}
        onRequestClose={handleModalClose}
        modalHeading="School Created Successfully!"
        primaryButtonText="Continue"
        onRequestSubmit={handleModalClose}
        size="sm"
      >
        <div style={{ padding: "1rem 0" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            marginBottom: "1rem" 
          }}>
            <Information size={20} style={{ color: "var(--cds-support-success)" }} />
            <p style={{ 
              margin: 0, 
              color: "var(--cds-text-primary)",
              fontWeight: 500
            }}>
              School account has been created with the following credentials:
            </p>
          </div>
          
          {success && (
            <div style={{ 
              background: "var(--cds-layer-accent)",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid var(--cds-border-subtle)"
            }}>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Email:</strong> {success.email}
              </div>
              <div>
                <strong>Password:</strong> {success.password}
              </div>
            </div>
          )}
          
          <p style={{ 
            margin: "1rem 0 0 0", 
            fontSize: "0.875rem",
            color: "var(--cds-text-secondary)"
          }}>
            Please save these credentials and share them with the school administrator.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default function RegisterSchoolPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <RegisterSchoolContent />
    </ProtectedRoute>
  );
}