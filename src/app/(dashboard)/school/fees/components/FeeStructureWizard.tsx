// src/app/(dashboard)/school/fees/components/FeeStructureWizard.tsx
"use client";

import React, { useState, useEffect, memo } from 'react';
import dynamic from 'next/dynamic';
import {
  CalendarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CheckCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { WizardData, WizardStep } from '../types/feeTypes';
import { useFeesAPI } from '@/hooks/useFeesAPI';
import { useTranslation } from '@/hooks/useTranslation';

// Lazy load wizard steps - they're conditionally rendered based on wizardStep
const SelectAcademicContextStep = dynamic(() => import('./wizard-steps/SelectAcademicContextStep').then(mod => ({ default: mod.SelectAcademicContextStep })), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

const FeeItemsStep = dynamic(() => import('./wizard-steps/FeeItemsStep').then(mod => ({ default: mod.FeeItemsStep })), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

const DefinePaymentPlansStep = dynamic(() => import('./wizard-steps/DefinePaymentPlansStep').then(mod => ({ default: mod.DefinePaymentPlansStep })), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

const PublishStep = dynamic(() => import('./wizard-steps/PublishStep').then(mod => ({ default: mod.PublishStep })), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

interface FeeStructureWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const FeeStructureWizardComponent = ({ onComplete, onCancel }: FeeStructureWizardProps) => {
  const { t } = useTranslation();
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const feesAPI = useFeesAPI();
  
  const [schoolGradeLevels, setSchoolGradeLevels] = useState<string[]>([]);
  const [wizardData, setWizardData] = useState<WizardData>({
    academicContext: {
      academicYear: '',
      gradeLevel: '',
      structureName: '',
      appliesTo: 'school',
      currency: 'USD'
    },
    feeItems: []
  });

  // Fetch school data (currency and grade levels) on mount
  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        const res = await fetch('/api/schools/settings');
        const data = await res.json();

        if (data.school) {
          // Set currency
          if (data.school.currency) {
            setWizardData(prev => ({
              ...prev,
              academicContext: {
                ...prev.academicContext,
                currency: data.school.currency
              }
            }));
          }
          // Set grade levels
          if (data.school.grade_levels && Array.isArray(data.school.grade_levels)) {
            setSchoolGradeLevels(data.school.grade_levels);
          }
        }
      } catch (error) {
        console.error('Error loading school data:', error);
        // Default to USD if fetch fails
      }
    };
    loadSchoolData();
  }, []);

  const wizardSteps = [
    {
      id: 1,
      title: t('Academic Context'),
      description: t('Year, grade & scope'),
      icon: CalendarIcon,
      completed: wizardData.academicContext.academicYear !== '' && wizardData.academicContext.structureName !== ''
    },
    {
      id: 2,
      title: t('Fee Items'),
      description: t('Categories & amounts'),
      icon: DocumentTextIcon,
      completed: wizardData.feeItems.length > 0
    },
    {
      id: 3,
      title: t('Payment Plans'),
      description: t('Define installments'),
      icon: CreditCardIcon,
      completed: wizardData.feeItems.some(item => item.paymentPlans && item.paymentPlans.length > 0)
    },
    {
      id: 4,
      title: t('Review & Save'),
      description: t('Confirm & finalize'),
      icon: EyeIcon,
      completed: false
    }
  ];

  const goToWizardStep = (step: number) => {
    setWizardStep(step as WizardStep);
  };

  const nextWizardStep = () => {
    // Validate current step before proceeding
    if (wizardStep === 1) {
      if (!wizardData.academicContext.academicYear || !wizardData.academicContext.structureName) {
        alert(t('Please fill in all required fields in the Academic Context step'));
        return;
      }
      if (wizardData.academicContext.appliesTo === 'grade' && 
          (!wizardData.academicContext.gradeLevel || 
           (Array.isArray(wizardData.academicContext.gradeLevel) && wizardData.academicContext.gradeLevel.length === 0))) {
        alert(t('Please select at least one grade when choosing "Specific Grades"'));
        return;
      }
    }
    
    if (wizardStep === 2) {
      if (wizardData.feeItems.length === 0) {
        alert(t('Please add at least one fee item'));
        return;
      }
      const itemsWithoutAmounts = wizardData.feeItems.filter(item => !item.amount || item.amount <= 0);
      if (itemsWithoutAmounts.length > 0) {
        alert(t('Please set amounts for all fee items'));
        return;
      }
    }
    
    if (wizardStep === 3) {
      // Check if at least one fee item has payment plans
      const hasPaymentPlans = wizardData.feeItems.some(item => item.paymentPlans && item.paymentPlans.length > 0);
      if (!hasPaymentPlans) {
        alert(t('Please create at least one payment plan for one of the fee items'));
        return;
      }
    }
    
    if (wizardStep < 4) {
      setWizardStep((wizardStep + 1) as WizardStep);
    }
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) {
      setWizardStep((wizardStep - 1) as WizardStep);
    }
  };

  const calculateStartDate = (academicYear: string) => {
    const year = academicYear.split('-')[0];
    return `${year}-09-01`;
  };

  const calculateEndDate = (academicYear: string) => {
    const year = academicYear.split('-')[1];
    return `${year}-06-30`;
  };

  const handleSaveFeeStructure = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Step 1: Create Academic Year
      // Since we use hardcoded academic years, we'll always create them with our predefined structure
      const academicYearData = {
        name: wizardData.academicContext.academicYear,
        start_date: calculateStartDate(wizardData.academicContext.academicYear),
        end_date: calculateEndDate(wizardData.academicContext.academicYear),
        term_structure: '3 Trimesters', // Default for Congo
        is_active: false
      };

      const academicYearResponse = await feesAPI.academicYears.create(academicYearData);

      if (!academicYearResponse.success || !academicYearResponse.data) {
        console.error('Academic year creation failed:', academicYearResponse.error);
        
        // Check if it's a permission error
        if (academicYearResponse.error?.includes('Only school admins can create academic years')) {
          throw new Error('You need school admin permissions to create academic years. Please contact your administrator to create the academic year first.');
        }
        
        throw new Error(academicYearResponse.error || 'Failed to create academic year');
      }

      const academicYearId = academicYearResponse.data.academicYear.id;

      // Step 2: Create Fee Categories (if they don't exist)
      // OPTIMIZATION: Fetch all existing categories once before processing
      const existingCategoriesResponse = await feesAPI.feeCategories.getAll();
      const existingCategoriesMap = new Map(
        existingCategoriesResponse.success && existingCategoriesResponse.data?.feeCategories
          ? existingCategoriesResponse.data.feeCategories.map(cat => [cat.name, cat.id])
          : []
      );

      const categoryPromises = wizardData.feeItems.map(async (item) => {
        // Check if category already exists (using the pre-fetched map)
        const existingCategoryId = existingCategoriesMap.get(item.categoryName);

        if (existingCategoryId) {
          return existingCategoryId;
        }

        // Create new category
        const categoryData = {
          name: item.categoryName,
          description: `${item.categoryName} fees`,
          is_mandatory: item.isMandatory,
          is_recurring: !item.paymentModes.includes('one_time'),
          category_type: item.categoryName.toLowerCase().includes('tuition') ? 'tuition' : 'additional'
        };

        const categoryResponse = await feesAPI.feeCategories.create(categoryData);

        if (!categoryResponse.success || !categoryResponse.data) {
          console.error(`Failed to create category: ${item.categoryName}`, categoryResponse.error);

          // Check if it's a duplicate name error (category was created by another request)
          if (categoryResponse.error?.includes('already exists')) {
            // Use the existing category ID if we somehow have it now
            const retryId = existingCategoriesMap.get(item.categoryName);
            if (retryId) {
              return retryId;
            }
          }

          if (categoryResponse.error?.includes('Only school admins can create fee categories')) {
            throw new Error('You need school admin permissions to create fee categories. Please contact your administrator to create the required categories first.');
          }

          throw new Error(`Failed to create category: ${item.categoryName} - ${categoryResponse.error}`);
        }

        return categoryResponse.data.feeCategory.id;
      });

      const categoryIds = await Promise.all(categoryPromises);
      
      // Validate that all categories were created successfully
      if (categoryIds.some(id => !id)) {
        throw new Error('Some fee categories failed to create. Please try again.');
      }

      // Step 3: Create Fee Structure
      const totalAmount = wizardData.feeItems.reduce((sum, item) => sum + item.amount, 0);
      
      const gradeLevelString = Array.isArray(wizardData.academicContext.gradeLevel) 
        ? wizardData.academicContext.gradeLevel.join(',')
        : wizardData.academicContext.gradeLevel;
      
      const feeStructureData = {
        name: wizardData.academicContext.structureName,
        academic_year_id: academicYearId,
        grade_level: gradeLevelString,
        applies_to: wizardData.academicContext.appliesTo,
        total_amount: totalAmount,
        is_active: false, 
        items: wizardData.feeItems.map((item, index) => ({
          category_id: categoryIds[index],
          amount: item.amount,
          is_mandatory: item.isMandatory,
          is_recurring: !item.paymentModes.includes('one_time'), // Auto-determine from payment modes
          payment_modes: item.paymentModes
        }))
      };

      const feeStructureResponse = await feesAPI.feeStructures.create(feeStructureData);

      if (!feeStructureResponse.success || !feeStructureResponse.data) {
        console.error('Fee structure creation failed:', feeStructureResponse.error);
        throw new Error(feeStructureResponse.error || 'Failed to create fee structure');
      }

      const structureId = feeStructureResponse.data.feeStructure.id;

      // Step 4: Create Payment Plans (from each fee item)
      // OPTIMIZATION: Batch all payment plan creation calls in parallel
      const paymentPlanPromises: Promise<unknown>[] = [];

      for (let i = 0; i < wizardData.feeItems.length; i++) {
        const feeItem = wizardData.feeItems[i];
        const categoryId = categoryIds[i]; // Get corresponding category ID

        if (!feeItem.paymentPlans || feeItem.paymentPlans.length === 0) {
          continue;
        }

        for (const plan of feeItem.paymentPlans) {

          // Map our internal types to API types
          const apiType: 'monthly' | 'per-term' | 'upfront' | 'custom' =
            plan.type === 'installment' ? 'custom' :
            plan.type === 'one_time' ? 'upfront' :
            plan.type === 'termly' ? 'per-term' :
            'monthly';

          const paymentPlanData = {
            structure_id: structureId,
            type: apiType,
            discount_percentage: plan.discountPercentage,
            currency: wizardData.academicContext.currency,
            fee_category_id: categoryId,
            installments: plan.installments.map((inst, index) => ({
              installment_number: index + 1,
              label: inst.label,
              amount: inst.amount,
              due_date: inst.dueDate
            }))
          };

          // Add to batch
          const promise = feesAPI.paymentPlans.create(paymentPlanData).then(response => {
            if (!response.success || !response.data) {
              console.error('Payment plan creation failed:', response.error);
              throw new Error(`Failed to create payment plan for ${feeItem.categoryName}: ${plan.type} - ${response.error}`);
            }

            return response.data;
          });

          paymentPlanPromises.push(promise);
        }
      }

      // Execute all payment plan creation calls in parallel
      await Promise.all(paymentPlanPromises);

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
              <h3 className="text-sm font-medium text-red-800">{t('Error saving fee structure')}</h3>
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
              <h3 className="text-sm font-medium text-green-800">{t('Fee structure saved successfully!')}</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{t('Your fee structure has been created and is ready for student assignments. Redirecting to management view...')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSaving && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">{t('Saving fee structure...')}</p>
        </div>
      )}

      {/* Wizard Progress */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('Fee Structure Setup')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('Configure your school\'s fee structure step by step')}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{wizardStep}</div>
            <div className="text-sm text-gray-500">{t('of')} {wizardSteps.length}</div>
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
    
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {wizardSteps[wizardStep - 1].title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {wizardStep === 1 && t('Set up your academic context and structure details')}
                {wizardStep === 2 && t('Add and configure fee items for this structure')}
                {wizardStep === 3 && t('Define payment plans and installment schedules')}
                {wizardStep === 4 && t('Review and finalize your fee structure')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* Step Content */}
          {wizardStep === 1 && (
            <SelectAcademicContextStep
              data={wizardData.academicContext}
              onChange={(data) => setWizardData(prev => ({ ...prev, academicContext: data }))}
              schoolGradeLevels={schoolGradeLevels}
            />
          )}
          
          {wizardStep === 2 && (
            <FeeItemsStep 
              feeItems={wizardData.feeItems}
              onChange={(feeItems) => setWizardData(prev => ({ ...prev, feeItems }))}
            />
          )}
          
          {wizardStep === 3 && (
            <DefinePaymentPlansStep
              paymentPlans={[]} // Deprecated prop
              feeItems={wizardData.feeItems}
              academicYear={wizardData.academicContext.academicYear}
              onChange={() => {}} // Deprecated prop
              onFeeItemsChange={(feeItems) => setWizardData(prev => ({ ...prev, feeItems }))}
            />
          )}
          
          {wizardStep === 4 && (
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
          {wizardStep > 1 && wizardStep < 4 && (
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
          {wizardStep < 4 && (
            <button
              onClick={nextWizardStep}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
            >
              {t('Next')}: {wizardSteps[wizardStep]?.title}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export const FeeStructureWizard = memo(FeeStructureWizardComponent);
FeeStructureWizard.displayName = 'FeeStructureWizard';
