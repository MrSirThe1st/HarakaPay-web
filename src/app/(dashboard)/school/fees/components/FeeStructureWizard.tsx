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
import { useTranslation } from '@/hooks/useTranslation';

interface FeeStructureWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function FeeStructureWizard({ onComplete, onCancel }: FeeStructureWizardProps) {
  const { t } = useTranslation();
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
    appliesTo: 'school', // New field: 'school' or array of grade levels
    selectedCategories: [],
    paymentSchedule: {
      scheduleType: 'per-term',
      installments: [],
      discountPercentage: 0
    },
    additionalPaymentSchedule: {
      scheduleType: 'upfront',
      installments: [],
      discountPercentage: 0
    }
  });

  const wizardSteps = [
    { 
      id: 1, 
      title: t('Academic Year'), 
      description: t('Choose year & terms'),
      icon: CalendarIcon,
      completed: wizardData.academicYear.name !== '' && wizardData.academicYear.startDate !== '' && wizardData.academicYear.endDate !== ''
    },
    { 
      id: 2, 
      title: t('Grade/Program'), 
      description: t('Select level'),
      icon: AcademicCapIcon,
      completed: wizardData.gradeProgram.gradeLevel !== ''
    },
    { 
      id: 3, 
      title: t('Categories'), 
      description: t('Add fee types'),
      icon: ClipboardDocumentListIcon,
      completed: wizardData.selectedCategories.length > 0
    },
    { 
      id: 4, 
      title: t('Amounts'), 
      description: t('Enter amounts'),
      icon: ReceiptPercentIcon,
      completed: wizardData.selectedCategories.length > 0 && wizardData.selectedCategories.every(cat => cat.amount > 0)
    },
    { 
      id: 5, 
      title: t('Payment Schedule'), 
      description: t('Define schedule'),
      icon: ReceiptPercentIcon,
      completed: wizardData.paymentSchedule.installments.length > 0
    },
    { 
      id: 6, 
      title: t('Review & Save'), 
      description: t('Save template'),
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
      console.log('Publishing fee structure with wizard data:', wizardData);
      console.log('Payment schedule installments:', wizardData.paymentSchedule.installments);
      console.log('Additional payment schedule installments:', wizardData.additionalPaymentSchedule?.installments);
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
          console.error('Full response:', academicYearResponse);
          throw new Error(academicYearResponse.error || 'Failed to create academic year');
        }

        academicYearId = academicYearResponse.data.academicYear.id;
        console.log('Created academic year with ID:', academicYearId);
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
          is_recurring: category.supportsRecurring,
          category_type: category.categoryType
        });

        if (!categoryResponse.success || !categoryResponse.data) {
          throw new Error(`Failed to create category: ${category.categoryName}`);
        }

        return categoryResponse.data.feeCategory.id;
      });

      const categoryIds = await Promise.all(categoryPromises);

      // Step 3: Create Fee Structure first
      const totalAmount = wizardData.selectedCategories.reduce((sum, cat) => sum + cat.amount, 0);
      
      console.log('Creating fee structure with:', {
        academicYearId,
        categoryIds,
        totalAmount,
        wizardData: {
          gradeLevel: wizardData.gradeProgram.gradeLevel,
          academicYearName: wizardData.academicYear.name
        }
      });
      
      const feeStructureResponse = await feesAPI.feeStructures.create({
        name: `${wizardData.gradeProgram.gradeLevel} Fees - ${wizardData.academicYear.name}`,
        academic_year_id: academicYearId,
        grade_level: wizardData.gradeProgram.gradeLevel,
        applies_to: wizardData.appliesTo === 'school' ? 'school' : wizardData.gradeProgram.gradeLevel,
        total_amount: totalAmount,
        is_active: true,
        is_published: false,
        items: wizardData.selectedCategories.map((category, index) => ({
          category_id: categoryIds[index],
          amount: category.amount,
          is_mandatory: category.isMandatory,
          is_recurring: category.supportsRecurring,
          payment_modes: category.categoryType === 'tuition' ? ['per-term', 'one_time'] : ['one_time']
        }))
      });

      if (!feeStructureResponse.success || !feeStructureResponse.data) {
        throw new Error('Failed to create fee structure');
      }

      const structureId = feeStructureResponse.data.feeStructure.id;

      // Step 4: Create Payment Plans for tuition (always create both installment and one-time)
      let tuitionInstallmentPlanResponse = null;
      let tuitionOneTimePlanResponse = null;
      
      // Create installment plan if there are installments
      if (wizardData.paymentSchedule.installments && wizardData.paymentSchedule.installments.length > 0) {
        console.log('Creating tuition installment plan:', wizardData.paymentSchedule.installments);
        
        tuitionInstallmentPlanResponse = await feesAPI.paymentPlans.create({
          structure_id: structureId,
          name: `${wizardData.paymentSchedule.scheduleType} Payment Plan`,
          type: wizardData.paymentSchedule.scheduleType as 'monthly' | 'per-term' | 'upfront',
          discount_percentage: wizardData.paymentSchedule.discountPercentage || 0,
          currency: 'USD',
          installments: wizardData.paymentSchedule.installments.map((inst, index) => ({
            label: wizardData.paymentSchedule.scheduleType === 'per-term' ? `Term ${index + 1}` : `Month ${index + 1}`,
            amount: inst.amount,
            due_date: inst.dueDate
          }))
        });

        if (!tuitionInstallmentPlanResponse.success || !tuitionInstallmentPlanResponse.data) {
          throw new Error('Failed to create tuition installment plan');
        }
        
        console.log('Tuition installment plan created successfully:', tuitionInstallmentPlanResponse.data);
      }

      // Always create one-time plan for tuition
      const tuitionOneTimeAmount = wizardData.selectedCategories
        .filter(cat => cat.categoryType === 'tuition')
        .reduce((sum, cat) => sum + cat.amount, 0);
      
      if (tuitionOneTimeAmount > 0) {
        console.log('Creating tuition one-time plan for amount:', tuitionOneTimeAmount);
        
        tuitionOneTimePlanResponse = await feesAPI.paymentPlans.create({
          structure_id: structureId,
          name: "One-Time Payment Plan",
          type: 'upfront',
          discount_percentage: 0,
          currency: 'USD',
          installments: [{
            label: "Full Payment",
            amount: tuitionOneTimeAmount,
            due_date: wizardData.academicYear.startDate
          }]
        });

        if (!tuitionOneTimePlanResponse.success || !tuitionOneTimePlanResponse.data) {
          throw new Error('Failed to create tuition one-time plan');
        }
        
        console.log('Tuition one-time plan created successfully:', tuitionOneTimePlanResponse.data);
      }

      // Step 5: Create Additional Fees Payment Plan (if applicable)
      let additionalPaymentPlanResponse = null;
      if (wizardData.additionalPaymentSchedule && wizardData.additionalPaymentSchedule.installments.length > 0) {
        console.log('Creating additional fees payment plan with installments:', wizardData.additionalPaymentSchedule.installments);
        
        additionalPaymentPlanResponse = await feesAPI.paymentPlans.create({
          structure_id: structureId,
          name: "Additional Fees Payment Plan",
          type: wizardData.additionalPaymentSchedule.scheduleType as 'monthly' | 'per-term' | 'upfront',
          discount_percentage: wizardData.additionalPaymentSchedule.discountPercentage || 0,
          currency: 'USD',
          installments: wizardData.additionalPaymentSchedule.installments.map((inst, index) => ({
            label: wizardData.additionalPaymentSchedule!.scheduleType === 'per-term' ? `Term ${index + 1}` : `Month ${index + 1}`,
            amount: inst.amount,
            due_date: inst.dueDate
          }))
        });

        if (!additionalPaymentPlanResponse.success || !additionalPaymentPlanResponse.data) {
          throw new Error('Failed to create additional fees payment plan');
        }
        
        console.log('Additional fees payment plan created successfully:', additionalPaymentPlanResponse.data);
      } else {
        console.log('No additional fees installments to create payment plan for');
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
            <p className="text-sm text-gray-600 mt-1">Configure your school&apos;s fee structure step by step</p>
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
              data={{...wizardData.gradeProgram, appliesTo: wizardData.appliesTo}}
              onChange={(data) => setWizardData(prev => ({ 
                ...prev, 
                gradeProgram: { gradeLevel: data.gradeLevel, programType: data.programType },
                appliesTo: data.appliesTo
              }))}
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
              academicYear={wizardData.academicYear}
              paymentSchedule={wizardData.paymentSchedule}
              onChange={(categories) => setWizardData(prev => ({ ...prev, selectedCategories: categories }))}
            />
          )}
          
          {wizardStep === 5 && (
            <PaymentSchedulesStep 
              paymentSchedule={wizardData.paymentSchedule}
              additionalPaymentSchedule={wizardData.additionalPaymentSchedule}
              academicYear={wizardData.academicYear}
              selectedCategories={wizardData.selectedCategories}
              onChange={(tuitionSchedule, additionalSchedule) => setWizardData(prev => ({ 
                ...prev, 
                paymentSchedule: tuitionSchedule,
                additionalPaymentSchedule: additionalSchedule || prev.additionalPaymentSchedule
              }))}
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
          {t('Back to Management')}
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
              {t('Previous')}
            </button>
          )}
          {wizardStep < 6 ? (
            <button
              onClick={nextWizardStep}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
            >
              {t('Next')}: {wizardSteps[wizardStep]?.title}
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
              {t('Publish Schedule')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
