// src/app/(dashboard)/school/fees/components/wizard-steps/PaymentSchedulesStep.tsx
"use client";

import React, { useState } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { TabNavigation } from './components/TabNavigation';
import { FeeSummary } from './components/FeeSummary';
import { InstallmentManager } from './components/InstallmentManager';
import { DiscountInput } from './components/DiscountInput';
import { PaymentScheduleSummary } from './components/PaymentScheduleSummary';

interface PaymentSchedulesStepProps {
  paymentSchedule: {
    scheduleType: 'upfront' | 'per-term' | 'monthly' | 'custom';
    installments: {
      installmentNumber: number;
      amount: number;
      dueDate: string;
      percentage: number;
      termId?: string;
    }[];
    discountPercentage?: number;
  };
  additionalPaymentSchedule?: {
    scheduleType: 'upfront' | 'per-term' | 'monthly' | 'custom';
    installments: {
      installmentNumber: number;
      amount: number;
      dueDate: string;
      percentage: number;
      termId?: string;
    }[];
    discountPercentage?: number;
  };
  academicYear: {
    name: string;
    startDate: string;
    endDate: string;
    termStructure: string;
  };
  selectedCategories: {
    categoryId: string;
    categoryName: string;
    amount: number;
    isMandatory: boolean;
    supportsRecurring: boolean;
    supportsOneTime: boolean;
    categoryType: 'tuition' | 'additional';
  }[];
  onChange: (tuitionSchedule: {
    scheduleType: 'upfront' | 'per-term' | 'monthly' | 'custom';
    installments: {
      installmentNumber: number;
      amount: number;
      dueDate: string;
      percentage: number;
      termId?: string;
    }[];
    discountPercentage?: number;
  }, additionalSchedule?: {
    scheduleType: 'upfront' | 'per-term' | 'monthly' | 'custom';
    installments: {
      installmentNumber: number;
      amount: number;
      dueDate: string;
      percentage: number;
      termId?: string;
    }[];
    discountPercentage?: number;
  }) => void;
}

// Dynamic schedule types based on term structure
const getScheduleTypes = (termStructure: string) => {
  const baseTypes = [
    { 
      value: 'monthly', 
      label: 'Monthly Installments', 
      description: 'Equal monthly payments throughout the year',
      icon: '📅'
    },
    { 
      value: 'custom', 
      label: 'Custom Schedule', 
      description: 'Define your own payment schedule',
      icon: '⚙️'
    }
  ];

  // Add term-based option based on DRC structure
  if (termStructure.includes('Kindergarten') || termStructure.includes('Primary')) {
    baseTypes.splice(1, 0, {
      value: 'per-term',
      label: 'Per Trimester (3 Trimesters)',
      description: 'Payments due at the start of each trimester (Oct, Feb, May)',
      icon: '📚'
    });
  } else if (termStructure.includes('Secondary')) {
    baseTypes.splice(1, 0, {
      value: 'per-term',
      label: 'Per Semester (2 Semesters)',
      description: 'Payments due at the start of each semester (Oct, Mar)',
      icon: '📚'
    });
  } else if (termStructure.toLowerCase().includes('term')) {
    const termCount = termStructure.match(/\d+/)?.[0] || '3';
    baseTypes.splice(1, 0, {
      value: 'per-term',
      label: `Per Term (${termCount} Terms)`,
      description: `Payments due at the start of each term`,
      icon: '📚'
    });
  } else if (termStructure.toLowerCase().includes('semester')) {
    const semesterCount = termStructure.match(/\d+/)?.[0] || '2';
    baseTypes.splice(1, 0, {
      value: 'per-term', // Use per-term for semesters too
      label: `Per Semester (${semesterCount} Semesters)`,
      description: `Payments due at the start of each semester`,
      icon: '📚'
    });
  }

  return baseTypes;
};

export function PaymentSchedulesStep({ paymentSchedule, additionalPaymentSchedule: initialAdditionalSchedule, academicYear, selectedCategories, onChange }: PaymentSchedulesStepProps) {
  // Separate categories by type and frequency
  const tuitionCategories = selectedCategories.filter(cat => cat.categoryType === 'tuition');
  const additionalCategories = selectedCategories.filter(cat => cat.categoryType === 'additional');
  
  // State declarations
  const [activeTab, setActiveTab] = useState<'tuition' | 'additional'>('tuition');
  const [isScheduleDropdownOpen, setIsScheduleDropdownOpen] = useState(false);
  const [isAdditionalScheduleDropdownOpen, setIsAdditionalScheduleDropdownOpen] = useState(false);
  const [additionalPaymentSchedule, setAdditionalPaymentSchedule] = useState(initialAdditionalSchedule || {
    scheduleType: 'upfront' as 'upfront' | 'per-term' | 'monthly' | 'custom',
    installments: [] as {
      installmentNumber: number;
      amount: number;
      dueDate: string;
      percentage: number;
      termId?: string;
    }[],
    discountPercentage: 0
  });

  // Calculate base totals for each category type (regardless of payment frequency support)
  const tuitionBaseTotal = tuitionCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const additionalBaseTotal = additionalCategories.reduce((sum, cat) => sum + cat.amount, 0);
  
  // Calculate totals including interest rates
  const calculateTotalWithInterest = (baseAmount: number, installments: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    percentage: number;
    termId?: string;
  }[]) => {
    if (installments.length === 0) return baseAmount;
    
    const totalWithInterest = installments.reduce((sum, installment) => {
      return sum + installment.amount;
    }, 0);
    
    return totalWithInterest;
  };
  
  const tuitionTotal = calculateTotalWithInterest(tuitionBaseTotal, paymentSchedule.installments);
  const additionalTotal = calculateTotalWithInterest(additionalBaseTotal, additionalPaymentSchedule.installments);
  
  // Separate by frequency for display purposes only
  const tuitionRecurring = tuitionCategories.filter(cat => cat.supportsRecurring);
  const tuitionOneTime = tuitionCategories.filter(cat => cat.supportsOneTime);
  const additionalRecurring = additionalCategories.filter(cat => cat.supportsRecurring);
  const additionalOneTime = additionalCategories.filter(cat => cat.supportsOneTime);

  const scheduleTypes = getScheduleTypes(academicYear.termStructure);
  const selectedSchedule = scheduleTypes.find(s => s.value === paymentSchedule.scheduleType);

  const generateInstallments = (scheduleType: string, baseAmount: number) => {
    let installments: {
      installmentNumber: number;
      amount: number;
      dueDate: string;
      percentage: number;
      termId?: string;
    }[] = [];
    
    switch (scheduleType) {
      case 'upfront':
        installments = [{
          installmentNumber: 1,
          amount: baseAmount,
          percentage: 0, // Interest rate starts at 0
          dueDate: academicYear.startDate || '',
          termId: ''
        }];
        break;
      case 'per-term':
        // Extract term count based on DRC structure
        let termCount = 3; // Default to 3 trimesters
        if (academicYear.termStructure.includes('Kindergarten') || academicYear.termStructure.includes('Primary')) {
          termCount = 3; // 3 trimesters
        } else if (academicYear.termStructure.includes('Secondary')) {
          termCount = 2; // 2 semesters
        } else {
          // Fallback: try to extract number from structure
          const match = academicYear.termStructure.match(/\d+/);
          termCount = match ? parseInt(match[0]) : 3;
        }
        
        const termAmount = baseAmount / termCount;
        
        for (let i = 1; i <= termCount; i++) {
          installments.push({
            installmentNumber: i,
            amount: Math.round(termAmount * 100) / 100, // Round to 2 decimal places
            percentage: 0, // Interest rate starts at 0
            dueDate: '',
            termId: ''
          });
        }
        break;
      case 'monthly':
        const monthlyAmount = baseAmount / 12;
        
        installments = Array.from({ length: 12 }, (_, i) => ({
          installmentNumber: i + 1,
          amount: Math.round(monthlyAmount * 100) / 100,
          percentage: 0, // Interest rate starts at 0
          dueDate: '',
          termId: ''
        }));
        break;
      case 'custom':
        installments = [];
        break;
    }
    
    return installments;
  };


  const handleTuitionScheduleChange = (scheduleType: string) => {
    const installments = generateInstallments(scheduleType, tuitionBaseTotal);
    const updatedTuitionSchedule = {
      ...paymentSchedule,
      scheduleType: scheduleType as 'upfront' | 'per-term' | 'monthly' | 'custom',
      installments
    };
    onChange(updatedTuitionSchedule, additionalPaymentSchedule);
  };

  const handleAdditionalScheduleChange = (scheduleType: string) => {
    const installments = generateInstallments(scheduleType, additionalBaseTotal);
    const updatedAdditionalSchedule = {
      ...additionalPaymentSchedule,
      scheduleType: scheduleType as 'upfront' | 'per-term' | 'monthly' | 'custom',
      installments
    };
    setAdditionalPaymentSchedule(updatedAdditionalSchedule);
    onChange(paymentSchedule, updatedAdditionalSchedule);
  };

  const handleTuitionInstallmentsChange = (installments: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    percentage: number;
    termId?: string;
  }[]) => {
    const updatedTuitionSchedule = {
      ...paymentSchedule,
      installments
    };
    onChange(updatedTuitionSchedule, additionalPaymentSchedule);
  };

  const handleAdditionalInstallmentsChange = (installments: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    percentage: number;
    termId?: string;
  }[]) => {
    const updatedAdditionalSchedule = {
      ...additionalPaymentSchedule,
      installments
    };
    setAdditionalPaymentSchedule(updatedAdditionalSchedule);
    onChange(paymentSchedule, updatedAdditionalSchedule);
  };

  const handleTuitionDiscountChange = (discountPercentage: number) => {
    const updatedTuitionSchedule = { ...paymentSchedule, discountPercentage };
    onChange(updatedTuitionSchedule, additionalPaymentSchedule);
  };

  const handleAdditionalDiscountChange = (discountPercentage: number) => {
    const updatedAdditionalSchedule = { ...additionalPaymentSchedule, discountPercentage };
    setAdditionalPaymentSchedule(updatedAdditionalSchedule);
    onChange(paymentSchedule, updatedAdditionalSchedule);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Schedule Setup</h3>
          <p className="text-gray-600">Define when and how payments are due</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              Choose a payment schedule that works for your school and parents. You can always modify installments after selection.
            </p>
          </div>
        </div>

        {/* Total Amounts Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Total Payment Amounts (Including Interest)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">${tuitionTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Tuition Fees</div>
              {tuitionTotal !== tuitionBaseTotal && (
                <div className="text-xs text-green-600">
                  Base: ${tuitionBaseTotal.toLocaleString()} + Interest: ${(tuitionTotal - tuitionBaseTotal).toLocaleString()}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">${additionalTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Additional Fees</div>
              {additionalTotal !== additionalBaseTotal && (
                <div className="text-xs text-purple-600">
                  Base: ${additionalBaseTotal.toLocaleString()} + Interest: ${(additionalTotal - additionalBaseTotal).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-3 pt-3 border-t border-gray-200">
            <div className="text-xl font-bold text-gray-900">${(tuitionTotal + additionalTotal).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Grand Total</div>
          </div>
        </div>


        {/* Payment Schedule Tabs */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tuitionTotal={tuitionTotal}
            additionalTotal={additionalTotal}
          />

          {/* Tab Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {activeTab === 'tuition' && (tuitionRecurring.length > 0 || tuitionOneTime.length > 0) && (
              <FeeSummary
                categories={tuitionCategories}
                total={tuitionTotal}
                type="tuition"
                scheduleType={paymentSchedule.scheduleType}
                installments={paymentSchedule.installments}
                scheduleTypes={scheduleTypes}
                isDropdownOpen={isScheduleDropdownOpen}
                onDropdownOpenChange={setIsScheduleDropdownOpen}
                onScheduleChange={handleTuitionScheduleChange}
              />
            )}

            {activeTab === 'additional' && (additionalRecurring.length > 0 || additionalOneTime.length > 0) && (
              <FeeSummary
                categories={additionalCategories}
                total={additionalTotal}
                type="additional"
                scheduleType={additionalPaymentSchedule.scheduleType}
                installments={additionalPaymentSchedule.installments}
                scheduleTypes={scheduleTypes}
                isDropdownOpen={isAdditionalScheduleDropdownOpen}
                onDropdownOpenChange={setIsAdditionalScheduleDropdownOpen}
                onScheduleChange={handleAdditionalScheduleChange}
              />
            )}
          </div>
        </div>

        {/* Additional Fees Discount for Upfront */}
        {activeTab === 'additional' && additionalPaymentSchedule.scheduleType === 'upfront' && additionalRecurring.length > 0 && (
          <DiscountInput
            value={additionalPaymentSchedule.discountPercentage || 0}
            onChange={handleAdditionalDiscountChange}
            type="additional"
          />
        )}

        {/* Additional Fees Installments */}
        {activeTab === 'additional' && additionalPaymentSchedule.scheduleType && additionalRecurring.length > 0 && (
          <InstallmentManager
            installments={additionalPaymentSchedule.installments}
            scheduleType={additionalPaymentSchedule.scheduleType}
            totalAmount={additionalBaseTotal}
            type="additional"
            onInstallmentsChange={handleAdditionalInstallmentsChange}
            onAddInstallment={() => {
              const newInstallmentNumber = additionalPaymentSchedule.installments.length + 1;
              const newInstallment = {
                installmentNumber: newInstallmentNumber,
                amount: 0,
                percentage: 0,
                dueDate: '',
                termId: ''
              };
              setAdditionalPaymentSchedule({
                ...additionalPaymentSchedule,
                installments: [...additionalPaymentSchedule.installments, newInstallment]
              });
            }}
            onRemoveInstallment={(index) => {
              const updatedInstallments = additionalPaymentSchedule.installments.filter((_, i) => i !== index);
              setAdditionalPaymentSchedule({ ...additionalPaymentSchedule, installments: updatedInstallments });
            }}
            onUpdateInstallment={(index, field, value) => {
              const updatedInstallments = additionalPaymentSchedule.installments.map((inst, i) => 
                i === index ? { ...inst, [field]: value } : inst
              );
              setAdditionalPaymentSchedule({ ...additionalPaymentSchedule, installments: updatedInstallments });
            }}
          />
        )}

        {/* Discount for Upfront */}
        {activeTab === 'tuition' && paymentSchedule.scheduleType === 'upfront' && (
          <DiscountInput
            value={paymentSchedule.discountPercentage || 0}
            onChange={handleTuitionDiscountChange}
            type="tuition"
          />
        )}

        {/* Tuition Fees Installments */}
        {activeTab === 'tuition' && paymentSchedule.scheduleType && (
          <InstallmentManager
            installments={paymentSchedule.installments}
            scheduleType={paymentSchedule.scheduleType}
            totalAmount={tuitionBaseTotal}
            type="tuition"
            onInstallmentsChange={handleTuitionInstallmentsChange}
            onAddInstallment={() => {
              const newInstallmentNumber = paymentSchedule.installments.length + 1;
              const newInstallment = {
                installmentNumber: newInstallmentNumber,
                amount: 0,
                percentage: 0,
                dueDate: '',
                termId: ''
              };
              onChange({
                ...paymentSchedule,
                installments: [...paymentSchedule.installments, newInstallment]
              });
            }}
            onRemoveInstallment={(index) => {
              const updatedInstallments = paymentSchedule.installments.filter((_, i) => i !== index);
              onChange({
                ...paymentSchedule,
                installments: updatedInstallments
              });
            }}
            onUpdateInstallment={(index, field, value) => {
              let processedValue = value;
              
              // Handle numeric fields to remove leading zeros
              if ((field === 'amount' || field === 'percentage') && typeof value === 'string') {
                const cleanValue = value.replace(/^0+/, '') || '0';
                processedValue = parseFloat(cleanValue) || 0;
              }
              
              const updatedInstallments = paymentSchedule.installments.map((inst, i) => 
                i === index ? { ...inst, [field]: processedValue } : inst
              );
              onChange({
                ...paymentSchedule,
                installments: updatedInstallments
              });
            }}
          />
        )}

        {/* Summary */}
        {activeTab === 'tuition' && (
          <PaymentScheduleSummary
            scheduleType={paymentSchedule.scheduleType}
            installments={paymentSchedule.installments}
            discountPercentage={paymentSchedule.discountPercentage}
            type="tuition"
            selectedSchedule={selectedSchedule}
          />
        )}

        {activeTab === 'additional' && (
          <PaymentScheduleSummary
            scheduleType={additionalPaymentSchedule.scheduleType}
            installments={additionalPaymentSchedule.installments}
            discountPercentage={additionalPaymentSchedule.discountPercentage}
            type="additional"
            selectedSchedule={scheduleTypes.find(s => s.value === additionalPaymentSchedule.scheduleType)}
          />
        )}
      </div>
    </div>
  );
}
