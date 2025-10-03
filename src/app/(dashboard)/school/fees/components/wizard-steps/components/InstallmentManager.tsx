// src/app/(dashboard)/school/fees/components/wizard-steps/components/InstallmentManager.tsx
"use client";

import React, { useState } from 'react';
import { PlusIcon, TrashIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Installment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  percentage: number;
  termId?: string;
}

interface InstallmentManagerProps {
  installments: Installment[];
  scheduleType: string;
  totalAmount: number;
  type: 'tuition' | 'additional';
  onInstallmentsChange: (installments: Installment[]) => void;
  onAddInstallment?: () => void;
  onRemoveInstallment?: (index: number) => void;
  onUpdateInstallment?: (index: number, field: string, value: string | number) => void;
}

export function InstallmentManager({
  installments,
  scheduleType,
  totalAmount,
  type,
  onInstallmentsChange,
  onAddInstallment,
  onRemoveInstallment,
  onUpdateInstallment
}: InstallmentManagerProps) {
  const [percentageForAll, setPercentageForAll] = useState(0);

  const colorScheme = type === 'tuition' ? {
    bg: 'bg-green-50',
    border: 'border-green-200',
    borderL: 'border-green-400',
    text: 'text-green-900',
    textSecondary: 'text-green-700',
    textAccent: 'text-green-800',
    button: 'bg-green-600 hover:bg-green-700',
    badge: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
    container: 'bg-green-25 border-green-200'
  } : {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    borderL: 'border-purple-400',
    text: 'text-purple-900',
    textSecondary: 'text-purple-700',
    textAccent: 'text-purple-800',
    button: 'bg-purple-600 hover:bg-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-500',
    container: 'bg-purple-25 border-purple-200'
  };

  const handlePercentageForAllChange = (value: string) => {
    const cleanValue = value.replace(/^0+/, '') || '0';
    const percentage = parseFloat(cleanValue) || 0;
    setPercentageForAll(percentage);
    
    // Auto-calculate amounts for all installments
    const baseAmount = totalAmount / installments.length;
    const interestAmount = (baseAmount * percentage) / 100;
    const calculatedAmount = baseAmount + interestAmount;
    
    const updatedInstallments = installments.map(inst => ({
      ...inst,
      percentage,
      amount: Math.round(calculatedAmount * 100) / 100
    }));
    
    onInstallmentsChange(updatedInstallments);
  };

  const handleInstallmentUpdate = (index: number, field: string, value: string | number) => {
    if (onUpdateInstallment) {
      onUpdateInstallment(index, field, value);
    }
  };

  const handleAmountChange = (index: number, value: string) => {
    if (value === '') {
      // Update both fields when clearing
      const updatedInstallments = installments.map((inst, i) => 
        i === index ? { ...inst, amount: 0, percentage: 0 } : inst
      );
      onInstallmentsChange(updatedInstallments);
      return;
    }
    
    const cleanValue = value.replace(/^0+/, '') || '0';
    const amount = parseFloat(cleanValue) || 0;
    
    // Auto-calculate percentage based on amount
    const baseAmount = totalAmount / installments.length;
    const interestAmount = amount - baseAmount;
    const calculatedPercentage = baseAmount > 0 ? (interestAmount / baseAmount) * 100 : 0;
    
    // Update both fields in one go
    const updatedInstallments = installments.map((inst, i) => 
      i === index ? { 
        ...inst, 
        amount, 
        percentage: Math.round(calculatedPercentage * 100) / 100 
      } : inst
    );
    onInstallmentsChange(updatedInstallments);
  };

  const handlePercentageChange = (index: number, value: string) => {
    if (value === '') {
      // Update both fields when clearing
      const updatedInstallments = installments.map((inst, i) => 
        i === index ? { ...inst, percentage: 0, amount: totalAmount / installments.length } : inst
      );
      onInstallmentsChange(updatedInstallments);
      return;
    }
    
    const cleanValue = value.replace(/^0+/, '') || '0';
    const percentage = parseFloat(cleanValue) || 0;
    
    // Auto-calculate amount based on percentage
    const baseAmount = totalAmount / installments.length;
    const interestAmount = (baseAmount * percentage) / 100;
    const calculatedAmount = baseAmount + interestAmount;
    
    // Update both fields in one go
    const updatedInstallments = installments.map((inst, i) => 
      i === index ? { 
        ...inst, 
        percentage, 
        amount: Math.round(calculatedAmount * 100) / 100 
      } : inst
    );
    onInstallmentsChange(updatedInstallments);
  };

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className={`${colorScheme.bg} border-l-4 ${colorScheme.borderL} rounded-r-lg p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CurrencyDollarIcon className={`h-6 w-6 ${colorScheme.textAccent} mr-3`} />
            <div>
              <h3 className={`text-lg font-semibold ${colorScheme.text}`}>
                {type === 'tuition' ? 'Tuition Fees' : 'Additional Fees'} Payment Installments
              </h3>
              <p className={`text-sm ${colorScheme.textSecondary}`}>
                Manage installment details for {type === 'tuition' ? 'tuition' : 'additional'} fees
              </p>
            </div>
          </div>
          {scheduleType === 'custom' && onAddInstallment && (
            <Button
              onClick={onAddInstallment}
              className={`h-10 ${colorScheme.button}`}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Installment
            </Button>
          )}
        </div>
      </div>

      {/* Auto-generated installments info */}
      {scheduleType !== 'custom' && installments.length > 0 && (
        <div className={`${colorScheme.bg} ${colorScheme.border} rounded-lg p-3 mb-6`}>
          <p className={`text-sm ${colorScheme.textAccent}`}>
            <strong>Auto-generated installments:</strong> These installments are automatically calculated based on your selected schedule type. 
            You can modify amounts, percentages, and due dates as needed.
          </p>
        </div>
      )}

      {/* Installments Container */}
      <div className={`${colorScheme.container} ${colorScheme.border} rounded-lg p-6 space-y-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 ${colorScheme.dot} rounded-full mr-3`}></div>
            <h4 className={`text-md font-semibold ${colorScheme.text}`}>
              {type === 'tuition' ? 'Tuition Fees' : 'Additional Fees'} Installments
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium text-gray-700">Set Interest % for All:</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={percentageForAll === 0 ? '' : percentageForAll}
              onChange={(e) => handlePercentageForAllChange(e.target.value)}
              className="h-8 w-20"
              placeholder="0"
            />
          </div>
        </div>
        
        {installments.map((installment, index) => (
          <div key={index} className={`bg-white ${colorScheme.border} rounded-lg p-6 shadow-sm ml-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 ${colorScheme.badge} rounded-full flex items-center justify-center mr-3`}>
                  <span className={`text-sm font-semibold ${colorScheme.textAccent}`}>{index + 1}</span>
                </div>
                <h4 className="text-md font-semibold text-gray-900">Installment {index + 1}</h4>
              </div>
              {onRemoveInstallment && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveInstallment(index)}
                  className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Payment Number</Label>
                <Input
                  type="number"
                  value={installment.installmentNumber}
                  onChange={(e) => handleInstallmentUpdate(index, 'installmentNumber', parseInt(e.target.value) || 1)}
                  className="h-10"
                  placeholder="1"
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={installment.dueDate}
                    onChange={(e) => handleInstallmentUpdate(index, 'dueDate', e.target.value)}
                    className="h-10 pr-10"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Amount ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={installment.amount === 0 ? '' : installment.amount}
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                  className="h-10"
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Interest Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={installment.percentage === 0 ? '' : installment.percentage}
                  onChange={(e) => handlePercentageChange(index, e.target.value)}
                  className="h-10"
                  placeholder="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500">
                  Base: ${Math.round((totalAmount / installments.length) * 100) / 100} + Interest
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No installments message */}
      {installments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No installments added yet.</p>
          {scheduleType === 'custom' && (
            <p className="text-sm mt-2">Fill in the description above and click "Add Installment" to create payment schedules.</p>
          )}
        </div>
      )}
    </div>
  );
}
