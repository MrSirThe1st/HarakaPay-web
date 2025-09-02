"use client";

import React, { useState } from 'react';
import { BuildingOfficeIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Database } from '@/types/supabase';

type School = Database['public']['Tables']['schools']['Row'];

interface SchoolFormData {
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  registrationNumber: string;
  contactFirstName: string;
  contactLastName: string;
}

interface CreateSchoolFormProps {
  onClose: () => void;
  onSuccess: (school: School) => void;
}

export function CreateSchoolForm({ onClose, onSuccess }: CreateSchoolFormProps) {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    registrationNumber: '',
    contactFirstName: '',
    contactLastName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('School name is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('School address is required');
      return false;
    }
    if (!formData.contactFirstName.trim()) {
      setError('Contact first name is required');
      return false;
    }
    if (!formData.contactLastName.trim()) {
      setError('Contact last name is required');
      return false;
    }
    if (!formData.contactPhone.trim()) {
      setError('Contact phone is required');
      return false;
    }
    if (!formData.registrationNumber.trim()) {
      setError('Registration number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/create-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create school');
      }

      if (result.success) {
        setSuccess(true);
        setCreatedCredentials(result.credentials);
        onSuccess(result.school);
      } else {
        throw new Error(result.error || 'Failed to create school');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
              The school has been successfully created and a school staff account has been generated.
            </p>
            
            {createdCredentials && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">School Staff Credentials</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {createdCredentials.email}
                  </div>
                  <div>
                    <span className="font-medium">Password:</span> {createdCredentials.password}
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Please save these credentials securely. The school staff can use them to log in.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={onClose}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    School Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter school name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                    Registration Number *
                  </label>
                  <input
                    id="registrationNumber"
                    name="registrationNumber"
                    type="text"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    placeholder="Enter registration number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter school address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="contactFirstName" className="block text-sm font-medium text-gray-700">
                    Contact First Name *
                  </label>
                  <input
                    id="contactFirstName"
                    name="contactFirstName"
                    type="text"
                    value={formData.contactFirstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactLastName" className="block text-sm font-medium text-gray-700">
                    Contact Last Name *
                  </label>
                  <input
                    id="contactLastName"
                    name="contactLastName"
                    type="text"
                    value={formData.contactLastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="Enter contact email (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                    Contact Phone *
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="Enter contact phone"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create School'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
