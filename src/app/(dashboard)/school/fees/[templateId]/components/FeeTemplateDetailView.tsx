// src/app/(dashboard)/school/fees/[templateId]/components/FeeTemplateDetailView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon, ExclamationTriangleIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useFeesAPI, FeeStructure } from '@/hooks/useFeesAPI';
import { TemplateAutoAssign } from './TemplateAutoAssign';

interface FeeStructureDetailViewProps {
  templateId: string;
}

export function FeeStructureDetailView({ templateId }: FeeStructureDetailViewProps) {
  const router = useRouter();
  const [structure, setStructure] = useState<FeeStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showAutoActivate, setShowAutoActivate] = useState(false);

  const feesAPI = useFeesAPI();

  useEffect(() => {
    loadStructure();
  }, [templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStructure = async () => {
    try {
      setIsLoading(true);
      const response = await feesAPI.feeStructures.getById(templateId);
      if (response.success && response.data) {
        setStructure(response.data.feeStructure);
      } else {
        setError('Failed to load fee structure');
      }
    } catch (error) {
      console.error('Error loading fee structure:', error);
      setError('An error occurred while loading the fee structure');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!structure) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await feesAPI.feeStructures.update(structure.id, {
        is_published: !structure.is_published
      });
      
      if (response.success && response.data) {
        setStructure(response.data.feeStructure);
        setSuccess(`Fee structure ${structure.is_published ? 'unpublished' : 'published'} successfully`);
      } else {
        setError(response.error || 'Failed to update fee structure');
      }
    } catch (error) {
      setError('An error occurred while updating the fee structure');
      console.error('Error updating fee structure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!structure) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await feesAPI.feeStructures.delete(structure.id);
      if (response.success) {
        setSuccess('Fee structure deleted successfully');
        setTimeout(() => {
          router.push('/school/fees');
        }, 1500);
      } else {
        setError(response.error || 'Failed to delete fee structure');
      }
    } catch (error) {
      setError('An error occurred while deleting the fee structure');
      console.error('Error deleting fee structure:', error);
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
          <p className="mt-2 text-sm text-gray-500">Loading fee structure...</p>
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

  if (!structure) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Fee structure not found.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">{structure.name}</h1>
            <p className="text-sm text-gray-600">Fee Template Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAutoActivate(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <UserGroupIcon className="h-4 w-4 mr-2" />
            Activate Structure
          </button>
          <button
            onClick={() => handlePublishToggle()}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
              structure.is_published 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {structure.is_published ? 'Unpublish' : 'Publish'}
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

      {/* Structure Information */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Structure Information</h2>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Structure Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{structure.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Academic Year</dt>
              <dd className="mt-1 text-sm text-gray-900">{structure.academic_years?.name || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Grade Level</dt>
              <dd className="mt-1 text-sm text-gray-900">{structure.grade_level}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Applies To</dt>
              <dd className="mt-1 text-sm text-gray-900">{structure.applies_to}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">${structure.total_amount?.toLocaleString() || '0'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  structure.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {structure.is_published ? 'Published' : 'Draft'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">{structure.created_at ? new Date(structure.created_at).toLocaleDateString() : 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">{structure.updated_at ? new Date(structure.updated_at).toLocaleDateString() : 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Fee Categories */}
      {structure.fee_structure_items && structure.fee_structure_items.length > 0 && (
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
                {structure.fee_structure_items?.map((structureItem, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {structureItem.fee_categories?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {structureItem.fee_categories?.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${structureItem.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        structureItem.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {structureItem.is_mandatory ? 'Mandatory' : 'Optional'}
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
                  Are you sure you want to delete &quot;{structure.name}&quot;? This action cannot be undone.
                </p>
                <div className="text-sm text-red-600 mt-3">
                  <p className="font-semibold mb-2">This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>All fee structure items</li>
                    <li>All payment plans linked to this structure</li>
                    <li>All student fee assignments using this structure</li>
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

      {/* Auto Activate Modal */}
      {showAutoActivate && structure && (
        <TemplateAutoAssign
          structure={structure}
          onClose={() => setShowAutoActivate(false)}
          onActivationComplete={() => {
            // Refresh structure data to show updated status
            loadStructure();
            setSuccess('Fee structure activated successfully!');
          }}
        />
      )}
    </div>
  );
}
