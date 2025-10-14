// src/app/(dashboard)/school/fees/components/FeeManagementView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ReceiptPercentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { useFeesAPI, AcademicYear, FeeCategory, FeeTemplate, PaymentSchedule, StudentFeeAssignment } from '@/hooks/useFeesAPI';
import { useReceiptsAPI } from '@/hooks/useReceiptsAPI';
import { ReceiptTemplate } from '@/types/receipt';

interface FeeManagementViewProps {
  onCreateNew?: () => void;
}

export function FeeManagementView({}: FeeManagementViewProps) {
  const router = useRouter();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [feeTemplates, setFeeTemplates] = useState<FeeTemplate[]>([]);
  const [, setPaymentSchedules] = useState<PaymentSchedule[]>([]);
  const [, setStudentAssignments] = useState<StudentFeeAssignment[]>([]);
  const [stats, setStats] = useState({
    academicYears: 0,
    feeCategories: 0,
    feeTemplates: 0,
    paymentSchedules: 0,
    receiptTemplates: 0,
  });

  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);

  const feesAPI = useFeesAPI();
  const receiptsAPI = useReceiptsAPI();

  // Load data when component mounts
  useEffect(() => {
    loadAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      // Load receipt templates
      const receiptsResponse = await receiptsAPI.getAll();
      if (receiptsResponse.success && receiptsResponse.data) {
        setReceiptTemplates(receiptsResponse.data.templates);
        setStats(prev => ({ ...prev, receiptTemplates: receiptsResponse.data!.templates.length }));
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
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

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentDuplicateIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Receipt Templates</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.receiptTemplates}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Templates Display */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Fee Templates</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No fee templates found.
                  </td>
                </tr>
              ) : (
                feeTemplates.map((template) => (
                  <tr 
                    key={template.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/school/fees/${template.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.grade_level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.program_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${template.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        template.status === 'published' ? 'bg-green-100 text-green-800' :
                        template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Templates Display */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Receipt Templates</h2>
            <button
              onClick={() => router.push('/school/fees/receipts')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Manage Receipts
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receiptTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No receipt templates found. Create your first template to get started.
                  </td>
                </tr>
              ) : (
                receiptTemplates.map((template) => (
                  <tr 
                    key={template.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/school/fees/receipts/designer?templateId=${template.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {template.template_name}
                      {template.is_default && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.template_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template.show_logo ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
