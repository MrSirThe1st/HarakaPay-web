// src/app/(dashboard)/school/students/components/SchoolStaffStudentsView.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { 
  AcademicCapIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BulkImportModal } from './BulkImportModal';
import { AddStudentModal } from './AddStudentModal';
import { EditStudentModal } from './EditStudentModal';
import { ViewStudentModal } from './ViewStudentModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { StudentImportData } from '@/lib/csvParser';
import { useStudents, Student } from '@/hooks/useStudents';
import { useTranslation } from '@/hooks/useTranslation';
import { getGradeByValue, CONGOLESE_GRADES } from '@/lib/congoleseGrades';

export function SchoolStaffStudentsView() {
  const { t } = useTranslation();
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [showViewStudent, setShowViewStudent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Bulk selection state
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Use the students hook for data management
  const {
    students,
    stats,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refreshStudents
  } = useStudents();

  const handleBulkImport = async (students: StudentImportData[]) => {
    try {
      const response = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }

      // Refresh the student list
      refreshStudents();
    } catch (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
  };

  const handleSearch = (search: string) => {
    updateFilters({ search });
  };

  const handleGradeFilter = (grade: string) => {
    updateFilters({ grade });
  };

  const handleStatusFilter = (status: string) => {
    updateFilters({ status });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  // Bulk selection handlers
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      // If all are selected, deselect all
      setSelectedStudents(new Set());
    } else {
      // Select all students
      setSelectedStudents(new Set(students.map(student => student.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;
    
    setIsBulkDeleting(true);
    try {
      const response = await fetch('/api/students/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          studentIds: Array.from(selectedStudents) 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bulk delete failed');
      }

      if (!result.success) {
        throw new Error(result.error || 'Bulk delete failed');
      }

      // Clear selection and refresh
      setSelectedStudents(new Set());
      refreshStudents();
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert(t('Failed to delete students. Please try again.'));
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewStudent(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditStudent(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }

      if (!result.success) {
        throw new Error(result.error || 'Delete failed');
      }

      // Refresh the student list
      refreshStudents();
      setShowDeleteConfirm(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete student. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddStudentSuccess = () => {
    refreshStudents();
  };

  const handleEditStudentSuccess = () => {
    refreshStudents();
  };

  // Generate grade options dynamically using Congolese grades
  const gradeOptions = useMemo(() => {
    return CONGOLESE_GRADES.map(grade => ({
      value: grade.value,
      label: grade.label
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Student Management')}</h1>
        <p className="text-gray-600">{t('Manage your school\'s student records and information')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Total Students')}
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
                <AcademicCapIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Active Students')}
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
                <AcademicCapIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('New This Month')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.newThisMonth}
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
                <AcademicCapIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Graduating')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.graduating}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('Search students by name, ID...')}
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Grade Filter */}
            <div className="sm:w-48">
              <select
                value={filters.grade}
                onChange={(e) => handleGradeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">{t('All Grades')}</option>
                {gradeOptions.map(grade => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:w-32">
              <select
                value={filters.status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">{t('All Status')}</option>
                <option value="active">{t('Active')}</option>
                <option value="inactive">{t('Inactive')}</option>
                <option value="graduated">{t('Graduated')}</option>
              </select>
            </div>

            {/* Add Student Button */}
            <button 
              onClick={() => setShowAddStudent(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('Add Student')}
            </button>
          </div>
        </div>
      </div>

      {/* Student List */}
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
              <p className="mt-2 text-sm text-gray-500">{t('Loading students...')}</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('No students found')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.grade !== 'all' || filters.status !== 'all' 
                  ? t('Try adjusting your search or filters')
                  : t('Get started by adding your first student')
                }
              </p>
            </div>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              {selectedStudents.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">
                        {t('{{count}} students selected').replace('{{count}}', selectedStudents.size.toString())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedStudents(new Set())}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {t('Clear Selection')}
                      </button>
                      <button
                        onClick={() => setShowBulkDeleteConfirm(true)}
                        disabled={isBulkDeleting}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        {isBulkDeleting ? t('Deleting...') : t('Delete Selected')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedStudents.size === students.length && students.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Student')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Student ID')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Grade')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Status')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-800">
                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.grade_level ? getGradeByValue(student.grade_level)?.label || student.grade_level : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : student.status === 'inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewStudent(student)}
                              className="text-green-600 hover:text-green-900"
                              title={t('View student')}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="text-blue-600 hover:text-blue-900"
                              title={t('Edit student')}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              className="text-red-600 hover:text-red-900"
                              title={t('Delete student')}
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

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {t('Quick Actions')}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button 
              onClick={() => setShowAddStudent(true)}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-green-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <PlusIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {t('Add New Student')}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('Register a new student in your school')}
                </p>
              </div>
            </button>

            <button 
              onClick={() => setShowBulkImport(true)}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-green-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <FunnelIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {t('Bulk Import')}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('Import multiple students at once')}
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-green-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <AcademicCapIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {t('Export Data')}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('Export student information')}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImport}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        onSuccess={handleAddStudentSuccess}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={showEditStudent}
        onClose={() => setShowEditStudent(false)}
        onSuccess={handleEditStudentSuccess}
        student={selectedStudent}
      />

      {/* View Student Modal */}
      <ViewStudentModal
        isOpen={showViewStudent}
        onClose={() => setShowViewStudent(false)}
        onEdit={handleEditStudent}
        student={selectedStudent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        student={selectedStudent}
        isDeleting={isDeleting}
      />

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBulkDeleteConfirm(false)} />

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>

            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {t('Delete Selected Students')}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {t('Are you sure you want to delete {{count}} students? This action cannot be undone.').replace('{{count}}', selectedStudents.size.toString())}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBulkDeleting ? t('Deleting...') : t('Delete')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
