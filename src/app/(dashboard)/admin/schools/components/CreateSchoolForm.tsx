// src/app/(dashboard)/admin/schools/components/CreateSchoolForm.tsx
"use client";

import { useState } from "react";
import { BuildingOfficeIcon, XMarkIcon, CheckCircleIcon, ClipboardDocumentIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { createClient } from "@/lib/supabaseClientOnly";
import { CONGOLESE_GRADES, getAllLevels } from "@/lib/congoleseGrades";

interface CreateSchoolFormProps {
  onClose: () => void;
  onSuccess: (school: { id: string; name: string }) => void;
}

export default function CreateSchoolForm({ onClose, onSuccess }: CreateSchoolFormProps) {
  const { user, profile } = useDualAuth();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    registrationNumber: "",
    contactFirstName: "",
    contactLastName: "",
  });

  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "School name is required";
    }

    if (selectedGrades.length === 0) {
      newErrors.grades = "Please select at least one grade level";
    }

    if (!formData.contactFirstName.trim()) {
      newErrors.contactFirstName = "Contact first name is required";
    }

    if (!formData.contactLastName.trim()) {
      newErrors.contactLastName = "Contact last name is required";
    }

    if (formData.contactPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "Please enter a valid phone number";
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    if (!user || !profile) {
      setError("Authentication required. Please log in again.");
      return;
    }

    console.log('Form validation passed, starting submission...');
    setIsSubmitting(true);
    setError(null);

    try {
      // Verify user is authenticated
      const supabase = createClient();
      // SECURITY: Use getUser() to validate with server
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const schoolData = {
        ...formData,
        gradeLevels: selectedGrades,
      };

      console.log('Submitting school data:', schoolData);

      // SECURITY: Use cookie-based auth (HTTPOnly cookies)
      // Cookies are automatically sent with credentials: 'include'
      // DO NOT manually add Authorization header - tokens should be in HTTPOnly cookies
      const response = await fetch('/api/admin/create-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Automatically sends HTTPOnly cookies
        body: JSON.stringify(schoolData),
      });

      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create school');
      }

      if (result.success) {
        console.log('School creation successful, credentials:', result.credentials);
        setSuccess(true);
        setCreatedCredentials(result.credentials);
        onSuccess(result.school);
      } else {
        throw new Error(result.error || 'Failed to create school');
      }
    } catch (err) {
      console.error('School creation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                School Created Successfully
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
                      <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-gray-600">
              The school has been successfully created and a school admin account has been generated.
            </p>
            
            {createdCredentials ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-3">School Admin Login Credentials</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-green-800">Email:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-green-700 font-mono bg-white p-2 rounded border flex-1">{createdCredentials.email}</p>
                      <button
                        onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Password:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-green-700 font-mono bg-white p-2 rounded border flex-1">{createdCredentials.password}</p>
                      <button
                        onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                        title="Copy password"
                      >
                        {copiedField === 'password' ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mt-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Please save these credentials securely. The school admin will need these to log in to their dashboard.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">Credentials Not Available</h4>
                <p className="text-sm text-yellow-800">
                  The school was created successfully, but credentials could not be retrieved. 
                  Please use the &quot;Reset Password&quot; feature in the schools list to set up login credentials.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  onClose();
                  setSuccess(false);
                  setCreatedCredentials(null);
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5" />
              Create New School
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* School Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">School Information</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    School Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter school name"
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter school address"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactPhone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+243 XXX XXX XXX"
                    disabled={isSubmitting}
                  />
                  {errors.contactPhone && <p className="text-sm text-red-600">{errors.contactPhone}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="contact@school.com"
                    disabled={isSubmitting}
                  />
                  {errors.contactEmail && <p className="text-sm text-red-600">{errors.contactEmail}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    id="registrationNumber"
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter registration number"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Grade Levels Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-medium text-gray-900">Grade Levels</h3>
              </div>
              <p className="text-sm text-gray-600">
                Select the grade levels that this school offers. This will be used for filtering students and sending notifications.
              </p>

              {errors.grades && (
                <p className="text-sm text-red-600">{errors.grades}</p>
              )}

              {/* Group grades by level */}
              {getAllLevels().map((levelName) => {
                const levelGrades = CONGOLESE_GRADES.filter(g => g.level === levelName);
                const allSelected = levelGrades.every(g => selectedGrades.includes(g.value));
                const someSelected = levelGrades.some(g => selectedGrades.includes(g.value));

                return (
                  <div key={levelName} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id={`level-${levelName}`}
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected && !allSelected;
                        }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Add all grades from this level
                            const newGrades = levelGrades.map(g => g.value);
                            setSelectedGrades(prev => [...new Set([...prev, ...newGrades])]);
                          } else {
                            // Remove all grades from this level
                            const gradesToRemove = levelGrades.map(g => g.value);
                            setSelectedGrades(prev => prev.filter(g => !gradesToRemove.includes(g)));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <label htmlFor={`level-${levelName}`} className="font-medium text-gray-900 cursor-pointer">
                        {levelName}
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-6">
                      {levelGrades.map((grade) => (
                        <div key={grade.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`grade-${grade.value}`}
                            checked={selectedGrades.includes(grade.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGrades(prev => [...prev, grade.value]);
                              } else {
                                setSelectedGrades(prev => prev.filter(g => g !== grade.value));
                              }
                              // Clear error when user selects grades
                              if (errors.grades) {
                                setErrors(prev => ({ ...prev, grades: "" }));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={`grade-${grade.value}`}
                            className="text-sm text-gray-700 cursor-pointer"
                            title={grade.description}
                          >
                            {grade.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {selectedGrades.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>{selectedGrades.length}</strong> grade level(s) selected
                  </p>
                </div>
              )}
            </div>

            {/* Contact Person Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Primary Contact Person</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="contactFirstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    id="contactFirstName"
                    type="text"
                    required
                    value={formData.contactFirstName}
                    onChange={(e) => handleInputChange('contactFirstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactFirstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                    disabled={isSubmitting}
                  />
                  {errors.contactFirstName && <p className="text-sm text-red-600">{errors.contactFirstName}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactLastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    id="contactLastName"
                    type="text"
                    required
                    value={formData.contactLastName}
                    onChange={(e) => handleInputChange('contactLastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactLastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                    disabled={isSubmitting}
                  />
                  {errors.contactLastName && <p className="text-sm text-red-600">{errors.contactLastName}</p>}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  'Create School'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}