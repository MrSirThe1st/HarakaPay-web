// src/app/(dashboard)/school/fees/components/wizard-steps/AmountsStep.tsx
"use client";

import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';

interface AmountsStepProps {
  selectedCategories: {
    categoryId: string;
    categoryName: string;
    amount: number;
    isMandatory: boolean;
    supportsRecurring: boolean;
    supportsOneTime: boolean;
    categoryType: 'tuition' | 'additional';
  }[];
  academicYear: {
    name: string;
    startDate: string;
    endDate: string;
    termStructure: string;
  };
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
  onChange: (categories: any[]) => void;
}

export function AmountsStep({ selectedCategories, academicYear, paymentSchedule, onChange }: AmountsStepProps) {
  const { t } = useTranslation();
  const updateCategoryAmount = (index: number, value: string) => {
    // Remove leading zeros and convert to number
    const cleanValue = value.replace(/^0+/, '') || '0';
    const amount = parseFloat(cleanValue) || 0;
    
    const updated = [...selectedCategories];
    updated[index].amount = amount;
    onChange(updated);
  };

  // Separate tuition and additional fees
  console.log('AmountsStep - All selected categories:', selectedCategories.map(cat => ({
    id: cat.categoryId,
    name: cat.categoryName,
    type: cat.categoryType
  })));
  
  const tuitionCategories = selectedCategories.filter(cat => cat.categoryType === 'tuition');
  const additionalCategories = selectedCategories.filter(cat => cat.categoryType === 'additional');
  
  console.log('Tuition categories:', tuitionCategories.length);
  console.log('Additional categories:', additionalCategories.length);
  
  const tuitionTotal = tuitionCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const additionalTotal = additionalCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalAmount = tuitionTotal + additionalTotal;

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              {t('Enter the amount for each fee category. These amounts will be used to calculate the total fees for this grade/program.')}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {selectedCategories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 font-medium">{t('No categories selected')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('Please go back to Step 3 and select fee categories first')}</p>
            </div>
          ) : (
            <>
              {/* Tuition Categories */}
              {tuitionCategories.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-3">
                      {t('Tuition Fees')}
                    </span>
                  </h3>
                  {tuitionCategories.map((category, index) => {
                    const originalIndex = selectedCategories.findIndex(cat => cat.categoryId === category.categoryId);
                    return (
                      <div key={category.categoryId} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category.categoryName}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              {category.isMandatory && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {t('Mandatory')}
                                </span>
                              )}
                              {category.supportsRecurring && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {t('Supports Recurring')}
                                </span>
                              )}
                              {category.supportsOneTime && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Supports One-time
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              ${category.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">{t('Amount')} (USD)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={category.amount || ''}
                              onChange={(e) => updateCategoryAmount(originalIndex, e.target.value)}
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Additional Categories */}
              {additionalCategories.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 mr-3">
                      {t('Additional Fees')}
                    </span>
                  </h3>
                  {additionalCategories.map((category, index) => {
                    const originalIndex = selectedCategories.findIndex(cat => cat.categoryId === category.categoryId);
                    return (
                      <div key={category.categoryId} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category.categoryName}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              {category.isMandatory && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {t('Mandatory')}
                                </span>
                              )}
                              {category.supportsRecurring && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {t('Supports Recurring')}
                                </span>
                              )}
                              {category.supportsOneTime && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Supports One-time
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              ${category.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">{t('Amount')} (USD)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={category.amount || ''}
                              onChange={(e) => updateCategoryAmount(originalIndex, e.target.value)}
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Fee Summary */}
        <div className="mt-8 space-y-4">
          {/* Tuition Summary */}
          {tuitionTotal > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">{t('Tuition Fees')}</h3>
                  <p className="text-sm text-green-700">{t('Amount for payment schedule')}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-900">
                    ${tuitionTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Fees Summary */}
          {additionalTotal > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">{t('Additional Fees')}</h3>
                  <p className="text-sm text-purple-700">One-time payments</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-900">
                    ${additionalTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grand Total */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('Base Fee Total')}</h3>
                <p className="text-sm text-gray-700">All fees combined (before interest)</p>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Final amounts may include interest rates set in Payment Schedule
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Schedule Preview */}
        {totalAmount > 0 && paymentSchedule.scheduleType && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-900">Payment Schedule Preview</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">Academic Year:</span>
                <span className="font-medium text-blue-900">{academicYear.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">Term Structure:</span>
                <span className="font-medium text-blue-900">{academicYear.termStructure}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">Payment Schedule:</span>
                <span className="font-medium text-blue-900">
                  {paymentSchedule.scheduleType === 'upfront' && 'Annual Upfront'}
                  {paymentSchedule.scheduleType === 'per-term' && 'Per Term'}
                  {paymentSchedule.scheduleType === 'monthly' && 'Monthly Installments'}
                  {paymentSchedule.scheduleType === 'custom' && 'Custom Schedule'}
                </span>
              </div>
              
              {paymentSchedule.installments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Payment Breakdown:</h4>
                  <div className="space-y-2">
                    {paymentSchedule.installments.map((installment, index) => (
                      <div key={index} className="flex justify-between items-center bg-white bg-opacity-50 rounded px-3 py-2">
                        <span className="text-sm text-blue-700">Payment {installment.installmentNumber}</span>
                        <span className="font-medium text-blue-900">${installment.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {paymentSchedule.scheduleType === 'upfront' && paymentSchedule.discountPercentage && paymentSchedule.discountPercentage > 0 && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">Early Payment Discount:</span>
                    <span className="font-medium text-green-900">{paymentSchedule.discountPercentage}%</span>
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    Final amount: ${(totalAmount * (1 - (paymentSchedule.discountPercentage || 0) / 100)).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
