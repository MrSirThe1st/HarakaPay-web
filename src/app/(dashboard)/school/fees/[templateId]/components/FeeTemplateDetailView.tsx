// src/app/(dashboard)/school/fees/[templateId]/components/FeeTemplateDetailView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useFeesAPI, FeeTemplate } from '@/hooks/useFeesAPI';
import { TemplateAutoAssign } from './TemplateAutoAssign';

interface FeeTemplateDetailViewProps {
  templateId: string;
}

export function FeeTemplateDetailView({ templateId }: FeeTemplateDetailViewProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<FeeTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showAutoAssign, setShowAutoAssign] = useState(false);

  const feesAPI = useFeesAPI();

  useEffect(() => {
    loadTemplate();
  }, [templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await feesAPI.feeTemplates.getById(templateId);
      if (response.success && response.data) {
        setTemplate(response.data.feeTemplate);
      } else {
        setError('Failed to load fee template');
      }
    } catch (error) {
      console.error('Error loading fee template:', error);
      setError('An error occurred while loading the fee template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!template) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await feesAPI.feeTemplates.delete(template.id);
      if (response.success) {
        setSuccess('Fee template deleted successfully');
        setTimeout(() => {
          router.push('/school/fees');
        }, 1500);
      } else {
        setError(response.error || 'Failed to delete fee template');
      }
    } catch (error) {
      setError('An error occurred while deleting the fee template');
      console.error('Error deleting fee template:', error);
    } finally {
      setIsLoading(false);
      setDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading fee template...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
        <button
          onClick={() => router.push('/school/fees')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Fees
        </button>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Fee template not found.</p>
        <button
          onClick={() => router.push('/school/fees')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Fees
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/school/fees')}
            className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
            <p className="text-sm text-gray-600">Fee Template Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAutoAssign(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <UserGroupIcon className="h-4 w-4 mr-2" />
            Auto Assign
          </button>
          <button
            onClick={() => console.log('Edit template:', template)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
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

      {/* Template Information */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Template Information</h2>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Template Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{template.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Academic Year</dt>
              <dd className="mt-1 text-sm text-gray-900">{template.academic_years?.name || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Grade Level</dt>
              <dd className="mt-1 text-sm text-gray-900">{template.grade_level}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Program Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{template.program_type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">${template.total_amount?.toLocaleString() || '0'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  template.status === 'published' ? 'bg-green-100 text-green-800' :
                  template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {template.status ? template.status.charAt(0).toUpperCase() + template.status.slice(1) : 'Unknown'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">{template.created_at ? new Date(template.created_at).toLocaleDateString() : 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">{template.updated_at ? new Date(template.updated_at).toLocaleDateString() : 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Fee Categories */}
      {template.fee_template_categories && template.fee_template_categories.length > 0 && (
        <div className="mt-6 bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Fee Categories</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {template.fee_template_categories?.map((templateCategory, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {templateCategory.fee_categories?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {templateCategory.fee_categories?.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${templateCategory.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        templateCategory.fee_categories?.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {templateCategory.fee_categories?.is_mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Fee Template</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete &quot;{template.name}&quot;? This action cannot be undone.
                </p>
                <div className="text-sm text-red-600 mt-3">
                  <p className="font-semibold mb-2">This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>All fee template categories</li>
                    <li>All payment schedules linked to this template</li>
                    <li>All student fee assignments using this template</li>
                  </ul>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
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

      {/* Auto Assign Modal */}
      {showAutoAssign && template && (
        <TemplateAutoAssign
          template={template}
          onClose={() => setShowAutoAssign(false)}
          onAssignmentComplete={() => {
            // Optionally refresh template data or show success message
            setSuccess('Fees assigned successfully!');
          }}
        />
      )}
    </div>
  );
}
