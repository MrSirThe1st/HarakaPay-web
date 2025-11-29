// src/app/(dashboard)/school/students/components/ViewStudentModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  ExclamationTriangleIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  HomeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Student } from '@/hooks/useStudents';

interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  student: Student | null;
}

export function ViewStudentModal({ isOpen, onClose, onEdit, student }: ViewStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);

  // Fetch detailed student data when modal opens
  useEffect(() => {
    if (isOpen && student) {
      fetchStudentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, student]);

  const fetchStudentDetails = async () => {
    if (!student) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${student.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch student details');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch student details');
      }

      setStudentData(result.data);
    } catch (error) {
      console.error('Fetch student error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStudentData(null);
    setError(null);
    onClose();
  };

  const handleEdit = () => {
    if (studentData) {
      onEdit(studentData);
      handleClose();
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Student Details
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    View detailed information about this student
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

            {loading ? (
              <div className="mt-6 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading student details...</p>
              </div>
            ) : studentData ? (
              <div className="mt-6 space-y-6">
                {/* Student Header */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xl font-medium text-green-800">
                        {studentData.first_name.charAt(0)}{studentData.last_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {studentData.first_name} {studentData.last_name}
                    </h4>
                    <p className="text-sm text-gray-500">Student ID: {studentData.student_id}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(studentData.status)}`}>
                      {studentData.status.charAt(0).toUpperCase() + studentData.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Student Information */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <AcademicCapIcon className="h-4 w-4 mr-2" />
                      Academic Information
                    </h5>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Grade Level</dt>
                        <dd className="text-sm text-gray-900">{studentData.grade_level || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Enrollment Date</dt>
                        <dd className="text-sm text-gray-900 flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(studentData.enrollment_date)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Status</dt>
                        <dd className="text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(studentData.status)}`}>
                            {studentData.status.charAt(0).toUpperCase() + studentData.status.slice(1)}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Personal Information
                    </h5>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Student ID</dt>
                        <dd className="text-sm text-gray-900 font-mono">{studentData.student_id}</dd>
                      </div>
                      {studentData.gender && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Gender</dt>
                          <dd className="text-sm text-gray-900">{studentData.gender === 'M' ? 'Male' : 'Female'}</dd>
                        </div>
                      )}
                      {studentData.date_of_birth && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Date of Birth</dt>
                          <dd className="text-sm text-gray-900 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDate(studentData.date_of_birth)}
                          </dd>
                        </div>
                      )}
                      {studentData.blood_type && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Blood Type</dt>
                          <dd className="text-sm text-gray-900">{studentData.blood_type}</dd>
                        </div>
                      )}
                      {studentData.home_address && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Home Address</dt>
                          <dd className="text-sm text-gray-900 flex items-start">
                            <HomeIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{studentData.home_address}</span>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Medical Information */}
                {(studentData.allergies || studentData.chronic_conditions) && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h5 className="text-sm font-medium text-red-900 mb-3 flex items-center">
                      <HeartIcon className="h-4 w-4 mr-2" />
                      Medical Information
                    </h5>
                    <dl className="space-y-3">
                      {studentData.allergies && studentData.allergies.length > 0 && (
                        <div>
                          <dt className="text-xs font-medium text-red-700">Allergies</dt>
                          <dd className="text-sm text-red-900 mt-1">
                            <div className="flex flex-wrap gap-2">
                              {studentData.allergies.map((allergy, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                      {studentData.chronic_conditions && studentData.chronic_conditions.length > 0 && (
                        <div>
                          <dt className="text-xs font-medium text-red-700">Chronic Conditions</dt>
                          <dd className="text-sm text-red-900 mt-1">
                            <div className="flex flex-wrap gap-2">
                              {studentData.chronic_conditions.map((condition, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {condition}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Parent/Guardian Information */}
                {(studentData.parent_name || studentData.parent_phone || studentData.parent_email || studentData.guardian_relationship) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Parent/Guardian Information
                    </h5>
                    <dl className="space-y-3">
                      {studentData.parent_name && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Name</dt>
                          <dd className="text-sm text-gray-900">{studentData.parent_name}</dd>
                        </div>
                      )}
                      {studentData.guardian_relationship && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Relationship</dt>
                          <dd className="text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {studentData.guardian_relationship}
                            </span>
                          </dd>
                        </div>
                      )}
                      {studentData.parent_phone && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Phone</dt>
                          <dd className="text-sm text-gray-900 flex items-center">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {studentData.parent_phone}
                          </dd>
                        </div>
                      )}
                      {studentData.parent_email && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Email</dt>
                          <dd className="text-sm text-gray-900 flex items-center">
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            {studentData.parent_email}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* System Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">System Information</h5>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Created</dt>
                      <dd className="text-sm text-gray-900">{formatDate(studentData.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Last Updated</dt>
                      <dd className="text-sm text-gray-900">{formatDate(studentData.updated_at)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            {studentData && (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Student
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


