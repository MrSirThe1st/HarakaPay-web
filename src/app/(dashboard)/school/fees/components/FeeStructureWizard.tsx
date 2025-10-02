// src/app/(dashboard)/school/fees/components/FeeStructureWizard.tsx
"use client";

import React, { useState } from 'react';
import { 
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ReceiptPercentIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { WizardData, WizardStep } from '../types/feeTypes';
import { AcademicYearStep } from './wizard-steps/AcademicYearStep';
import { GradeProgramStep } from './wizard-steps/GradeProgramStep';
import { CategoriesStep } from './wizard-steps/CategoriesStep';
import { AmountsStep } from './wizard-steps/AmountsStep';
import { PaymentSchedulesStep } from './wizard-steps/PaymentSchedulesStep';
import { PublishStep } from './wizard-steps/PublishStep';
import { useFeesAPI } from '@/hooks/useFeesAPI';

interface FeeStructureWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function FeeStructureWizard({ onComplete, onCancel }: FeeStructureWizardProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const feesAPI = useFeesAPI();
  
  const [wizardData, setWizardData] = useState<WizardData>({
    academicYear: {
      name: '',
      startDate: '',
      endDate: '',
      termStructure: '3 Terms'
    },
    gradeProgram: {
      gradeLevel: '',
      programType: 'primary'
    },
    selectedCategories: [],
    paymentSchedule: {
      scheduleType: 'per-term',
      installments: [],
      discountPercentage: 0
    }
  });

  const wizardSteps = [
    { 
      id: 1, 
      title: 'Academic Year', 
      description: 'Choose year & terms',
      icon: CalendarIcon,
      completed: wizardData.academicYear.name !== '' && wizardData.academicYear.startDate !== '' && wizardData.academicYear.endDate !== ''
    },
    { 
      id: 2, 
      title: 'Grade/Program', 
      description: 'Select level',
      icon: AcademicCapIcon,
      completed: wizardData.gradeProgram.gradeLevel !== ''
    },
    { 
      id: 3, 
      title: 'Categories', 
      description: 'Add fee types',
      icon: ClipboardDocumentListIcon,
      completed: wizardData.selectedCategories.length > 0
    },
    { 
      id: 4, 
      title: 'Amounts', 
      description: 'Enter amounts',
      icon: ReceiptPercentIcon,
      completed: wizardData.selectedCategories.length > 0 && wizardData.selectedCategories.every(cat => cat.amount > 0)
    },
    { 
      id: 5, 
      title: 'Payment Schedule', 
      description: 'Define schedule',
      icon: ReceiptPercentIcon,
      completed: wizardData.paymentSchedule.installments.length > 0
    },
    { 
      id: 6, 
      title: 'Review & Save', 
      description: 'Save template',
      icon: CheckCircleIcon,
      completed: false // Only completed when actually saved
    }
  ];

  const goToWizardStep = (step: number) => {
    setWizardStep(step as WizardStep);
  };

  const nextWizardStep = () => {
    // Validate current step before proceeding
    if (wizardStep === 1) {
      console.log('Validating step 1:', {
        name: wizardData.academicYear.name,
        startDate: wizardData.academicYear.startDate,
        endDate: wizardData.academicYear.endDate,
        termStructure: wizardData.academicYear.termStructure
      });
      
      if (!wizardData.academicYear.name || !wizardData.academicYear.startDate || !wizardData.academicYear.endDate) {
        const missingFields = [];
        if (!wizardData.academicYear.name) missingFields.push('Name');
        if (!wizardData.academicYear.startDate) missingFields.push('Start Date');
        if (!wizardData.academicYear.endDate) missingFields.push('End Date');
        
        alert(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    if (wizardStep === 2) {
      if (!wizardData.gradeProgram.gradeLevel || !wizardData.gradeProgram.programType) {
        alert('Please fill in all required fields in the Grade/Program step');
        return;
      }
    }
    
    if (wizardStep === 3) {
      if (wizardData.selectedCategories.length === 0) {
        alert('Please select at least one fee category');
        return;
      }
    }
    
    if (wizardStep === 4) {
      const categoriesWithoutAmounts = wizardData.selectedCategories.filter(cat => !cat.amount || cat.amount <= 0);
      if (categoriesWithoutAmounts.length > 0) {
        alert('Please set amounts for all selected categories');
        return;
      }
    }
    
    if (wizardStep < 6) {
      setWizardStep((wizardStep + 1) as WizardStep);
    }
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) {
      setWizardStep((wizardStep - 1) as WizardStep);
    }
  };

  const handleSaveFeeStructure = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Debug: Log the wizard data
      console.log('Wizard data being sent:', wizardData);
      
      // Validate required fields before sending
      if (!wizardData.academicYear.name || !wizardData.academicYear.startDate || !wizardData.academicYear.endDate || !wizardData.academicYear.termStructure) {
        console.error('Missing required fields:', {
          name: wizardData.academicYear.name,
          startDate: wizardData.academicYear.startDate,
          endDate: wizardData.academicYear.endDate,
          termStructure: wizardData.academicYear.termStructure
        });
        throw new Error('Please fill in all required fields in the Academic Year step');
      }

      if (!wizardData.gradeProgram.gradeLevel || !wizardData.gradeProgram.programType) {
        throw new Error('Please fill in all required fields in the Grade/Program step');
      }

      if (wizardData.selectedCategories.length === 0) {
        throw new Error('Please select at least one fee category');
      }

      // Check if all categories have amounts set
      const categoriesWithoutAmounts = wizardData.selectedCategories.filter(cat => !cat.amount || cat.amount <= 0);
      if (categoriesWithoutAmounts.length > 0) {
        throw new Error('Please set amounts for all selected categories');
      }
      
      // Step 1: Create Academic Year (or find existing one)
      let academicYearId;
      
      // First, check if academic year already exists
      const existingYearsResponse = await feesAPI.academicYears.getAll();
      const existingYear = existingYearsResponse.success && existingYearsResponse.data?.academicYears.find(
        year => year.name === wizardData.academicYear.name
      );
      
      if (existingYear) {
        academicYearId = existingYear.id;
        console.log('Using existing academic year:', existingYear);
      } else {
        const academicYearData = {
          name: wizardData.academicYear.name,
          start_date: wizardData.academicYear.startDate,
          end_date: wizardData.academicYear.endDate,
          term_structure: wizardData.academicYear.termStructure,
          is_active: false // Don't auto-activate, let user manage this manually
        };
        
        console.log('Creating new academic year:', academicYearData);
        
        const academicYearResponse = await feesAPI.academicYears.create(academicYearData);

        console.log('Academic year API response:', academicYearResponse);

        if (!academicYearResponse.success || !academicYearResponse.data) {
          console.error('Academic year creation failed:', academicYearResponse.error);
          throw new Error(academicYearResponse.error || 'Failed to create academic year');
        }

        academicYearId = academicYearResponse.data.academicYear.id;
      }

      // Step 2: Create Fee Categories (if they don't exist)
      const categoryPromises = wizardData.selectedCategories.map(async (category) => {
        // Check if category already exists
        const existingCategories = await feesAPI.feeCategories.getAll();
        const existingCategory = existingCategories.data?.feeCategories.find(
          cat => cat.name === category.categoryName
        );

        if (existingCategory) {
          return existingCategory.id;
        }

        // Create new category
        const categoryResponse = await feesAPI.feeCategories.create({
          name: category.categoryName,
          description: `${category.categoryName} fees`,
          is_mandatory: category.isMandatory,
          is_recurring: category.isRecurring,
          category_type: 'custom'
        });

        if (!categoryResponse.success || !categoryResponse.data) {
          throw new Error(`Failed to create category: ${category.categoryName}`);
        }

        return categoryResponse.data.feeCategory.id;
      });

      const categoryIds = await Promise.all(categoryPromises);

      // Step 3: Create Fee Template first
      const totalAmount = wizardData.selectedCategories.reduce((sum, cat) => sum + cat.amount, 0);
      
      const feeTemplateResponse = await feesAPI.feeTemplates.create({
        name: `${wizardData.gradeProgram.gradeLevel} Fees - ${wizardData.academicYear.name}`,
        academic_year_id: academicYearId,
        grade_level: wizardData.gradeProgram.gradeLevel,
        program_type: wizardData.gradeProgram.programType,
        total_amount: totalAmount,
        status: 'published',
        categories: wizardData.selectedCategories.map((category, index) => ({
          category_id: categoryIds[index],
          amount: category.amount
        }))
      });

      if (!feeTemplateResponse.success || !feeTemplateResponse.data) {
        throw new Error('Failed to create fee template');
      }

      const templateId = feeTemplateResponse.data.feeTemplate.id;

      // Step 4: Create Payment Schedule (now with template_id)
      const paymentScheduleResponse = await feesAPI.paymentSchedules.create({
        name: `${wizardData.gradeProgram.gradeLevel} Payment Schedule`,
        schedule_type: wizardData.paymentSchedule.scheduleType,
        discount_percentage: wizardData.paymentSchedule.discountPercentage || 0,
        template_id: templateId,
        installments: wizardData.paymentSchedule.installments.map((inst, index) => ({
          description: inst.description || `Installment ${index + 1}`,
          amount: inst.amount,
          percentage: inst.percentage,
          due_date: inst.dueDate,
          term_id: inst.termId
        }))
      });

      if (!paymentScheduleResponse.success || !paymentScheduleResponse.data) {
        throw new Error('Failed to create payment schedule');
      }

      setSaveSuccess(true);
      
      // Wait a moment to show success message, then complete
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Error saving fee structure:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save fee structure');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error saving fee structure</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{saveError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Fee structure saved successfully!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your fee structure has been created and published. Redirecting to management view...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSaving && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Saving fee structure...</p>
        </div>
      )}

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
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 rounded-full">
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
                {wizardStep === 2 && "Select the grade or program level"}
                {wizardStep === 3 && "Add fee categories for this grade/program"}
                {wizardStep === 4 && "Enter amounts for each selected category"}
                {wizardStep === 5 && "Define payment schedule and deadlines"}
                {wizardStep === 6 && "Review and save your fee template"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* Step Content */}
          {wizardStep === 1 && (
            <AcademicYearStep 
              data={wizardData.academicYear}
              onChange={(data) => {
                console.log('Wizard received academic year data:', data);
                setWizardData(prev => {
                  const updated = { ...prev, academicYear: data };
                  console.log('Updated wizard data:', updated);
                  return updated;
                });
              }}
            />
          )}
          
          {wizardStep === 2 && (
            <GradeProgramStep 
              data={wizardData.gradeProgram}
              onChange={(data) => setWizardData(prev => ({ ...prev, gradeProgram: data }))}
            />
          )}
          
          {wizardStep === 3 && (
            <CategoriesStep 
              selectedCategories={wizardData.selectedCategories}
              onChange={(categories) => setWizardData(prev => ({ ...prev, selectedCategories: categories }))}
            />
          )}
          
          {wizardStep === 4 && (
            <AmountsStep 
              selectedCategories={wizardData.selectedCategories}
              onChange={(categories) => setWizardData(prev => ({ ...prev, selectedCategories: categories }))}
            />
          )}
          
          {wizardStep === 5 && (
            <PaymentSchedulesStep 
              paymentSchedule={wizardData.paymentSchedule}
              onChange={(schedule) => setWizardData(prev => ({ ...prev, paymentSchedule: schedule }))}
            />
          )}
          
          {wizardStep === 6 && (
              <PublishStep 
                wizardData={wizardData} 
                onPublish={handleSaveFeeStructure}
                isSaving={isSaving}
              />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <EyeIcon className="mr-2 w-4 h-4" />
          Back to Management
        </button>
        <div className="flex space-x-3">
          {wizardStep > 1 && (
            <button
              onClick={prevWizardStep}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          )}
          {wizardStep < 6 ? (
            <button
              onClick={nextWizardStep}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
            >
              Next: {wizardSteps[wizardStep]?.title}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Publish Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
