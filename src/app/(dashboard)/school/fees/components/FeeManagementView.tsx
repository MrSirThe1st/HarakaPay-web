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
  ExclamationTriangleIcon
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
    </div>
  );
}
