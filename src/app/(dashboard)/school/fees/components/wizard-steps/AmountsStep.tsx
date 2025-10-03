// src/app/(dashboard)/school/fees/components/wizard-steps/AmountsStep.tsx
"use client";

import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface AmountsStepProps {
  selectedCategories: {
    categoryId: string;
    categoryName: string;
    amount: number;
    isMandatory: boolean;
    isRecurring: boolean;
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
  const updateCategoryAmount = (index: number, value: string) => {
    // Remove leading zeros and convert to number
    const cleanValue = value.replace(/^0+/, '') || '0';
    const amount = parseFloat(cleanValue) || 0;
    
    const updated = [...selectedCategories];
    updated[index].amount = amount;
    onChange(updated);
  };

  const totalAmount = selectedCategories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              Enter the amount for each fee category. These amounts will be used to calculate the total fees for this grade/program.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {selectedCategories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 font-medium">No categories selected</p>
              <p className="text-sm text-gray-500 mt-1">Please go back to Step 3 and select fee categories first</p>
            </div>
          ) : (
            selectedCategories.map((category, index) => (
              <div key={category.categoryId} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.categoryName}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      {category.isMandatory && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Mandatory
                        </span>
                      )}
                      {category.isRecurring && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Recurring
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
                  <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={category.amount || ''}
                      onChange={(e) => updateCategoryAmount(index, e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total Summary */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">Total Fee Amount</h3>
              <p className="text-sm text-green-700">Sum of all selected categories</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-900">
                ${totalAmount.toLocaleString()}
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
