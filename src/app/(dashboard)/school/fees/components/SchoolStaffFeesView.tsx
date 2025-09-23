// src/app/(dashboard)/school/fees/components/SchoolStaffFeesView.tsx
"use client";

import React, { useState } from 'react';
import { 
  CurrencyDollarIcon, 
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon,
  CogIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  terms: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    type: 'term' | 'semester' | 'quarter' | 'custom';
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeeCategory {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeeStructure {
  id: string;
  name: string;
  gradeLevel: string;
  programType: 'primary' | 'secondary' | 'university' | 'custom';
  academicYearId: string;
  categories: {
    categoryId: string;
    amount: number;
    isActive: boolean;
  }[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface GradeTemplate {
  id: string;
  name: string;
  gradeLevel: string;
  programType: 'primary' | 'secondary' | 'university' | 'custom';
  categories: {
    categoryId: string;
    amount: number;
    isActive: boolean;
  }[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaymentSchedule {
  id: string;
  name: string;
  description: string;
  scheduleType: 'upfront' | 'per-term' | 'monthly' | 'custom';
  installments: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    percentage: number;
    termId?: string;
  }[];
  discountPercentage?: number;
  isActive: boolean;
  createdAt: string;
}

interface PublishedFeeSchedule {
  id: string;
  academicYearId: string;
  publishedAt: string;
  publishedBy: string;
  status: 'draft' | 'published' | 'archived';
  structures: string[]; // Fee structure IDs
  schedules: string[]; // Payment schedule IDs
}


interface SchoolPaymentSettings {
  academicYear: string;
  termDates: {
    term1: { start: string; end: string };
    term2: { start: string; end: string };
    term3: { start: string; end: string };
  };
  currency: string;
  language: string;
  reminderSchedule: {
    daysBeforeDue: number[];
    reminderTypes: string[];
  };
  receiptConfig: {
    schoolLogo: string;
    receiptPrefix: string;
    includeAddress: boolean;
    includeContact: boolean;
    includeTaxId: boolean;
    autoGeneratePDF: boolean;
  };
}

interface AuditTrail {
  id: string;
  studentId: string;
  studentName: string;
  action: string;
  oldValue: any;
  newValue: any;
  reason: string;
  performedBy: string;
  performedAt: string;
}

export function SchoolStaffFeesView() {
  const [viewMode, setViewMode] = useState<'wizard' | 'management'>('management');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [activeTab, setActiveTab] = useState<'academic-year' | 'categories' | 'structures' | 'schedules' | 'publish' | 'audit'>('academic-year');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);

  // Wizard form data (starts empty)
  const [wizardData, setWizardData] = useState({
    academicYear: {
      name: '',
      startDate: '',
      endDate: '',
      termStructure: '3 Terms'
    },
    feeCategories: [] as FeeCategory[],
    templates: [] as GradeTemplate[],
    feeStructures: [] as FeeStructure[],
    paymentSchedules: [] as PaymentSchedule[]
  });
  
  // Mock data - replace with actual data from your backend
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([
    {
      id: '1',
      name: '2024-2025',
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      terms: [
        {
          id: 't1',
          name: 'Term 1',
          startDate: '2024-09-01',
          endDate: '2024-12-20',
          type: 'term'
        },
        {
          id: 't2',
          name: 'Term 2',
          startDate: '2025-01-06',
          endDate: '2025-04-10',
          type: 'term'
        },
        {
          id: 't3',
          name: 'Term 3',
          startDate: '2025-04-21',
          endDate: '2025-06-30',
          type: 'term'
        }
      ],
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([
    {
      id: '1',
      name: 'Tuition',
      description: 'Core academic instruction fees',
      isMandatory: true,
      isRecurring: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Books & Materials',
      description: 'Textbooks and learning materials',
      isMandatory: true,
      isRecurring: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'Uniform',
      description: 'School uniform and PE kit',
      isMandatory: false,
      isRecurring: false,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '4',
      name: 'Transport',
      description: 'School bus transportation',
      isMandatory: false,
      isRecurring: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '5',
      name: 'Lunch Program',
      description: 'School meal program',
      isMandatory: false,
      isRecurring: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '6',
      name: 'Exam Fees',
      description: 'Examination and assessment fees',
      isMandatory: true,
      isRecurring: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '7',
      name: 'Registration',
      description: 'Student registration and enrollment fees',
      isMandatory: true,
      isRecurring: false,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '8',
      name: 'Lab Fees',
      description: 'Laboratory and practical session fees',
      isMandatory: true,
      isRecurring: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '9',
      name: 'Accommodation',
      description: 'Hostel and accommodation fees',
      isMandatory: false,
      isRecurring: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([
    {
      id: '1',
      name: 'Grade 1 Fees',
      gradeLevel: '1',
      programType: 'primary',
      academicYearId: '1',
      categories: [
        { categoryId: '1', amount: 1200, isActive: true },
        { categoryId: '2', amount: 150, isActive: true },
        { categoryId: '4', amount: 80, isActive: true },
        { categoryId: '3', amount: 0, isActive: false },
        { categoryId: '5', amount: 0, isActive: false }
      ],
      totalAmount: 1430,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Grade 7 Fees',
      gradeLevel: '7',
      programType: 'secondary',
      academicYearId: '1',
      categories: [
        { categoryId: '1', amount: 1800, isActive: true },
        { categoryId: '2', amount: 250, isActive: true },
        { categoryId: '6', amount: 50, isActive: true },
        { categoryId: '3', amount: 0, isActive: false },
        { categoryId: '4', amount: 0, isActive: false },
        { categoryId: '5', amount: 0, isActive: false }
      ],
      totalAmount: 2100,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'BSc Computer Science (Year 1)',
      gradeLevel: 'Year 1',
      programType: 'university',
      academicYearId: '1',
      categories: [
        { categoryId: '1', amount: 5000, isActive: true },
        { categoryId: '7', amount: 200, isActive: true },
        { categoryId: '8', amount: 300, isActive: true },
        { categoryId: '2', amount: 0, isActive: false },
        { categoryId: '3', amount: 0, isActive: false },
        { categoryId: '4', amount: 0, isActive: false },
        { categoryId: '5', amount: 0, isActive: false },
        { categoryId: '6', amount: 0, isActive: false }
      ],
      totalAmount: 5500,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

  const [gradeTemplates, setGradeTemplates] = useState<GradeTemplate[]>([
    {
      id: '1',
      name: 'Primary School Template',
      gradeLevel: 'Primary',
      programType: 'primary',
      categories: [
        { categoryId: '1', amount: 1200, isActive: true },
        { categoryId: '2', amount: 150, isActive: true },
        { categoryId: '4', amount: 80, isActive: true }
      ],
      totalAmount: 1430,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>([
    {
      id: '1',
      name: 'Upfront Payment',
      description: 'Pay entire year upfront with 5% discount',
      scheduleType: 'upfront',
      installments: [
        { installmentNumber: 1, amount: 0, dueDate: '2024-08-15', percentage: 100 }
      ],
      discountPercentage: 5,
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Per Term Payment',
      description: 'Pay before each term starts',
      scheduleType: 'per-term',
      installments: [
        { installmentNumber: 1, amount: 0, dueDate: '2024-08-15', percentage: 40, termId: 't1' },
        { installmentNumber: 2, amount: 0, dueDate: '2025-01-01', percentage: 30, termId: 't2' },
        { installmentNumber: 3, amount: 0, dueDate: '2025-04-15', percentage: 30, termId: 't3' }
      ],
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'Monthly Installments',
      description: 'Pay monthly throughout the year',
      scheduleType: 'monthly',
      installments: [
        { installmentNumber: 1, amount: 0, dueDate: '2024-09-01', percentage: 8.33 },
        { installmentNumber: 2, amount: 0, dueDate: '2024-10-01', percentage: 8.33 },
        { installmentNumber: 3, amount: 0, dueDate: '2024-11-01', percentage: 8.33 },
        { installmentNumber: 4, amount: 0, dueDate: '2024-12-01', percentage: 8.33 },
        { installmentNumber: 5, amount: 0, dueDate: '2025-01-01', percentage: 8.33 },
        { installmentNumber: 6, amount: 0, dueDate: '2025-02-01', percentage: 8.33 },
        { installmentNumber: 7, amount: 0, dueDate: '2025-03-01', percentage: 8.33 },
        { installmentNumber: 8, amount: 0, dueDate: '2025-04-01', percentage: 8.33 },
        { installmentNumber: 9, amount: 0, dueDate: '2025-05-01', percentage: 8.33 },
        { installmentNumber: 10, amount: 0, dueDate: '2025-06-01', percentage: 8.33 },
        { installmentNumber: 11, amount: 0, dueDate: '2025-07-01', percentage: 8.33 },
        { installmentNumber: 12, amount: 0, dueDate: '2025-08-01', percentage: 8.33 }
      ],
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '4',
      name: 'Custom Schedule',
      description: '40% at registration, 30% mid-term, 30% before exams',
      scheduleType: 'custom',
      installments: [
        { installmentNumber: 1, amount: 0, dueDate: '2024-08-15', percentage: 40 },
        { installmentNumber: 2, amount: 0, dueDate: '2025-02-15', percentage: 30 },
        { installmentNumber: 3, amount: 0, dueDate: '2025-05-15', percentage: 30 }
      ],
      isActive: true,
      createdAt: '2024-01-15'
    }
  ]);

  const [publishedSchedules, setPublishedSchedules] = useState<PublishedFeeSchedule[]>([
    {
      id: '1',
      academicYearId: '1',
      publishedAt: '2024-01-15T10:00:00Z',
      publishedBy: 'Admin User',
      status: 'published',
      structures: ['1', '2', '3'],
      schedules: ['1', '2', '3', '4']
    }
  ]);


  const [schoolSettings, setSchoolSettings] = useState<SchoolPaymentSettings>({
    academicYear: '2024-2025',
    termDates: {
      term1: { start: '2024-09-01', end: '2024-12-20' },
      term2: { start: '2025-01-06', end: '2025-04-10' },
      term3: { start: '2025-04-21', end: '2025-06-30' }
    },
    currency: 'USD',
    language: 'English',
    reminderSchedule: {
      daysBeforeDue: [30, 14, 7, 1],
      reminderTypes: ['email', 'sms', 'parent_portal']
    },
    receiptConfig: {
      schoolLogo: '/logo.png',
      receiptPrefix: 'RCP',
      includeAddress: true,
      includeContact: true,
      includeTaxId: true,
      autoGeneratePDF: true
    }
  });

  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([
    {
      id: '1',
      studentId: 'stu2',
      studentName: 'Jane Smith',
      action: 'Fee Adjustment',
      oldValue: { categoryId: '1', amount: 4500 },
      newValue: { categoryId: '1', amount: 2000 },
      reason: 'Scholarship - 50% tuition reduction',
      performedBy: 'Admin User',
      performedAt: '2024-01-16T10:30:00Z'
    }
  ]);

  const wizardSteps = [
    { 
      id: 1, 
      title: 'Academic Year', 
      description: 'Set year & terms',
      icon: CalendarIcon,
      completed: wizardData.academicYear.name !== '' && wizardData.academicYear.startDate !== '' && wizardData.academicYear.endDate !== ''
    },
    { 
      id: 2, 
      title: 'Categories', 
      description: 'Define fee types',
      icon: ClipboardDocumentListIcon,
      completed: wizardData.feeCategories.length > 0
    },
    { 
      id: 3, 
      title: 'Templates', 
      description: 'Create templates',
      icon: DocumentDuplicateIcon,
      completed: wizardData.templates.length > 0
    },
    { 
      id: 4, 
      title: 'Structures', 
      description: 'Set grade fees',
      icon: AcademicCapIcon,
      completed: wizardData.feeStructures.length > 0
    },
    { 
      id: 5, 
      title: 'Schedules', 
      description: 'Payment plans',
      icon: ReceiptPercentIcon,
      completed: wizardData.paymentSchedules.length > 0
    },
    { 
      id: 6, 
      title: 'Publish', 
      description: 'Review & publish',
      icon: CheckCircleIcon,
      completed: false // Only completed when actually published
    }
  ];

  const tabs = [
    { id: 'academic-year', name: 'Academic Year', icon: CalendarIcon },
    { id: 'categories', name: 'Fee Categories', icon: ClipboardDocumentListIcon },
    { id: 'structures', name: 'Fee Structures', icon: AcademicCapIcon },
    { id: 'schedules', name: 'Payment Schedules', icon: ReceiptPercentIcon },
    { id: 'publish', name: 'Publish Schedule', icon: DocumentDuplicateIcon },
    { id: 'audit', name: 'Audit Trail', icon: DocumentTextIcon },
  ];

  const nextWizardStep = () => {
    if (wizardStep < 6) {
      setWizardStep((wizardStep + 1) as 1 | 2 | 3 | 4 | 5 | 6);
    }
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) {
      setWizardStep((wizardStep - 1) as 1 | 2 | 3 | 4 | 5 | 6);
    }
  };

  const goToWizardStep = (step: 1 | 2 | 3 | 4 | 5 | 6) => {
    setWizardStep(step);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMandatoryColor = (isMandatory: boolean) => {
    return isMandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getRecurringColor = (isRecurring: boolean) => {
    return isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management System</h1>
          <p className="text-gray-600">
            {viewMode === 'wizard' 
              ? 'Create new fee structure step by step'
              : 'Manage existing fee structures, categories, and schedules'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {viewMode === 'wizard' && (
            <button
              onClick={() => setViewMode('management')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Back to Management
            </button>
          )}
          {viewMode === 'management' && (
            <button
              onClick={() => {
                setWizardStep(1);
                setViewMode('wizard');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Fee Structure
            </button>
          )}
        </div>
      </div>

      {/* Wizard Mode */}
      {viewMode === 'wizard' && (
        <div className="space-y-6">
          {/* Wizard Progress */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Fee Structure Setup</h2>
                <p className="text-sm text-gray-600 mt-1">Configure your school's fee structure step by step</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{wizardStep}</div>
                <div className="text-sm text-gray-500">of {wizardSteps.length}</div>
              </div>
            </div>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                  style={{ width: `${((wizardStep - 1) / (wizardSteps.length - 1)) * 100}%` }}
                />
              </div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {wizardSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = wizardStep === step.id;
                  const isCompleted = step.completed;
                  const isClickable = index === 0 || wizardSteps[index - 1].completed;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center group">
                      <button
                        onClick={() => isClickable && goToWizardStep(step.id)}
                        disabled={!isClickable}
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                          isActive
                            ? 'border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/25'
                            : isCompleted
                            ? 'border-green-500 bg-green-500 text-white hover:shadow-md'
                            : isClickable
                            ? 'border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted && !isActive ? (
                          <CheckCircleIcon className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                        {isActive && (
                          <div className="absolute -inset-1 bg-green-500 rounded-full opacity-20 animate-pulse" />
                        )}
                      </button>
                      
                      <div className="mt-3 text-center max-w-20">
                        <p className={`text-sm font-medium transition-colors ${
                          isActive ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Wizard Step Content */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            {/* Step Header */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 px-8 py-6 border-b border-green-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    {wizardStep === 1 && <CalendarIcon className="w-6 h-6 text-white" />}
                    {wizardStep === 2 && <ClipboardDocumentListIcon className="w-6 h-6 text-white" />}
                    {wizardStep === 3 && <DocumentDuplicateIcon className="w-6 h-6 text-white" />}
                    {wizardStep === 4 && <AcademicCapIcon className="w-6 h-6 text-white" />}
                    {wizardStep === 5 && <ReceiptPercentIcon className="w-6 h-6 text-white" />}
                    {wizardStep === 6 && <CheckCircleIcon className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {wizardSteps[wizardStep - 1].title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {wizardStep === 1 && "Set up your academic year and define terms"}
                    {wizardStep === 2 && "Create fee categories for your school"}
                    {wizardStep === 3 && "Build reusable templates (optional)"}
                    {wizardStep === 4 && "Define fee structures for each grade"}
                    {wizardStep === 5 && "Configure payment schedules and deadlines"}
                    {wizardStep === 6 && "Review and publish your fee schedule"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Step 1: Academic Year */}
              {wizardStep === 1 && (
                <div className="space-y-6">

                <div className="max-w-2xl mx-auto">
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">Academic Year Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., 2024-2025"
                        value={wizardData.academicYear.name}
                        onChange={(e) => setWizardData(prev => ({
                          ...prev,
                          academicYear: { ...prev.academicYear, name: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Start Date *</label>
                        <input
                          type="date"
                          value={wizardData.academicYear.startDate}
                          onChange={(e) => setWizardData(prev => ({
                            ...prev,
                            academicYear: { ...prev.academicYear, startDate: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">End Date *</label>
                        <input
                          type="date"
                          value={wizardData.academicYear.endDate}
                          onChange={(e) => setWizardData(prev => ({
                            ...prev,
                            academicYear: { ...prev.academicYear, endDate: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">Term Structure</label>
                      <select 
                        value={wizardData.academicYear.termStructure}
                        onChange={(e) => setWizardData(prev => ({
                          ...prev,
                          academicYear: { ...prev.academicYear, termStructure: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        <option value="3 Terms">3 Terms</option>
                        <option value="2 Semesters">2 Semesters</option>
                        <option value="4 Quarters">4 Quarters</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </form>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div></div>
                  <button
                    onClick={nextWizardStep}
                    disabled={!wizardData.academicYear.name || !wizardData.academicYear.startDate || !wizardData.academicYear.endDate}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Next: Categories
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Fee Categories */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div className="max-w-4xl mx-auto">
                  {/* Add Category Form */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200 mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Add New Fee Category</h4>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-900">Category Name *</label>
                          <input
                            type="text"
                            placeholder="e.g., Tuition, Books, Uniform"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-900">Description</label>
                          <input
                            type="text"
                            placeholder="Brief description of this category"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span className="text-sm font-medium text-gray-900">Mandatory</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span className="text-sm font-medium text-gray-900">Recurring</span>
                        </label>
                      </div>
                      <div>
                        <button type="button" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Category
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Added Categories List */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Added Categories ({wizardData.feeCategories.length})</h4>
                    {wizardData.feeCategories.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-gray-600 font-medium">No categories added yet</p>
                        <p className="text-sm text-gray-500 mt-1">Add your first category above to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {wizardData.feeCategories.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${category.isMandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                {category.isMandatory ? 'Mandatory' : 'Optional'}
                              </span>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${category.isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {category.isRecurring ? 'Recurring' : 'One-time'}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                                <p className="text-xs text-gray-500">{category.description}</p>
                              </div>
                            </div>
                            <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    onClick={prevWizardStep}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={nextWizardStep}
                    disabled={wizardData.feeCategories.length === 0}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Next: Templates
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Templates */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Step 3: Create Templates (Optional)</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create reusable templates to speed up fee structure creation. You can skip this step if you prefer to create structures manually.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  {/* Add Template Form */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Create New Template</h4>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Template Name *</label>
                          <input
                            type="text"
                            placeholder="e.g., Primary School Template"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Program Type</label>
                          <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="university">University</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Categories for this Template</label>
                        <div className="grid grid-cols-2 gap-2">
                          {wizardData.feeCategories.map((category, index) => (
                            <label key={index} className="flex items-center p-2 border border-gray-200 rounded">
                              <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                              <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Template
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Created Templates List */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">Created Templates ({wizardData.templates.length})</h4>
                    {wizardData.templates.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <DocumentDuplicateIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2">No templates created yet. Templates help you quickly create similar fee structures.</p>
                        <p className="text-sm mt-1">You can skip this step and create structures manually in the next step.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {wizardData.templates.map((template, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                {template.programType}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {template.categories.filter(c => c.isActive).length} categories • ${template.totalAmount.toLocaleString()}
                            </div>
                            <button className="text-xs text-red-600 hover:text-red-800">
                              Remove Template
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={prevWizardStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Previous
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={nextWizardStep}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Skip Templates
                    </button>
                    <button
                      onClick={nextWizardStep}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Next: Fee Structures
                      <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Fee Structures */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Step 4: Create Fee Structures</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Set up fee structures for each grade or program level using your categories
                  </p>
                </div>

                <div className="max-w-6xl mx-auto">
                  {/* Add Structure Form */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Create New Fee Structure</h4>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Structure Name *</label>
                          <input
                            type="text"
                            placeholder="e.g., Grade 1 Fees"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Grade/Program *</label>
                          <input
                            type="text"
                            placeholder="e.g., Grade 1, Year 1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Program Type</label>
                          <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="university">University</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Set Amounts for Each Category</label>
                        <div className="space-y-2">
                          {wizardData.feeCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded bg-white">
                              <div className="flex items-center space-x-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.isMandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {category.isMandatory ? 'Mandatory' : 'Optional'}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                                  <p className="text-xs text-gray-500">{category.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  placeholder="0"
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <span className="text-sm text-gray-500">USD</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Structure
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Created Structures List */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">Created Structures ({wizardData.feeStructures.length})</h4>
                    {wizardData.feeStructures.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AcademicCapIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2">No fee structures created yet. Create your first structure above.</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Structure</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Program</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {wizardData.feeStructures.map((structure, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{structure.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {structure.gradeLevel}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    {structure.programType}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ${structure.totalAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button className="text-red-600 hover:text-red-800">Remove</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={prevWizardStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={nextWizardStep}
                    disabled={wizardData.feeStructures.length === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Next: Payment Schedules
                    <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Payment Schedules */}
            {wizardStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <ReceiptPercentIcon className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Step 5: Set Payment Schedules</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Define when fees are due and create installment plans
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  {/* Add Schedule Form */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Create New Payment Schedule</h4>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Schedule Name *</label>
                          <input
                            type="text"
                            placeholder="e.g., Upfront Payment, Monthly Installments"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Schedule Type</label>
                          <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                            <option value="upfront">Upfront</option>
                            <option value="per-term">Per Term</option>
                            <option value="monthly">Monthly</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          placeholder="Describe this payment schedule..."
                          rows={2}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Discount for Upfront Payment (%)</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Schedule
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Created Schedules List */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">Created Schedules ({wizardData.paymentSchedules.length})</h4>
                    {wizardData.paymentSchedules.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ReceiptPercentIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2">No payment schedules created yet. Create your first schedule above.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {wizardData.paymentSchedules.map((schedule, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-sm font-medium text-gray-900">{schedule.name}</h5>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {schedule.scheduleType.replace('-', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{schedule.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {schedule.installments.length} installments
                                {schedule.discountPercentage && ` • ${schedule.discountPercentage}% discount`}
                              </span>
                              <button className="text-xs text-red-600 hover:text-red-800">Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={prevWizardStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={nextWizardStep}
                    disabled={wizardData.paymentSchedules.length === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Next: Review & Publish
                    <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Publish & Review */}
            {wizardStep === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Step 6: Review & Publish</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Review your fee schedule before publishing it officially
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Ready to Publish
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Your fee schedule is complete and ready for publication. Once published, it will be visible to parents and students.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Summary</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Academic Year:</span>
                          <span className="font-medium">{wizardData.academicYear.name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fee Categories:</span>
                          <span className="font-medium">{wizardData.feeCategories.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Templates:</span>
                          <span className="font-medium">{wizardData.templates.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fee Structures:</span>
                          <span className="font-medium">{wizardData.feeStructures.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Schedules:</span>
                          <span className="font-medium">{wizardData.paymentSchedules.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Fee Structure Overview</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        {wizardData.feeStructures.length === 0 ? (
                          <p className="text-gray-500">No fee structures created yet.</p>
                        ) : (
                          wizardData.feeStructures.map((structure, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{structure.name}:</span>
                              <span className="font-medium">${structure.totalAmount.toLocaleString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={prevWizardStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Previous
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setViewMode('management')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Save as Draft
                    </button>
                    <button 
                      onClick={() => {
                        // Here you would save the wizard data and switch to management mode
                        setViewMode('management');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                      Publish Schedule
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Management Mode */}
      {viewMode === 'management' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Academic Years
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {academicYears.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Fee Categories
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {feeCategories.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AcademicCapIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Fee Structures
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {feeStructures.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ReceiptPercentIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Payment Schedules
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {paymentSchedules.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Navigation for Management */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Academic Year Tab */}
              {activeTab === 'academic-year' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Academic Year & Terms Setup</h3>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Academic Year
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            End Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Terms
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {academicYears.map((year) => (
                          <tr key={year.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{year.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(year.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(year.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {year.terms.length} terms
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(year.isActive ? 'active' : 'completed')}`}>
                                {year.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Terms Details */}
                  {academicYears.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Terms for {academicYears[0].name}
                      </h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {academicYears[0].terms.map((term) => (
                          <div key={term.id} className="bg-white p-4 rounded-lg border">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-sm font-medium text-gray-900">{term.name}</h5>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {term.type}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              <div>{new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fee Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Master Fee Categories</h3>
                    <button
                      onClick={() => setShowAddCategoryModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Category
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {feeCategories.map((category) => (
                          <tr key={category.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{category.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMandatoryColor(category.isMandatory)}`}>
                                  {category.isMandatory ? 'Mandatory' : 'Optional'}
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecurringColor(category.isRecurring)}`}>
                                  {category.isRecurring ? 'Recurring' : 'One-time'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Fee Structures Tab */}
              {activeTab === 'structures' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Fee Structures per Grade/Program</h3>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create from Template
                      </button>
                      <button
                        onClick={() => setShowAddTemplateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Structure
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Structure Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade/Program
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Program Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categories
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {feeStructures.map((structure) => (
                          <tr key={structure.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{structure.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {structure.gradeLevel}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {structure.programType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {structure.categories.filter(c => c.isActive).length} active categories
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${structure.totalAmount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Templates Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Available Templates</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {gradeTemplates.map((template) => (
                        <div key={template.id} className="bg-white p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {template.programType}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {template.categories.filter(c => c.isActive).length} categories • ${template.totalAmount.toLocaleString()}
                          </div>
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            Use Template →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Schedules Tab */}
              {activeTab === 'schedules' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Payment Schedules & Deadlines</h3>
                    <button
                      onClick={() => setShowAddPlanModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Schedule
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Schedule Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Installments
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Discount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentSchedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {schedule.scheduleType.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{schedule.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{schedule.installments.length} installments</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {schedule.discountPercentage ? `${schedule.discountPercentage}%` : 'None'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.isActive ? 'active' : 'completed')}`}>
                                {schedule.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-900">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Publish Schedule Tab */}
              {activeTab === 'publish' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Publish Official Fee Schedule</h3>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                      <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                      Publish Schedule
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Ready to Publish
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Your fee schedule is ready for publication. Once published, it will be visible to parents and students.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Academic Year
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Published Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Published By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Structures
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Schedules
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {publishedSchedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {academicYears.find(y => y.id === schedule.academicYearId)?.name || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(schedule.publishedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {schedule.publishedBy}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {schedule.structures.length} structures
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {schedule.schedules.length} schedules
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                                {schedule.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  <DocumentDuplicateIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Audit Trail Tab */}
              {activeTab === 'audit' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Fee Adjustment Audit Trail</h3>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Old Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            New Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performed By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auditTrail.map((audit) => (
                          <tr key={audit.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{audit.studentName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {audit.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                ${audit.oldValue.amount?.toLocaleString() || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                ${audit.newValue.amount?.toLocaleString() || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{audit.reason}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{audit.performedBy}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(audit.performedAt).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
