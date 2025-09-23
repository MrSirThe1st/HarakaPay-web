// src/app/(dashboard)/school/staff/components/EditStaffModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  PencilIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Staff } from '@/hooks/useStaff';

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staff: Staff | null;
  updateStaff: (staffId: string, staffData: {
    first_name: string;
    last_name: string;
    is_active?: boolean;
    permissions?: Record<string, any>;
  }) => Promise<any>;
}

interface StaffFormData {
  first_name: string;
  last_name: string;
  is_active: boolean;
  permissions: {
    canManageStudents: boolean;
    canViewReports: boolean;
    canManagePayments: boolean;
  };
}

export function EditStaffModal({ isOpen, onClose, onSuccess, staff, updateStaff }: EditStaffModalProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    first_name: '',
    last_name: '',
    is_active: true,
    permissions: {
      canManageStudents: false,
      canViewReports: false,
      canManagePayments: false
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form data when staff changes
  useEffect(() => {
    if (staff) {
      setFormData({
        first_name: staff.first_name,
        last_name: staff.last_name,
        is_active: staff.is_active,
        permissions: {
          canManageStudents: staff.permissions?.canManageStudents || false,
          canViewReports: staff.permissions?.canViewReports || false,
          canManagePayments: staff.permissions?.canManagePayments || false
        }
      });
    }
  }, [staff]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    if (!staff) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateStaff(staff.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        is_active: formData.is_active,
        permissions: formData.permissions
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Update staff error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen || !staff) return null;

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
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <PencilIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Edit Staff Member
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Update staff member information and permissions.
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

              {success && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm text-green-600">Staff member updated successfully!</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                {/* User ID (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={staff.user_id}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
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

                {/* Status */}
                <div>
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active (uncheck to deactivate this staff member)
                    </label>
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isSubmitting ? 'Updating...' : 'Update Staff Member'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
