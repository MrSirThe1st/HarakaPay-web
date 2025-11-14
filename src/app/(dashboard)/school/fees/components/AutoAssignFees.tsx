import React, { useState, useEffect } from 'react';
import { useFeesAPI, AcademicYear, FeeTemplate, PaymentSchedule } from '@/hooks/useFeesAPI';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { CONGOLESE_GRADES, CONGOLESE_PROGRAM_TYPES } from '@/lib/congoleseGrades';
import { useTranslation } from '@/hooks/useTranslation';

interface AutoAssignFeesProps {
  onAssignmentComplete?: () => void;
}

interface PreviewAssignment {
  student_id: string;
  student_id_display: string;
  student_name: string;
  grade_level: string;
  total_amount: number;
  schedule_name: string;
  template_total_amount: number;
}

interface PreviewData {
  summary: {
    total_students: number;
    new_assignments: number;
    total_assignments: number;
    existing_assignments: number;
    schedules_count: number;
  };
  assignments: PreviewAssignment[];
  total_students: number;
  total_amount: number;
}

export function AutoAssignFees({ onAssignmentComplete }: AutoAssignFeesProps) {
  const { t } = useTranslation();
  const feesAPI = useFeesAPI();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [feeTemplates, setFeeTemplates] = useState<FeeTemplate[]>([]);
  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    academic_year_id: string;
    grade_level: string;
    program_type: string;
    template_id: string;
    schedule_ids: string[];
  }>({
    academic_year_id: '',
    grade_level: '',
    program_type: '',
    template_id: '',
    schedule_ids: [] // Changed to array
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [yearsResponse, templatesResponse, schedulesResponse] = await Promise.all([
        feesAPI.academicYears.getAll(),
        feesAPI.feeTemplates.getAll(),
        feesAPI.paymentSchedules.getAll()
      ]);

      if (yearsResponse.success) {
        setAcademicYears(yearsResponse.data?.academicYears || []);
      }
      if (templatesResponse.success) {
        setFeeTemplates(templatesResponse.data?.feeTemplates || []);
      }
      if (schedulesResponse.success) {
        setPaymentSchedules(schedulesResponse.data?.paymentSchedules || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
    setPreviewData(null);
  };

  const handleScheduleToggle = (scheduleId: string) => {
    setFormData(prev => {
      const currentSchedules = prev.schedule_ids;
      const newSchedules = currentSchedules.includes(scheduleId)
        ? currentSchedules.filter(id => id !== scheduleId)
        : [...currentSchedules, scheduleId];
      
      return { ...prev, schedule_ids: newSchedules };
    });
    setError(null);
    setSuccess(null);
    setPreviewData(null);
  };

  const handlePreview = async () => {
    if (!formData.academic_year_id || !formData.template_id || formData.schedule_ids.length === 0) {
      setError('Please select academic year, template, and at least one payment schedule');
      return;
    }

    console.log('Preview request data:', formData);
    setAssigning(true);
    setError(null);

    try {
      const response = await fetch('/api/school/fees/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dry_run: true
        }),
      });

      console.log('Preview response status:', response.status);
      const data = await response.json();
      console.log('Preview response data:', data);

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
    if (!formData.academic_year_id || !formData.template_id || formData.schedule_ids.length === 0) {
      setError('Please select academic year, template, and at least one payment schedule');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      const response = await fetch('/api/school/fees/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dry_run: false
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign fees');
      }

      setSuccess(data.message);
      setPreviewData(null);
      
      // Reset form
      setFormData({
        academic_year_id: '',
        grade_level: '',
        program_type: '',
        template_id: '',
        schedule_ids: []
      });

      // Notify parent component
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }
    } catch (error) {
      console.error('Assignment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign fees');
    } finally {
      setAssigning(false);
    }
  };

  // Filter templates and schedules based on selected academic year
  const filteredTemplates = feeTemplates.filter(template => 
    !formData.academic_year_id || template.academic_year_id === formData.academic_year_id
  );

  const filteredSchedules = paymentSchedules.filter(schedule => 
    !formData.template_id || schedule.template_id === formData.template_id
  );

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0">
          <UserGroupIcon className="h-8 w-8 text-blue-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">Automatic Fee Assignment</h3>
          <p className="text-sm text-gray-600">
            Assign fee templates to students based on grade level and program type
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year *
          </label>
          <select
            value={formData.academic_year_id}
            onChange={(e) => handleInputChange('academic_year_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name} ({year.start_date} - {year.end_date})
              </option>
            ))}
          </select>
        </div>

        {/* Grade Level Filter (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('Grade Level (Optional)')}
          </label>
          <select
            value={formData.grade_level}
            onChange={(e) => handleInputChange('grade_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">{t('All Grade Levels')}</option>
            {CONGOLESE_GRADES.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        {/* Program Type Filter (Optional) - Note: This filters the template, not students */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('Program Type Filter (Optional)')}
          </label>
          <select
            value={formData.program_type}
            onChange={(e) => handleInputChange('program_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">{t('All Program Types')}</option>
            {CONGOLESE_PROGRAM_TYPES.map((program) => (
              <option key={program.value} value={program.value}>
                {program.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {t('Note: This filters fee templates, not students. Students don\'t have program types.')}
          </p>
        </div>

        {/* Fee Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fee Template *
          </label>
          <select
            value={formData.template_id}
            onChange={(e) => handleInputChange('template_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">Select Fee Template</option>
            {filteredTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.grade_level} - {template.program_type})
              </option>
            ))}
          </select>
        </div>

        {/* Payment Schedule Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Schedules * (Select one or more)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {filteredSchedules.length === 0 ? (
              <p className="text-sm text-gray-500">No payment schedules available for the selected template</p>
            ) : (
              filteredSchedules.map((schedule) => (
                <label key={schedule.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.schedule_ids.includes(schedule.id)}
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
          {formData.schedule_ids.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {formData.schedule_ids.length} schedule(s) selected
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handlePreview}
          disabled={assigning || loading || !formData.academic_year_id || !formData.template_id || formData.schedule_ids.length === 0}
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
                {previewData.assignments.slice(0, 10).map((assignment: PreviewAssignment, index: number) => (
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
  );
}
