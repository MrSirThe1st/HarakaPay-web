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
  onAssignmentComplete?: () => void;
}

export function TemplateAutoAssign({ structure, onClose, onAssignmentComplete }: TemplateAutoAssignProps) {
  const { t } = useTranslation();
  const feesAPI = useFeesAPI();

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
  const [paymentSchedules, setPaymentSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state - pre-populated with template data
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);

  // Load payment schedules for this template
  useEffect(() => {
    if (template?.id) {
      loadPaymentSchedules();
    }
  }, [template?.id]);

  const loadPaymentSchedules = async () => {
    setLoading(true);
    try {
      const schedulesResponse = await feesAPI.paymentSchedules.getAll();
      if (schedulesResponse.success && schedulesResponse.data) {
        // Filter schedules for this template
        const templateSchedules = schedulesResponse.data.paymentSchedules.filter(
          schedule => schedule.template_id === template.id
        );
        setPaymentSchedules(templateSchedules);
      }
    } catch (error) {
      console.error('Error loading payment schedules:', error);
      setError('Failed to load payment schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleToggle = (scheduleId: string) => {
    setSelectedSchedules(prev => {
      const newSchedules = prev.includes(scheduleId)
        ? prev.filter(id => id !== scheduleId)
        : [...prev, scheduleId];
      
      return newSchedules;
    });
    setError(null);
    setSuccess(null);
    setPreviewData(null);
  };

  const handlePreview = async () => {
    if (selectedSchedules.length === 0) {
      setError('Please select at least one payment schedule');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      const requestData = {
        academic_year_id: template?.academic_year_id || '',
        grade_level: template?.grade_level || '',
        program_type: template?.program_type || '',
        template_id: template?.id || '',
        schedule_ids: selectedSchedules,
        dry_run: true
      };
      
      console.log('Preview request data:', requestData);
      
      const response = await fetch('/api/school/fees/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview assignments');
      }

      setPreviewData(data.data);
    } catch (error) {
      console.error('Preview error:', error);
      setError(error instanceof Error ? error.message : 'Failed to preview assignments');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssign = async () => {
    if (selectedSchedules.length === 0) {
      setError('Please select at least one payment schedule');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      const requestData = {
        academic_year_id: template?.academic_year_id || '',
        grade_level: template?.grade_level || '',
        program_type: template?.program_type || '',
        template_id: template?.id || '',
        schedule_ids: selectedSchedules,
        dry_run: false
      };
      
      console.log('Assign request data:', requestData);
      
      const response = await fetch('/api/school/fees/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign fees');
      }

      setSuccess(data.message);
      setPreviewData(null);
      
      // Reset selected schedules
      setSelectedSchedules([]);

      // Notify parent component
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Assignment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign fees');
    } finally {
      setAssigning(false);
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
                <h3 className="text-xl font-semibold text-gray-900">Auto Assign Fees</h3>
                <p className="text-sm text-gray-600">
                  Assign &quot;{template?.name || 'Template'}&quot; to students
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

          {/* Template Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Template Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Name:</span>
                <span className="text-blue-600 ml-1">{template?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Grade:</span>
                <span className="text-blue-600 ml-1">{template?.grade_level || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Program:</span>
                <span className="text-blue-600 ml-1">{template?.program_type || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Total:</span>
                <span className="text-blue-600 ml-1">${template?.total_amount?.toLocaleString() || '0'}</span>
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

          {/* Payment Schedule Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Schedules * (Select one or more)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {paymentSchedules.length === 0 ? (
                  <p className="text-sm text-gray-500">No payment schedules available for this template</p>
                ) : (
                  paymentSchedules.map((schedule) => (
                    <label key={schedule.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedSchedules.includes(schedule.id)}
                        onChange={() => handleScheduleToggle(schedule.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={loading}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{schedule.schedule_type.replace('-', ' ')}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {selectedSchedules.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSchedules.length} schedule(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePreview}
              disabled={assigning || loading || selectedSchedules.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <InformationCircleIcon className="h-4 w-4 mr-2" />
              Preview Assignment
            </button>
            
            <button
              onClick={handleAssign}
              disabled={assigning || loading || !previewData || previewData.summary.total_assignments === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Assign Fees ({previewData?.summary?.total_assignments || 0} assignments)
                </>
              )}
            </button>
          </div>

          {/* Preview Results */}
          {previewData && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Assignment Preview</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{previewData.summary.total_students}</div>
                  <div className="text-xs text-blue-600">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{previewData.summary.new_assignments}</div>
                  <div className="text-xs text-green-600">New Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{previewData.summary.total_assignments}</div>
                  <div className="text-xs text-purple-600">Total Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{previewData.summary.existing_assignments}</div>
                  <div className="text-xs text-orange-600">Already Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{previewData.summary.schedules_count}</div>
                  <div className="text-xs text-gray-600">Schedules</div>
                </div>
              </div>

              {previewData.assignments.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  <h5 className="text-xs font-semibold text-blue-800 mb-2">Students to be assigned:</h5>
                  <div className="space-y-1">
                    {previewData.assignments.slice(0, 10).map((assignment: any, index: number) => (
                      <div key={index} className="text-xs text-blue-700 flex justify-between items-center">
                        <div>
                          <span className="font-medium">{assignment.student_name} ({assignment.student_id_display})</span>
                          <span className="text-blue-600 ml-2">- {assignment.schedule_name}</span>
                        </div>
                        <span className="font-medium">${assignment.template_total_amount?.toLocaleString() || 'N/A'}</span>
                      </div>
                    ))}
                    {previewData.assignments.length > 10 && (
                      <div className="text-xs text-blue-600 italic">
                        ... and {previewData.assignments.length - 10} more assignments
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
