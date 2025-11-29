// src/app/(dashboard)/school/staff/components/ViewStaffModal.tsx
"use client";

import React from 'react';
import { 
  EyeIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  PencilIcon,
  PhoneIcon,
  HomeIcon,
  IdentificationIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { Staff } from '@/hooks/useStaff';

interface ViewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (staff: Staff) => void;
  staff: Staff | null;
}

export function ViewStaffModal({ isOpen, onClose, onEdit, staff }: ViewStaffModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handleEdit = () => {
    if (staff) {
      onEdit(staff);
      handleClose();
    }
  };

  if (!isOpen || !staff) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
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
                  Staff Member Details
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    View detailed information about this staff member
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Staff Header */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-16 w-16">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xl font-medium text-green-800">
                      {staff.first_name.charAt(0)}{staff.last_name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {staff.first_name} {staff.last_name}
                  </h4>
                  <p className="text-sm text-gray-500">Staff Member</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(staff.is_active)}`}>
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Staff Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Personal Information
                  </h5>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Full Name</dt>
                      <dd className="text-sm text-gray-900">{staff.first_name} {staff.last_name}</dd>
                    </div>
                    {staff.staff_id && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 flex items-center">
                          <IdentificationIcon className="h-3 w-3 mr-1" />
                          Staff ID
                        </dt>
                        <dd className="text-sm text-gray-900">{staff.staff_id}</dd>
                      </div>
                    )}
                    {staff.gender && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Gender</dt>
                        <dd className="text-sm text-gray-900">{staff.gender === 'M' ? 'Male' : 'Female'}</dd>
                      </div>
                    )}
                    {staff.position && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 flex items-center">
                          <BriefcaseIcon className="h-3 w-3 mr-1" />
                          Position
                        </dt>
                        <dd className="text-sm text-gray-900 capitalize">{staff.position}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(staff.is_active)}`}>
                          {staff.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Account Information
                  </h5>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Role</dt>
                      <dd className="text-sm text-gray-900">School Staff</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">User ID</dt>
                      <dd className="text-sm text-gray-900 font-mono text-xs">{staff.user_id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Created</dt>
                      <dd className="text-sm text-gray-900">{formatDate(staff.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Last Updated</dt>
                      <dd className="text-sm text-gray-900">{formatDate(staff.updated_at)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Contact Information */}
              {(staff.work_email || staff.phone || staff.home_address) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Contact Information
                  </h5>
                  <dl className="space-y-2">
                    {staff.work_email && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 flex items-center">
                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                          Work Email
                        </dt>
                        <dd className="text-sm text-gray-900">{staff.work_email}</dd>
                      </div>
                    )}
                    {staff.phone && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          Phone Number
                        </dt>
                        <dd className="text-sm text-gray-900">{staff.phone}</dd>
                      </div>
                    )}
                    {staff.home_address && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 flex items-center">
                          <HomeIcon className="h-3 w-3 mr-1" />
                          Home Address
                        </dt>
                        <dd className="text-sm text-gray-900">{staff.home_address}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Permissions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Permissions</h5>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-700">Manage Students</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        staff.permissions?.canManageStudents 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staff.permissions?.canManageStudents ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-700">View Reports</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        staff.permissions?.canViewReports 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staff.permissions?.canViewReports ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-700">Manage Payments</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        staff.permissions?.canManagePayments 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staff.permissions?.canManagePayments ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Staff Member
            </button>
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
