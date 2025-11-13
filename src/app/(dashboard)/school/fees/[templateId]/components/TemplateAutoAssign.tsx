import React, { useState, useEffect } from 'react';
import { useFeesAPI } from '@/hooks/useFeesAPI';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import { FeeStructure } from '@/hooks/useFeesAPI';

interface TemplateAutoAssignProps {
  structure: FeeStructure;
  onClose: () => void;
  onActivationComplete?: () => void;
}

export function TemplateAutoAssign({ structure, onClose, onActivationComplete }: TemplateAutoAssignProps) {
  const { t } = useTranslation();
  const feesAPI = useFeesAPI();
  
  // All hooks must be called before any early returns
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Safety check - don't render if structure is not available
  if (!structure) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
          <div className="mt-3 text-center">
            <p className="text-red-600">Template not found</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No need to load payment plans separately - they'll be fetched by the API
  useEffect(() => {
    // Component is ready to use
  }, [structure?.id]);

  const handlePreview = async () => {
    setActivating(true);
    setError(null);

    try {
      const requestData = {
        dry_run: true
      };
      
      console.log('Preview request data:', requestData);
      
      const response = await fetch(`/api/school/fees/structures/${structure.id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview activation');
      }

      setPreviewData(data.data);
    } catch (error) {
      console.error('Preview error:', error);
      setError(error instanceof Error ? error.message : 'Failed to preview activation');
    } finally {
      setActivating(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    setError(null);

    try {
      const requestData = {
        // No payment plan selection needed - API will use all available plans
      };
      
      console.log('Activate request data:', requestData);
      
      const response = await fetch(`/api/school/fees/structures/${structure.id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate fee structure');
      }

      setSuccess(data.message);
      setPreviewData(null);

      // Notify parent component
      if (onActivationComplete) {
        onActivationComplete();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Activation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to activate fee structure');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">Activate Fee Structure</h3>
                <p className="text-sm text-gray-600">
                  Activate &quot;{structure?.name || 'Fee Structure'}&quot; for students
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Structure Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Fee Structure Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Name:</span>
                <span className="text-blue-600 ml-1">{structure?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Grade:</span>
                <span className="text-blue-600 ml-1">{structure?.grade_level || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Applies To:</span>
                <span className="text-blue-600 ml-1">{structure?.applies_to || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Total:</span>
                <span className="text-blue-600 ml-1">${structure?.total_amount?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Plans Info */}
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 mb-2">Payment Plans</h4>
              <p className="text-sm text-green-700">
                All payment plans created for this fee structure will be automatically included when activating.
                Students will be assigned to the primary payment plan by default.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePreview}
              disabled={activating || loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <InformationCircleIcon className="h-4 w-4 mr-2" />
              Preview Activation
            </button>
            
            <button
              onClick={handleActivate}
              disabled={activating || loading || !previewData || previewData.activated_students === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Activate Structure ({previewData?.activated_students || 0} students)
                </>
              )}
            </button>
          </div>

          {/* Preview Results */}
          {previewData && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Activation Preview</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{previewData.total_eligible_students}</div>
                  <div className="text-xs text-blue-600">Total Eligible</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{previewData.activated_students}</div>
                  <div className="text-xs text-green-600">Will Be Activated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{previewData.already_activated}</div>
                  <div className="text-xs text-orange-600">Already Activated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{previewData.academic_year_activated ? 'Yes' : 'No'}</div>
                  <div className="text-xs text-purple-600">Academic Year</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{previewData.payment_plans_used || 0}</div>
                  <div className="text-xs text-indigo-600">Payment Plans</div>
                </div>
              </div>

              {previewData.message && (
                <div className="text-sm text-blue-800 bg-blue-100 p-3 rounded-lg">
                  {previewData.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
