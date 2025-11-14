// src/app/(dashboard)/admin/platform-users/components/PlatformUsersView.tsx
"use client";

import React, { useState, } from 'react';
import { 
  UserPlusIcon, 
  CheckCircleIcon, 
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useDualAuth } from '@/hooks/shared/hooks/useDualAuth';
import { AdminCredentials } from '@/types/user';

interface AdminFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'platform_admin' | 'support_admin' | 'super_admin';
  phone: string;
}

export function PlatformUsersView() {
  const { user, profile } = useDualAuth();
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'platform_admin',
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<(AdminCredentials & { password?: string }) | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user || !profile) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create admin');
      }

      if (result.success) {
        setSuccess(true);
        setCreatedAdmin(result.admin);
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          role: 'platform_admin',
          phone: ''
        });
      } else {
        throw new Error(result.error || 'Failed to create admin');
      }
    } catch (err) {
      console.error('Admin creation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const closeSuccessModal = () => {
    setSuccess(false);
    setCreatedAdmin(null);
  };

  if (success && createdAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UserPlusIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Platform Admin</h1>
            <p className="text-gray-600">Create new administrator accounts for the platform</p>
          </div>
        </div>

        {/* Success Modal */}
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                  <CheckCircleIcon className="h-5 w-5" />
                  Admin Created Successfully
                </h3>
                <button
                  onClick={closeSuccessModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                The platform admin has been successfully created and can now access the platform.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Admin Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {createdAdmin.first_name || ''} {createdAdmin.last_name || ''}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {createdAdmin.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {createdAdmin.role || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Admin Type:</span> {createdAdmin.admin_type || 'N/A'}
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mt-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> The admin password was generated and shown during creation. 
                    Use the admin management system to reset passwords if needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={closeSuccessModal}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Another Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserPlusIcon className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Platform Admin</h1>
          <p className="text-gray-600">Create new administrator accounts for the platform</p>
        </div>
      </div>

      {/* Create Admin Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Admin Information</h2>
        </div>
        
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="admin@harakapay.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+243 XXX XXX XXX"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Admin Role</h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Admin Role *
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value as AdminFormData['role'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="platform_admin">Platform Admin</option>
                    <option value="support_admin">Support Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Role Permissions:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    {formData.role === 'super_admin' && (
                      <p>• Full platform access and control</p>
                    )}
                    {formData.role === 'platform_admin' && (
                      <p>• Manage schools, users, and platform settings</p>
                    )}
                    {formData.role === 'support_admin' && (
                      <p>• Support users and view basic platform information</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating Admin...
                  </>
                ) : (
                  'Create Platform Admin'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}