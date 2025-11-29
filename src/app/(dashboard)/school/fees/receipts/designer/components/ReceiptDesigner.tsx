// src/app/(dashboard)/school/fees/receipts/designer/components/ReceiptDesigner.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ReceiptConfigPanel } from '../../components/ReceiptConfigPanel';
import { ReceiptPreview } from '../../components/ReceiptPreview';
import { useReceiptsAPI } from '@/hooks/useReceiptsAPI';
import { 
  ReceiptTemplateForm, 
  DEFAULT_FIELD_CONFIG, 
  DEFAULT_STYLE_CONFIG 
} from '@/types/receipt';

export function ReceiptDesigner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  
  const [template, setTemplate] = useState<ReceiptTemplateForm>({
    template_name: '',
    template_type: '',
    show_logo: true,
    logo_position: 'upper-left',
    visible_fields: DEFAULT_FIELD_CONFIG,
    style_config: DEFAULT_STYLE_CONFIG,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const receiptsAPI = useReceiptsAPI();

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await receiptsAPI.getById(templateId);
      if (response.success && response.data) {
        const templateData = response.data.template;
        setTemplate({
          template_name: templateData.template_name,
          template_type: templateData.template_type,
          show_logo: templateData.show_logo,
          logo_position: templateData.logo_position,
          visible_fields: templateData.visible_fields,
          style_config: templateData.style_config,
        });
      } else {
        setError(response.error || 'Failed to load template');
      }
    } catch (_err) {
      setError('An error occurred while loading the template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template.template_name || !template.template_type) {
      setError('Template name and category are required');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      if (templateId) {
        response = await receiptsAPI.update(templateId, template);
      } else {
        response = await receiptsAPI.create(template);
      }

      if (response.success) {
        setSuccess(templateId ? 'Template updated successfully' : 'Template created successfully');
        setTimeout(() => {
          router.push('/school/fees/receipts');
        }, 1500);
      } else {
        setError(response.error || 'Failed to save template');
      }
    } catch (_err) {
      setError('An error occurred while saving the template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/school/fees/receipts');
  };

  const handleTemplateChange = (updatedTemplate: ReceiptTemplateForm) => {
    setTemplate(updatedTemplate);
    // Clear any previous messages when user makes changes
    setError(null);
    setSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {templateId ? 'Edit Receipt Template' : 'Create Receipt Template'}
            </h1>
            <p className="text-sm text-gray-600">
              Design your receipt template with live preview
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
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

      {success && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-md p-4">
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Configuration Panel */}
        <div className="w-1/3 min-w-0">
          <ReceiptConfigPanel
            template={template}
            onTemplateChange={handleTemplateChange}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </div>

        {/* Preview Panel */}
        <div className="flex-1 min-w-0">
          <ReceiptPreview template={template} />
        </div>
      </div>
    </div>
  );
}
