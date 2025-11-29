// src/app/(dashboard)/school/students/components/EditStudentModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CONGOLESE_GRADES } from '@/lib/congoleseGrades';
import { useTranslation } from '@/hooks/useTranslation';
import { Student } from '@/hooks/useStudents';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: Student | null;
}

interface StudentFormData {
  student_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  grade_level: string;
  level: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  home_address: string;
  date_of_birth: string;
  blood_type: string;
  allergies: string;
  guardian_relationship: string;
  chronic_conditions: string;
}

export function EditStudentModal({ isOpen, onClose, onSuccess, student }: EditStudentModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<StudentFormData>({
    student_id: '',
    first_name: '',
    last_name: '',
    gender: '',
    grade_level: '',
    level: '',
    enrollment_date: '',
    status: 'active',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    home_address: '',
    date_of_birth: '',
    blood_type: '',
    allergies: '',
    guardian_relationship: '',
    chronic_conditions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form data when student changes
  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        gender: student.gender || '',
        grade_level: student.grade_level || '',
        level: student.level || student.grade_level || '',
        enrollment_date: student.enrollment_date,
        status: student.status,
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_email: student.parent_email || '',
        home_address: student.home_address || '',
        date_of_birth: student.date_of_birth || '',
        blood_type: student.blood_type || '',
        allergies: student.allergies ? student.allergies.join(', ') : '',
        guardian_relationship: student.guardian_relationship || '',
        chronic_conditions: student.chronic_conditions ? student.chronic_conditions.join(', ') : ''
      });
    }
  }, [student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert comma-separated strings to arrays
      const allergiesArray = formData.allergies
        ? formData.allergies.split(',').map(item => item.trim()).filter(item => item.length > 0)
        : [];

      const chronicConditionsArray = formData.chronic_conditions
        ? formData.chronic_conditions.split(',').map(item => item.trim()).filter(item => item.length > 0)
        : [];

      const submissionData = {
        ...formData,
        gender: formData.gender || null,
        allergies: allergiesArray.length > 0 ? allergiesArray : null,
        chronic_conditions: chronicConditionsArray.length > 0 ? chronicConditionsArray : null,
        home_address: formData.home_address.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        blood_type: formData.blood_type || null,
        guardian_relationship: formData.guardian_relationship || null
      };

      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update student');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to update student');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Update student error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update student');
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

  if (!isOpen || !student) return null;

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
                    Edit Student
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Update the student&apos;s information below. All fields marked with * are required.
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
                      <p className="text-sm text-green-600">Student updated successfully!</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                {/* Student ID */}
                <div>
                  <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    id="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter student ID"
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      {t('Gender')}
                    </label>
                    <select
                      name="gender"
                      id="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">{t('Select gender')}</option>
                      <option value="M">{t('Male')}</option>
                      <option value="F">{t('Female')}</option>
                    </select>
                  </div>
                </div>

                {/* Grade and Status */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="grade_level" className="block text-sm font-medium text-gray-700">
                      {t('Grade Level')}
                    </label>
                    <select
                      name="grade_level"
                      id="grade_level"
                      value={formData.grade_level}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">{t('Select grade')}</option>
                      {CONGOLESE_GRADES.map(grade => (
                        <option key={grade.value} value={grade.value}>{grade.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </div>
                </div>

                {/* Enrollment Date */}
                <div>
                  <label htmlFor="enrollment_date" className="block text-sm font-medium text-gray-700">
                    Enrollment Date
                  </label>
                  <input
                    type="date"
                    name="enrollment_date"
                    id="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                {/* Personal Information */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('Personal Information')}</h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                        {t('Date of Birth')}
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        id="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                        {t('Blood Type')}
                      </label>
                      <select
                        name="blood_type"
                        id="blood_type"
                        value={formData.blood_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      >
                        <option value="">{t('Select blood type')}</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="home_address" className="block text-sm font-medium text-gray-700">
                      {t('Home Address')}
                    </label>
                    <input
                      type="text"
                      name="home_address"
                      id="home_address"
                      value={formData.home_address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Enter home address"
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('Medical Information')}</h4>

                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                      {t('Allergies')}
                    </label>
                    <input
                      type="text"
                      name="allergies"
                      id="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Enter allergies (comma-separated)"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t('Separate multiple allergies with commas')}</p>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="chronic_conditions" className="block text-sm font-medium text-gray-700">
                      {t('Chronic Conditions')}
                    </label>
                    <input
                      type="text"
                      name="chronic_conditions"
                      id="chronic_conditions"
                      value={formData.chronic_conditions}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Enter chronic conditions (comma-separated)"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t('Separate multiple conditions with commas')}</p>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Parent/Guardian Information</h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="parent_name" className="block text-sm font-medium text-gray-700">
                        Parent/Guardian Name
                      </label>
                      <input
                        type="text"
                        name="parent_name"
                        id="parent_name"
                        value={formData.parent_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Enter parent/guardian name"
                      />
                    </div>
                    <div>
                      <label htmlFor="guardian_relationship" className="block text-sm font-medium text-gray-700">
                        {t('Relationship')}
                      </label>
                      <select
                        name="guardian_relationship"
                        id="guardian_relationship"
                        value={formData.guardian_relationship}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      >
                        <option value="">{t('Select relationship')}</option>
                        <option value="mother">{t('Mother')}</option>
                        <option value="father">{t('Father')}</option>
                        <option value="guardian">{t('Guardian')}</option>
                        <option value="uncle">{t('Uncle')}</option>
                        <option value="aunt">{t('Aunt')}</option>
                        <option value="grandmother">{t('Grandmother')}</option>
                        <option value="grandfather">{t('Grandfather')}</option>
                        <option value="sibling">{t('Sibling')}</option>
                        <option value="other">{t('Other')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="parent_phone"
                        id="parent_phone"
                        value={formData.parent_phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="parent_email"
                        id="parent_email"
                        value={formData.parent_email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Enter email address"
                      />
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
                {isSubmitting ? 'Updating...' : 'Update Student'}
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


