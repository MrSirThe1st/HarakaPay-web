// src/app/(dashboard)/school/staff/components/AddStaffModal.tsx
"use client";

import React, { useState } from 'react';
import { 
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  createStaff: (staffData: {
    email: string;
    first_name: string;
    last_name: string;
    permissions?: Record<string, any>;
  }) => Promise<any>;
}

interface StaffFormData {
  email: string;
  first_name: string;
  last_name: string;
  permissions: {
    canManageStudents: boolean;
    canViewReports: boolean;
    canManagePayments: boolean;
  };
}

const initialFormData: StaffFormData = {
  email: '',
  first_name: '',
  last_name: '',
  permissions: {
    canManageStudents: true,
    canViewReports: false,
    canManagePayments: false
  }
};

export function AddStaffModal({ isOpen, onClose, onSuccess, createStaff }: AddStaffModalProps) {
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handlePermissionChange = (permission: keyof StaffFormData['permissions']) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createStaff({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        permissions: formData.permissions
      });

      setGeneratedCredentials({
        email: result.data.credentials.email,
        password: result.data.credentials.password
      });
      setSuccess(true);
      setShowCredentials(true);
      
      // Refresh the staff list but don't auto-close the modal
      onSuccess();

    } catch (error) {
      console.error('Create staff error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData(initialFormData);
      setError(null);
      setSuccess(false);
      setShowCredentials(false);
      setGeneratedCredentials(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <UserPlusIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Add New Staff Member
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Create a new staff account with specific permissions.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && generatedCredentials && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm text-green-600 font-medium">Staff member created successfully!</p>
                      <div className="mt-2 p-3 bg-white rounded border">
                        <p className="text-sm text-gray-700 font-medium">Login Credentials:</p>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Email:</span>
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {generatedCredentials.email}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Password:</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {showCredentials ? generatedCredentials.password : '••••••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowCredentials(!showCredentials)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showCredentials ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Please save these credentials securely. They will not be shown again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Permissions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="canManageStudents"
                        name="canManageStudents"
                        type="checkbox"
                        checked={formData.permissions.canManageStudents}
                        onChange={() => handlePermissionChange('canManageStudents')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="canManageStudents" className="ml-2 block text-sm text-gray-900">
                        Manage Students
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="canViewReports"
                        name="canViewReports"
                        type="checkbox"
                        checked={formData.permissions.canViewReports}
                        onChange={() => handlePermissionChange('canViewReports')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="canViewReports" className="ml-2 block text-sm text-gray-900">
                        View Reports
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="canManagePayments"
                        name="canManagePayments"
                        type="checkbox"
                        checked={formData.permissions.canManagePayments}
                        onChange={() => handlePermissionChange('canManagePayments')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="canManagePayments" className="ml-2 block text-sm text-gray-900">
                        Manage Payments
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {success ? (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(initialFormData);
                      setError(null);
                      setSuccess(false);
                      setShowCredentials(false);
                      setGeneratedCredentials(null);
                    }}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Another
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Staff Member'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
