// src/app/(dashboard)/school/fees/components/FeeManagementView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useFeesAPI, FeeStructure } from '@/hooks/useFeesAPI';

interface FeeManagementViewProps {
  onCreateNew?: () => void;
}

export function FeeManagementView({}: FeeManagementViewProps) {
  const router = useRouter();
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  const feesAPI = useFeesAPI();

  // Load data when component mounts
  useEffect(() => {
    loadAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllData = async () => {
    try {
      // Load academic years
      // const academicYearsResponse = await feesAPI.academicYears.getAll();
      // if (academicYearsResponse.success && academicYearsResponse.data) {
      //   setAcademicYears(academicYearsResponse.data.academicYears);
      //   setStats(prev => ({ ...prev, academicYears: academicYearsResponse.data!.stats.total }));
      // }

      // Load fee categories
      // const categoriesResponse = await feesAPI.feeCategories.getAll();
      // if (categoriesResponse.success && categoriesResponse.data) {
      //   setFeeCategories(categoriesResponse.data.feeCategories);
      //   setStats(prev => ({ ...prev, feeCategories: categoriesResponse.data!.stats.total }));
      // }

      // Load fee structures
      const structuresResponse = await feesAPI.feeStructures.getAll();
      if (structuresResponse.success && structuresResponse.data) {
        setFeeStructures(structuresResponse.data.feeStructures);
      }

      // Load payment plans
      // const plansResponse = await feesAPI.paymentPlans.getAll();
      // if (plansResponse.success && plansResponse.data) {
      //   setPaymentPlans(plansResponse.data.paymentPlans);
      //   setStats(prev => ({ ...prev, paymentPlans: plansResponse.data!.stats.total }));
      // }

      // Load student assignments
      // const assignmentsResponse = await feesAPI.studentFeeAssignments.getAll();
      // if (assignmentsResponse.success && assignmentsResponse.data) {
      //   setStudentAssignments(assignmentsResponse.data.studentFeeAssignments);
      // }

      // Receipt templates are managed on the dedicated receipts page
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
        {/* <div className="bg-white overflow-hidden shadow rounded-lg">
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
        </div> */}

        {/* <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Fee Structures</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.feeStructures}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ReceiptPercentIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Payment Plans</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.paymentPlans}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className="bg-white overflow-hidden shadow rounded-lg">
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
        </div> */}
      </div>

      {/* Fee Structures Display */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Fee Structures</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applies To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeStructures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No fee structures found.
                  </td>
                </tr>
              ) : (
                feeStructures.map((structure) => (
                  <tr 
                    key={structure.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/school/fees/${structure.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{structure.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{structure.grade_level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{structure.applies_to}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${structure.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        structure.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {structure.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => router.push('/school/fees/receipts')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Manage Receipt Templates
            </button>
            <button
              onClick={() => router.push('/school/fees/structures/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Fee Structure
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
