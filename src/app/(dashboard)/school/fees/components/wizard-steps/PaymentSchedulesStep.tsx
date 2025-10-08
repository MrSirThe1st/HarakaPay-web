// src/app/(dashboard)/school/fees/components/wizard-steps/PaymentSchedulesStep.tsx
"use client";

import React, { useState } from 'react';
import { CreditCardIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { TabNavigation } from './components/TabNavigation';
import { FeeSummary } from './components/FeeSummary';
import { InstallmentManager } from './components/InstallmentManager';
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
  const [tuitionOneTimeEnabled, setTuitionOneTimeEnabled] = useState(false);
  const [tuitionOneTimeDiscount, setTuitionOneTimeDiscount] = useState(0);
  const [tuitionOneTimeDueDate, setTuitionOneTimeDueDate] = useState('');
  
  // Individual additional fee schedules - one per category
  const [additionalFeeSchedules, setAdditionalFeeSchedules] = useState<Record<string, {
    scheduleType: 'upfront' | 'per-term' | 'monthly' | 'custom';
    installments: {
      installmentNumber: number;
      amount: number;
      dueDate: string;
      percentage: number;
      termId?: string;
    }[];
    discountPercentage: number;
    oneTimeEnabled: boolean;
    oneTimeDiscount: number;
    oneTimeDueDate: string;
  }>>({});
  
  // Individual dropdown states for each additional fee category
  const [additionalDropdownStates, setAdditionalDropdownStates] = useState<Record<string, boolean>>({});

  // Calculate base totals for each category type (regardless of payment frequency support)
  const tuitionBaseTotal = tuitionCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const additionalBaseTotal = additionalCategories.reduce((sum, cat) => sum + cat.amount, 0);
  
  // Initialize individual additional fee schedules
  React.useEffect(() => {
    const newSchedules: Record<string, {
      scheduleType: 'upfront' | 'per-term' | 'monthly' | 'custom';
      installments: {
        installmentNumber: number;
        amount: number;
        dueDate: string;
        percentage: number;
        termId?: string;
      }[];
      discountPercentage: number;
      oneTimeEnabled: boolean;
      oneTimeDiscount: number;
      oneTimeDueDate: string;
    }> = {};
    additionalCategories.forEach(category => {
      if (!additionalFeeSchedules[category.categoryId]) {
        newSchedules[category.categoryId] = {
          scheduleType: 'upfront' as 'upfront' | 'per-term' | 'monthly' | 'custom',
          installments: [],
          discountPercentage: 0,
          oneTimeEnabled: false,
          oneTimeDiscount: 0,
          oneTimeDueDate: ''
        };
      }
    });
    if (Object.keys(newSchedules).length > 0) {
      setAdditionalFeeSchedules(prev => ({ ...prev, ...newSchedules }));
    }
  }, [additionalCategories, additionalFeeSchedules]);
  
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
  
  // Calculate individual additional fee totals
  const additionalFeeTotals = additionalCategories.reduce((totals, category) => {
    const schedule = additionalFeeSchedules[category.categoryId];
    if (schedule) {
      totals[category.categoryId] = calculateTotalWithInterest(category.amount, schedule.installments);
    } else {
      totals[category.categoryId] = category.amount;
    }
    return totals;
  }, {} as Record<string, number>);
  
  const additionalTotal = Object.values(additionalFeeTotals).reduce((sum, total) => sum + total, 0);
  
  // Separate by frequency for display purposes only
  const tuitionRecurring = tuitionCategories.filter(cat => cat.supportsRecurring);
  const tuitionOneTime = tuitionCategories.filter(cat => cat.supportsOneTime);

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
        // Use the end date of the academic year for upfront payments
        const upfrontDueDate = academicYear.endDate || new Date().toISOString().split('T')[0];
        installments = [{
          installmentNumber: 1,
          amount: baseAmount,
          percentage: 0, // Interest rate starts at 0
          dueDate: upfrontDueDate,
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
          // Calculate due date based on academic year period
          const startDate = new Date(academicYear.startDate || new Date());
          const endDate = new Date(academicYear.endDate || new Date());
          
          // Calculate the duration and divide by term count
          const totalDuration = endDate.getTime() - startDate.getTime();
          const termDuration = totalDuration / termCount;
          
          // Set due date to the end of each term period
          const dueDate = new Date(startDate.getTime() + (termDuration * i));
          
          installments.push({
            installmentNumber: i,
            amount: Math.round(termAmount * 100) / 100, // Round to 2 decimal places
            percentage: 0, // Interest rate starts at 0
            dueDate: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            termId: ''
          });
        }
        break;
      case 'monthly':
        const monthlyAmount = baseAmount / 12;
        
        installments = Array.from({ length: 12 }, (_, i) => {
          // Calculate due date based on academic year period
          const startDate = new Date(academicYear.startDate || new Date());
          const endDate = new Date(academicYear.endDate || new Date());
          
          // Calculate the duration and divide by 12 months
          const totalDuration = endDate.getTime() - startDate.getTime();
          const monthDuration = totalDuration / 12;
          
          // Set due date to the end of each month period
          const dueDate = new Date(startDate.getTime() + (monthDuration * (i + 1)));
          
          return {
            installmentNumber: i + 1,
            amount: Math.round(monthlyAmount * 100) / 100,
            percentage: 0, // Interest rate starts at 0
            dueDate: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            termId: ''
          };
        });
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
    onChange(updatedTuitionSchedule, initialAdditionalSchedule);
  };

  // Individual additional fee schedule handlers
  const handleAdditionalFeeScheduleChange = (categoryId: string, scheduleType: string) => {
    const category = additionalCategories.find(cat => cat.categoryId === categoryId);
    if (!category) return;
    
    const installments = generateInstallments(scheduleType, category.amount);
    const updatedSchedule = {
      ...additionalFeeSchedules[categoryId],
      scheduleType: scheduleType as 'upfront' | 'per-term' | 'monthly' | 'custom',
      installments
    };
    
    setAdditionalFeeSchedules(prev => ({
      ...prev,
      [categoryId]: updatedSchedule
    }));
    
    // Update parent with all additional schedules
    const allAdditionalSchedules = Object.values({ ...additionalFeeSchedules, [categoryId]: updatedSchedule });
    onChange(paymentSchedule, allAdditionalSchedules[0]); // For now, pass first schedule
  };

  const handleAdditionalDropdownOpenChange = (categoryId: string, isOpen: boolean) => {
    setAdditionalDropdownStates(prev => ({
      ...prev,
      [categoryId]: isOpen
    }));
  };

  // One-time payment handlers
  const handleTuitionOneTimeToggle = (enabled: boolean) => {
    setTuitionOneTimeEnabled(enabled);
    // When enabling one-time, we might want to disable recurring installments
    if (enabled && paymentSchedule.scheduleType !== 'upfront') {
      handleTuitionScheduleChange('upfront');
    }
  };

  const handleAdditionalFeeOneTimeToggle = (categoryId: string, enabled: boolean) => {
    const updatedSchedule = {
      ...additionalFeeSchedules[categoryId],
      oneTimeEnabled: enabled
    };
    
    setAdditionalFeeSchedules(prev => ({
      ...prev,
      [categoryId]: updatedSchedule
    }));
    
    // When enabling one-time, we might want to disable recurring installments
    if (enabled && updatedSchedule.scheduleType !== 'upfront') {
      handleAdditionalFeeScheduleChange(categoryId, 'upfront');
    }
  };

  const handleTuitionOneTimeDiscountChange = (discount: number) => {
    setTuitionOneTimeDiscount(discount);
  };

  const handleAdditionalFeeOneTimeDiscountChange = (categoryId: string, discount: number) => {
    const updatedSchedule = {
      ...additionalFeeSchedules[categoryId],
      oneTimeDiscount: discount
    };
    
    setAdditionalFeeSchedules(prev => ({
      ...prev,
      [categoryId]: updatedSchedule
    }));
  };

  const handleTuitionOneTimeDueDateChange = (dueDate: string) => {
    setTuitionOneTimeDueDate(dueDate);
  };

  const handleAdditionalFeeOneTimeDueDateChange = (categoryId: string, dueDate: string) => {
    const updatedSchedule = {
      ...additionalFeeSchedules[categoryId],
      oneTimeDueDate: dueDate
    };
    
    setAdditionalFeeSchedules(prev => ({
      ...prev,
      [categoryId]: updatedSchedule
    }));
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
    onChange(updatedTuitionSchedule, initialAdditionalSchedule);
  };

  const handleAdditionalFeeInstallmentsChange = (categoryId: string, installments: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    percentage: number;
    termId?: string;
  }[]) => {
    const updatedSchedule = {
      ...additionalFeeSchedules[categoryId],
      installments
    };
    
    setAdditionalFeeSchedules(prev => ({
      ...prev,
      [categoryId]: updatedSchedule
    }));
    
    // Update parent with all additional schedules
    const allAdditionalSchedules = Object.values({ ...additionalFeeSchedules, [categoryId]: updatedSchedule });
    onChange(paymentSchedule, allAdditionalSchedules[0]); // For now, pass first schedule
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
                oneTimeEnabled={tuitionOneTimeEnabled}
                onOneTimeToggle={handleTuitionOneTimeToggle}
                oneTimeDiscount={tuitionOneTimeDiscount}
                onOneTimeDiscountChange={handleTuitionOneTimeDiscountChange}
                oneTimeDueDate={tuitionOneTimeDueDate}
                onOneTimeDueDateChange={handleTuitionOneTimeDueDateChange}
              />
            )}

            {activeTab === 'additional' && additionalCategories.length > 0 && (
              <div className="space-y-6">
                {additionalCategories.map((category) => {
                  const schedule = additionalFeeSchedules[category.categoryId];
                  const categoryTotal = additionalFeeTotals[category.categoryId] || category.amount;
                  const isDropdownOpen = additionalDropdownStates[category.categoryId] || false;
                  
                  return (
                    <FeeSummary
                      key={category.categoryId}
                      categories={[category]}
                      total={categoryTotal}
                      type="additional"
                      scheduleType={schedule?.scheduleType || 'upfront'}
                      installments={schedule?.installments || []}
                      scheduleTypes={scheduleTypes}
                      isDropdownOpen={isDropdownOpen}
                      onDropdownOpenChange={(isOpen) => handleAdditionalDropdownOpenChange(category.categoryId, isOpen)}
                      onScheduleChange={(scheduleType) => handleAdditionalFeeScheduleChange(category.categoryId, scheduleType)}
                      oneTimeEnabled={schedule?.oneTimeEnabled || false}
                      onOneTimeToggle={(enabled) => handleAdditionalFeeOneTimeToggle(category.categoryId, enabled)}
                      oneTimeDiscount={schedule?.oneTimeDiscount || 0}
                      onOneTimeDiscountChange={(discount) => handleAdditionalFeeOneTimeDiscountChange(category.categoryId, discount)}
                      oneTimeDueDate={schedule?.oneTimeDueDate || ''}
                      onOneTimeDueDateChange={(dueDate) => handleAdditionalFeeOneTimeDueDateChange(category.categoryId, dueDate)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Individual Additional Fees Installments */}
        {activeTab === 'additional' && additionalCategories.map((category) => {
          const schedule = additionalFeeSchedules[category.categoryId];
          if (!schedule || !schedule.scheduleType || !category.supportsRecurring) return null;
          
          return (
            <div key={`installments-${category.categoryId}`} className="mb-6">
              <h4 className="text-lg font-semibold text-purple-800 mb-4">
                {category.categoryName} - Payment Installments
              </h4>
              <InstallmentManager
                installments={schedule.installments}
                scheduleType={schedule.scheduleType}
                totalAmount={category.amount}
                type="additional"
                onInstallmentsChange={(installments) => handleAdditionalFeeInstallmentsChange(category.categoryId, installments)}
                onAddInstallment={() => {
                  const newInstallmentNumber = schedule.installments.length + 1;
                  // Calculate a reasonable due date based on academic year
                  const startDate = new Date(academicYear.startDate || new Date());
                  const endDate = new Date(academicYear.endDate || new Date());
                  const totalDuration = endDate.getTime() - startDate.getTime();
                  const installmentDuration = totalDuration / (schedule.installments.length + 1);
                  const dueDate = new Date(startDate.getTime() + (installmentDuration * newInstallmentNumber));
                  
                  const newInstallment = {
                    installmentNumber: newInstallmentNumber,
                    amount: 0,
                    percentage: 0,
                    dueDate: dueDate.toISOString().split('T')[0],
                    termId: ''
                  };
                  
                  const updatedSchedule = {
                    ...schedule,
                    installments: [...schedule.installments, newInstallment]
                  };
                  
                  setAdditionalFeeSchedules(prev => ({
                    ...prev,
                    [category.categoryId]: updatedSchedule
                  }));
                }}
                onRemoveInstallment={(index) => {
                  const updatedInstallments = schedule.installments.filter((_, i) => i !== index);
                  const updatedSchedule = { ...schedule, installments: updatedInstallments };
                  
                  setAdditionalFeeSchedules(prev => ({
                    ...prev,
                    [category.categoryId]: updatedSchedule
                  }));
                }}
                onUpdateInstallment={(index, field, value) => {
                  let processedValue = value;
                  
                  // Handle numeric fields to remove leading zeros
                  if ((field === 'amount' || field === 'percentage') && typeof value === 'string') {
                    const cleanValue = value.replace(/^0+/, '') || '0';
                    processedValue = parseFloat(cleanValue) || 0;
                  }
                  
                  const updatedInstallments = schedule.installments.map((inst, i) => 
                    i === index ? { ...inst, [field]: processedValue } : inst
                  );
                  
                  const updatedSchedule = { ...schedule, installments: updatedInstallments };
                  
                  setAdditionalFeeSchedules(prev => ({
                    ...prev,
                    [category.categoryId]: updatedSchedule
                  }));
                }}
              />
            </div>
          );
        })}

        {/* Due Date Information */}
        {activeTab === 'tuition' && paymentSchedule.scheduleType && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Due Date Information</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Due dates are automatically calculated based on your academic year period ({academicYear.startDate} to {academicYear.endDate}).
                  You can edit any due date by clicking on the date field below.
                </p>
              </div>
            </div>
          </div>
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
              // Calculate a reasonable due date based on academic year
              const startDate = new Date(academicYear.startDate || new Date());
              const endDate = new Date(academicYear.endDate || new Date());
              const totalDuration = endDate.getTime() - startDate.getTime();
              const installmentDuration = totalDuration / (paymentSchedule.installments.length + 1);
              const dueDate = new Date(startDate.getTime() + (installmentDuration * newInstallmentNumber));
              
              const newInstallment = {
                installmentNumber: newInstallmentNumber,
                amount: 0,
                percentage: 0,
                dueDate: dueDate.toISOString().split('T')[0],
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

        {activeTab === 'additional' && additionalCategories.map((category) => {
          const schedule = additionalFeeSchedules[category.categoryId];
          if (!schedule) return null;
          
          return (
            <div key={`summary-${category.categoryId}`} className="mb-6">
              <h4 className="text-lg font-semibold text-purple-800 mb-4">
                {category.categoryName} - Payment Summary
              </h4>
              <PaymentScheduleSummary
                scheduleType={schedule.scheduleType}
                installments={schedule.installments}
                discountPercentage={schedule.discountPercentage}
                type="additional"
                selectedSchedule={scheduleTypes.find(s => s.value === schedule.scheduleType)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
