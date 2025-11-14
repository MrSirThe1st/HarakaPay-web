// src/app/(dashboard)/school/staff/components/StaffManagementView.tsx
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useStaff, Staff } from '@/hooks/useStaff';
import { useTranslation } from '@/hooks/useTranslation';

// Lazy load modals - they're only rendered when needed
const AddStaffModal = dynamic(() => import('./AddStaffModal').then(mod => ({ default: mod.AddStaffModal })), {
  loading: () => null,
  ssr: false
});

const EditStaffModal = dynamic(() => import('./EditStaffModal').then(mod => ({ default: mod.EditStaffModal })), {
  loading: () => null,
  ssr: false
});

const ViewStaffModal = dynamic(() => import('./ViewStaffModal').then(mod => ({ default: mod.ViewStaffModal })), {
  loading: () => null,
  ssr: false
});

const DeleteStaffModal = dynamic(() => import('./DeleteStaffModal').then(mod => ({ default: mod.DeleteStaffModal })), {
  loading: () => null,
  ssr: false
});

export function StaffManagementView() {
  const { t } = useTranslation();
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [showViewStaff, setShowViewStaff] = useState(false);
  const [showDeleteStaff, setShowDeleteStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Use the staff hook for data management
  const {
    staff,
    stats,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refreshStaff,
    createStaff,
    updateStaff,
    deleteStaff
  } = useStaff();

  const handleSearch = useCallback((search: string) => {
    updateFilters({ search });
  }, [updateFilters]);

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const handleViewStaff = useCallback((staff: Staff) => {
    setSelectedStaff(staff);
    setShowViewStaff(true);
  }, []);

  const handleEditStaff = useCallback((staff: Staff) => {
    setSelectedStaff(staff);
    setShowEditStaff(true);
  }, []);

  const handleDeleteStaff = useCallback((staff: Staff) => {
    setSelectedStaff(staff);
    setShowDeleteStaff(true);
  }, []);

  const handleAddStaffSuccess = useCallback(() => {
    refreshStaff();
  }, [refreshStaff]);

  const handleEditStaffSuccess = useCallback(() => {
    refreshStaff();
  }, [refreshStaff]);

  const handleDeleteStaffSuccess = useCallback(() => {
    refreshStaff();
  }, [refreshStaff]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Staff Management')}</h1>
        <p className="text-gray-600">{t('Manage your school staff members and their permissions')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Total Staff')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Active Staff')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.active}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Inactive Staff')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.inactive}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Staff */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('Search staff by name...')}
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Add Staff Button */}
            <button 
              onClick={() => setShowAddStaff(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('Add Staff Member')}
            </button>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">{t('Loading staff...')}</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('No staff members found')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search 
                  ? t('Try adjusting your search')
                  : t('Get started by adding your first staff member')
                }
              </p>
            </div>
          ) : (
            <>
              {/* Staff Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('Staff Member')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('Status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('Created')}
                        </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staff.map((staffMember) => (
                      <tr key={staffMember.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-800">
                                  {staffMember.first_name.charAt(0)}{staffMember.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {staffMember.first_name} {staffMember.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            staffMember.is_active 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {staffMember.is_active ? t('Active') : t('Inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(staffMember.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewStaff(staffMember)}
                              className="text-green-600 hover:text-green-900"
                              title={t('View staff member')}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditStaff(staffMember)}
                              className="text-blue-600 hover:text-blue-900"
                              title={t('Edit staff member')}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staffMember)}
                              className="text-red-600 hover:text-red-900"
                              title={t('Delete staff member')}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('Previous')}
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('Next')}
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {t('Showing')}{' '}
                        <span className="font-medium">
                          {((pagination.page - 1) * pagination.limit) + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        {t('of')}{' '}
                        <span className="font-medium">{pagination.total}</span>{' '}
                        {t('results')}
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const pageNum = Math.max(1, pagination.page - 2) + i;
                          if (pageNum > pagination.pages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === pagination.page
                                  ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddStaffModal
        isOpen={showAddStaff}
        onClose={() => setShowAddStaff(false)}
        onSuccess={handleAddStaffSuccess}
        createStaff={createStaff}
      />

      <EditStaffModal
        isOpen={showEditStaff}
        onClose={() => setShowEditStaff(false)}
        onSuccess={handleEditStaffSuccess}
        staff={selectedStaff}
        updateStaff={updateStaff}
      />

      <ViewStaffModal
        isOpen={showViewStaff}
        onClose={() => setShowViewStaff(false)}
        onEdit={handleEditStaff}
        staff={selectedStaff}
      />

      <DeleteStaffModal
        isOpen={showDeleteStaff}
        onClose={() => setShowDeleteStaff(false)}
        onConfirm={handleDeleteStaffSuccess}
        staff={selectedStaff}
        deleteStaff={deleteStaff}
      />
    </div>
  );
}
