// src/app/(dashboard)/school/fees/receipts/components/ReceiptTemplatesList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useReceiptsAPI } from '@/hooks/useReceiptsAPI';
import { ReceiptTemplate } from '@/types/receipt';

export function ReceiptTemplatesList() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const receiptsAPI = useReceiptsAPI();

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTemplates = async () => {
    const response = await receiptsAPI.getAll();
    if (response.success && response.data) {
      setTemplates(response.data.templates);
    } else {
      setError(response.error || 'Failed to load receipt templates');
    }
  };

  const handleCreateNew = () => {
    router.push('/school/fees/receipts/designer');
  };

  const handleEdit = (templateId: string) => {
    router.push(`/school/fees/receipts/designer?templateId=${templateId}`);
  };

  const handleDuplicate = async (template: ReceiptTemplate) => {
    try {
      const duplicateTemplate = {
        template_name: `${template.template_name} (Copy)`,
        template_type: template.template_type,
        show_logo: template.show_logo,
        logo_position: template.logo_position,
        visible_fields: template.visible_fields,
        style_config: template.style_config,
      };

      const response = await receiptsAPI.create(duplicateTemplate);
      if (response.success) {
        setSuccess('Template duplicated successfully');
        await loadTemplates();
      } else {
        setError(response.error || 'Failed to duplicate template');
      }
    } catch {
      setError('An error occurred while duplicating the template');
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      const response = await receiptsAPI.delete(templateId);
      if (response.success) {
        setSuccess('Template deleted successfully');
        setDeleteConfirm(null);
        await loadTemplates();
      } else {
        setError(response.error || 'Failed to delete template');
      }
    } catch {
      setError('An error occurred while deleting the template');
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      // First, unset all other defaults
      const updatePromises = templates
        .filter(t => t.id !== templateId && t.is_default)
        .map(t => receiptsAPI.update(t.id, {
          template_name: t.template_name,
          template_type: t.template_type,
          show_logo: t.show_logo,
          logo_position: t.logo_position,
          visible_fields: t.visible_fields,
          style_config: t.style_config,
        }));

      await Promise.all(updatePromises);

      // Then set the selected template as default
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const response = await receiptsAPI.update(templateId, {
          template_name: template.template_name,
          template_type: template.template_type,
          show_logo: template.show_logo,
          logo_position: template.logo_position,
          visible_fields: template.visible_fields,
          style_config: template.style_config,
        });

        if (response.success) {
          setSuccess('Default template updated successfully');
          await loadTemplates();
        } else {
          setError(response.error || 'Failed to set default template');
        }
      }
    } catch {
      setError('An error occurred while setting the default template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipt Templates</h1>
          <p className="text-gray-600">
            Design and manage receipt templates for different fee categories
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Template
        </button>
      </div>

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

      {/* Error Message */}
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
      {receiptsAPI.loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading receipt templates...</p>
        </div>
      )}

      {/* Templates Grid */}
      {!receiptsAPI.loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <DocumentDuplicateIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No receipt templates</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first receipt template.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </button>
              </div>
            </div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{template.template_name}</h3>
                      {template.is_default && (
                        <StarIcon className="h-5 w-5 text-yellow-400 ml-2" />
                      )}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      template.is_default ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.is_default ? 'Default' : 'Template'}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Category:</span> {template.template_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Logo:</span> {template.show_logo ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Created:</span> {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Preview Thumbnail */}
                  <div className="mt-4 bg-gray-50 rounded-md p-4 border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500 text-sm">
                      Receipt Preview
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {template.template_name} - {template.template_type}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(template.id)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit template"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Duplicate template"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    {!template.is_default && (
                      <button
                        onClick={() => handleSetDefault(template.id)}
                        className="text-gray-400 hover:text-yellow-600"
                        title="Set as default"
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {!template.is_default && (
                    <button
                      onClick={() => setDeleteConfirm(template.id)}
                      className="text-red-400 hover:text-red-600"
                      title="Delete template"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
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
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Receipt Template</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this receipt template? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400"
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
