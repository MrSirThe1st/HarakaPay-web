// src/app/(dashboard)/school/fees/components/FeeManagementView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ReceiptPercentIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { ActiveTab } from '../types/feeTypes';
import { useFeesAPI, AcademicYear, FeeCategory, FeeTemplate, PaymentSchedule, StudentFeeAssignment } from '@/hooks/useFeesAPI';

interface FeeManagementViewProps {
  onCreateNew: () => void;
}

export function FeeManagementView({ onCreateNew }: FeeManagementViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('academic-year');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [feeTemplates, setFeeTemplates] = useState<FeeTemplate[]>([]);
  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<StudentFeeAssignment[]>([]);
  const [stats, setStats] = useState({
    academicYears: 0,
    feeCategories: 0,
    feeTemplates: 0,
    paymentSchedules: 0,
  });

  // Edit and delete states
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AcademicYear>>({});
  const [relatedData, setRelatedData] = useState<{
    feeTemplates: FeeTemplate[];
    paymentSchedules: PaymentSchedule[];
    academicTerms: any[];
  }>({
    feeTemplates: [],
    paymentSchedules: [],
    academicTerms: []
  });

  const feesAPI = useFeesAPI();

  const tabs = [
    { id: 'academic-year', name: 'Academic Year', icon: CalendarIcon },
    { id: 'categories', name: 'Fee Categories', icon: ClipboardDocumentListIcon },
    { id: 'structures', name: 'Fee Structures', icon: AcademicCapIcon },
    { id: 'schedules', name: 'Payment Schedules', icon: ReceiptPercentIcon },
    { id: 'publish', name: 'Publish Schedule', icon: CheckCircleIcon },
    { id: 'audit', name: 'Audit Trail', icon: DocumentTextIcon },
  ];

  // Load data when component mounts
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load academic years
      const academicYearsResponse = await feesAPI.academicYears.getAll();
      if (academicYearsResponse.success && academicYearsResponse.data) {
        setAcademicYears(academicYearsResponse.data.academicYears);
        setStats(prev => ({ ...prev, academicYears: academicYearsResponse.data!.stats.total }));
      }

      // Load fee categories
      const categoriesResponse = await feesAPI.feeCategories.getAll();
      if (categoriesResponse.success && categoriesResponse.data) {
        setFeeCategories(categoriesResponse.data.feeCategories);
        setStats(prev => ({ ...prev, feeCategories: categoriesResponse.data!.stats.total }));
      }

      // Load fee templates
      const templatesResponse = await feesAPI.feeTemplates.getAll();
      if (templatesResponse.success && templatesResponse.data) {
        setFeeTemplates(templatesResponse.data.feeTemplates);
        setStats(prev => ({ ...prev, feeTemplates: templatesResponse.data!.stats.total }));
      }

      // Load payment schedules
      const schedulesResponse = await feesAPI.paymentSchedules.getAll();
      if (schedulesResponse.success && schedulesResponse.data) {
        setPaymentSchedules(schedulesResponse.data.paymentSchedules);
        setStats(prev => ({ ...prev, paymentSchedules: schedulesResponse.data!.stats.total }));
      }

      // Load student assignments
      const assignmentsResponse = await feesAPI.studentFeeAssignments.getAll();
      if (assignmentsResponse.success && assignmentsResponse.data) {
        setStudentAssignments(assignmentsResponse.data.studentFeeAssignments);
      }
    } catch (error) {
      console.error('Error loading fees data:', error);
    }
  };

  // Handle edit academic year
  const handleEditYear = async (year: AcademicYear) => {
    setEditingYear(year);
    setEditFormData({
      name: year.name,
      start_date: year.start_date,
      end_date: year.end_date,
      term_structure: year.term_structure,
      is_active: year.is_active
    });
    setError(null);
    setSuccess(null);

    // Load related data for this academic year
    try {
      setIsLoading(true);
      
      // Load fee templates for this academic year
      const templatesResponse = await feesAPI.feeTemplates.getAll();
      const yearTemplates = templatesResponse.success && templatesResponse.data 
        ? templatesResponse.data.feeTemplates.filter(template => template.academic_year_id === year.id)
        : [];

      // Load payment schedules for this academic year's templates
      const schedulesResponse = await feesAPI.paymentSchedules.getAll();
      const templateIds = yearTemplates.map(t => t.id);
      const yearSchedules = schedulesResponse.success && schedulesResponse.data
        ? schedulesResponse.data.paymentSchedules.filter(schedule => 
            templateIds.includes(schedule.template_id || '')
          )
        : [];

      setRelatedData({
        feeTemplates: yearTemplates,
        paymentSchedules: yearSchedules,
        academicTerms: [] // TODO: Load academic terms when API is available
      });

    } catch (error) {
      console.error('Error loading related data:', error);
      setError('Failed to load related data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save edited academic year
  const handleSaveEdit = async () => {
    if (!editingYear || !editFormData.name || !editFormData.start_date || !editFormData.end_date || !editFormData.term_structure) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate dates
    const startDate = new Date(editFormData.start_date);
    const endDate = new Date(editFormData.end_date);
    
    if (startDate >= endDate) {
      setError('Start date must be before end date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await feesAPI.academicYears.update(editingYear.id, {
        name: editFormData.name,
        start_date: editFormData.start_date,
        end_date: editFormData.end_date,
        term_structure: editFormData.term_structure,
        is_active: editFormData.is_active
      });

      if (response.success) {
        setSuccess('Academic year updated successfully');
        setEditingYear(null);
        setEditFormData({});
        await loadAllData(); // Reload data
      } else {
        setError(response.error || 'Failed to update academic year');
      }
    } catch (error) {
      setError('An error occurred while updating the academic year');
      console.error('Error updating academic year:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete academic year
  const handleDeleteYear = async (year: AcademicYear) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await feesAPI.academicYears.delete(year.id);

      if (response.success) {
        setSuccess('Academic year and all related data deleted successfully');
        setDeleteConfirm(null);
        await loadAllData(); // Reload data
      } else {
        setError(response.error || 'Failed to delete academic year');
      }
    } catch (error) {
      setError('An error occurred while deleting the academic year');
      console.error('Error deleting academic year:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {feesAPI.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{feesAPI.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Local Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {feesAPI.loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading fees data...</p>
        </div>
      )}
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Academic Years</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.academicYears}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Fee Categories</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.feeCategories}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Fee Structures</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.feeTemplates}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ReceiptPercentIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Payment Schedules</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.paymentSchedules}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Tabbed Interface */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'academic-year' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Academic Year & Terms Setup</h3>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terms</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {academicYears.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                          No academic years found. Create your first academic year to get started.
                        </td>
                      </tr>
                    ) : (
                      academicYears.map((year) => (
                        <tr key={year.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{year.start_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{year.end_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{year.term_structure}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              year.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {year.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditYear(year)}
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50 flex items-center"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(year)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Fee Categories</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Category
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeCategories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                          No fee categories found. Create your first fee category to get started.
                        </td>
                      </tr>
                    ) : (
                      feeCategories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              category.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {category.is_mandatory ? 'Mandatory' : 'Optional'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              category.is_recurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.is_recurring ? 'Recurring' : 'One-time'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-green-600 hover:text-green-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other tabs will show placeholder content for now */}
          {activeTab !== 'academic-year' && activeTab !== 'categories' && (
            <div className="text-center py-12">
              <p className="text-gray-500">{tabs.find(t => t.id === activeTab)?.name} content will be implemented</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Academic Year Modal */}
      {editingYear && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Academic Year: {editingYear.name}</h3>
                <button
                  onClick={() => {
                    setEditingYear(null);
                    setEditFormData({});
                    setRelatedData({ feeTemplates: [], paymentSchedules: [], academicTerms: [] });
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Academic Year Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Academic Year Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Academic Year Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 2024-2025"
                    />
                  </div>

                  {/* Term Structure */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term Structure *
                    </label>
                    <input
                      type="text"
                      value={editFormData.term_structure || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, term_structure: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 3 Terms, 2 Semesters, Custom Structure"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={editFormData.start_date || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={editFormData.end_date || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="md:col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editFormData.is_active || false}
                      onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Set as active academic year
                    </label>
                  </div>
                </div>
              </div>

              {/* Related Data Sections */}
              <div className="space-y-6">
                {/* Fee Templates */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Fee Templates ({relatedData.feeTemplates.length})</h4>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      + Add Template
                    </button>
                  </div>
                  
                  {relatedData.feeTemplates.length === 0 ? (
                    <p className="text-gray-500 text-sm">No fee templates found for this academic year.</p>
                  ) : (
                    <div className="space-y-2">
                      {relatedData.feeTemplates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{template.name}</p>
                            <p className="text-xs text-gray-500">
                              {template.grade_level} • {template.program_type} • ${template.total_amount}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-800 text-xs">Edit</button>
                            <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Schedules */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Payment Schedules ({relatedData.paymentSchedules.length})</h4>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      + Add Schedule
                    </button>
                  </div>
                  
                  {relatedData.paymentSchedules.length === 0 ? (
                    <p className="text-gray-500 text-sm">No payment schedules found for this academic year.</p>
                  ) : (
                    <div className="space-y-2">
                      {relatedData.paymentSchedules.map((schedule) => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{schedule.name}</p>
                            <p className="text-xs text-gray-500">
                              {schedule.schedule_type} • {schedule.discount_percentage}% discount
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-800 text-xs">Edit</button>
                            <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Academic Terms */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Academic Terms ({relatedData.academicTerms.length})</h4>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      + Add Term
                    </button>
                  </div>
                  
                  {relatedData.academicTerms.length === 0 ? (
                    <p className="text-gray-500 text-sm">No academic terms found for this academic year.</p>
                  ) : (
                    <div className="space-y-2">
                      {relatedData.academicTerms.map((term) => (
                        <div key={term.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{term.name}</p>
                            <p className="text-xs text-gray-500">
                              {term.start_date} - {term.end_date}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-800 text-xs">Edit</button>
                            <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditingYear(null);
                    setEditFormData({});
                    setRelatedData({ feeTemplates: [], paymentSchedules: [], academicTerms: [] });
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Academic Year</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
                </p>
                <div className="text-sm text-red-600 mt-3">
                  <p className="font-semibold mb-2">This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>All fee templates for this academic year</li>
                    <li>All payment schedules and installments</li>
                    <li>All student fee assignments</li>
                    <li>All student payment records</li>
                    <li>All fee adjustments and scholarships</li>
                    <li>All academic terms</li>
                    <li>All audit trail records</li>
                  </ul>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDeleteYear(deleteConfirm)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
