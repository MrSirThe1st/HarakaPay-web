// src/app/(dashboard)/school/fees/components/wizard-steps/PaymentSchedulesStep.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CalendarIcon, ChevronDownIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface PaymentSchedulesStepProps {
  paymentSchedule: {
    scheduleType: string;
    installments: {
      description: string;
      amount: number;
      percentage: number;
      dueDate: string;
      termId?: string;
    }[];
    discountPercentage: number;
  };
  onChange: (schedule: {
    scheduleType: string;
    installments: {
      description: string;
      amount: number;
      percentage: number;
      dueDate: string;
      termId?: string;
    }[];
    discountPercentage: number;
  }) => void;
}

const scheduleTypes = [
  { 
    value: 'annual', 
    label: 'Annual Upfront', 
    description: 'Pay the full year amount at once',
    icon: '💰'
  },
  { 
    value: 'per-term', 
    label: 'Per Term/Semester', 
    description: 'Payments due at the start of each term',
    icon: '📚'
  },
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

export function PaymentSchedulesStep({ paymentSchedule, onChange }: PaymentSchedulesStepProps) {
  const [isScheduleDropdownOpen, setIsScheduleDropdownOpen] = useState(false);
  const [newInstallment, setNewInstallment] = useState({
    description: '',
    amount: 0,
    percentage: 0,
    dueDate: '',
    termId: ''
  });

  const selectedSchedule = scheduleTypes.find(s => s.value === paymentSchedule.scheduleType);

  // Auto-generate installments based on schedule type
  useEffect(() => {
    if (paymentSchedule.scheduleType && paymentSchedule.installments.length === 0) {
      generateDefaultInstallments();
    }
  }, [paymentSchedule.scheduleType]);

  const generateDefaultInstallments = () => {
    let installments = [];
    
    switch (paymentSchedule.scheduleType) {
      case 'annual':
        installments = [{
          description: 'Full Year Payment',
          amount: 0,
          percentage: 100,
          dueDate: '',
          termId: ''
        }];
        break;
      case 'per-term':
        installments = [
          { description: 'Term 1 Payment', amount: 0, percentage: 33.33, dueDate: '', termId: '' },
          { description: 'Term 2 Payment', amount: 0, percentage: 33.33, dueDate: '', termId: '' },
          { description: 'Term 3 Payment', amount: 0, percentage: 33.34, dueDate: '', termId: '' }
        ];
        break;
      case 'monthly':
        installments = Array.from({ length: 12 }, (_, i) => ({
          description: `${new Date(2024, i).toLocaleString('default', { month: 'long' })} Payment`,
          amount: 0,
          percentage: 8.33,
          dueDate: '',
          termId: ''
        }));
        break;
      case 'custom':
        installments = [];
        break;
    }
    
    onChange({
      ...paymentSchedule,
      installments
    });
  };

  const handleScheduleTypeChange = (scheduleType: string) => {
    onChange({
      ...paymentSchedule,
      scheduleType,
      installments: [], // Clear existing installments
      discountPercentage: scheduleType === 'annual' ? paymentSchedule.discountPercentage : 0
    });
    setIsScheduleDropdownOpen(false);
  };

  const addInstallment = () => {
    if (newInstallment.description.trim()) {
      const updated = {
        ...paymentSchedule,
        installments: [...paymentSchedule.installments, {
          ...newInstallment,
          description: newInstallment.description.trim()
        }]
      };
      onChange(updated);
      setNewInstallment({
        description: '',
        amount: 0,
        percentage: 0,
        dueDate: '',
        termId: ''
      });
    }
  };

  const removeInstallment = (index: number) => {
    const updated = {
      ...paymentSchedule,
      installments: paymentSchedule.installments.filter((_, i) => i !== index)
    };
    onChange(updated);
  };

  const updateInstallment = (index: number, field: string, value: any) => {
    let processedValue = value;
    
    // Handle numeric fields to remove leading zeros
    if ((field === 'amount' || field === 'percentage') && typeof value === 'string') {
      const cleanValue = value.replace(/^0+/, '') || '0';
      processedValue = parseFloat(cleanValue) || 0;
    }
    
    const updated = {
      ...paymentSchedule,
      installments: paymentSchedule.installments.map((inst, i) => 
        i === index ? { ...inst, [field]: processedValue } : inst
      )
    };
    onChange(updated);
  };

  const canAddInstallment = newInstallment.description.trim().length > 0;

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

        {/* Schedule Type Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-900">Payment Schedule Type *</Label>
          <DropdownMenu.Root open={isScheduleDropdownOpen} onOpenChange={setIsScheduleDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 px-4 text-left font-normal"
              >
                <span className={selectedSchedule ? "text-gray-900" : "text-gray-500"}>
                  {selectedSchedule ? (
                    <div className="flex items-center space-x-2">
                      <span>{selectedSchedule.icon}</span>
                      <span>{selectedSchedule.label}</span>
                    </div>
                  ) : "Select payment schedule type"}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                align="start"
              >
                {scheduleTypes.map((schedule) => (
                  <DropdownMenu.Item
                    key={schedule.value}
                    className="flex items-start p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onSelect={() => handleScheduleTypeChange(schedule.value)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{schedule.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{schedule.label}</div>
                        <div className="text-sm text-gray-500">{schedule.description}</div>
                      </div>
                    </div>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>

        {/* Discount for Annual */}
        {paymentSchedule.scheduleType === 'annual' && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Early Payment Discount (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={paymentSchedule.discountPercentage}
              onChange={(e) => {
                const value = e.target.value;
                const cleanValue = value.replace(/^0+/, '') || '0';
                const discountPercentage = parseFloat(cleanValue) || 0;
                onChange({ ...paymentSchedule, discountPercentage });
              }}
              className="h-12"
              placeholder="0"
            />
            <p className="text-xs text-gray-500">Percentage discount for paying the full year upfront</p>
          </div>
        )}

        {/* Installments */}
        {paymentSchedule.scheduleType && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Payment Installments</h3>
              {paymentSchedule.scheduleType === 'custom' && (
                <Button
                  onClick={addInstallment}
                  disabled={!canAddInstallment}
                  className="h-10"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Installment
                </Button>
              )}
            </div>

            {/* Auto-generated installments info */}
            {paymentSchedule.scheduleType !== 'custom' && paymentSchedule.installments.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✅ Installments auto-generated for {selectedSchedule?.label}. You can modify amounts and dates below.
                </p>
              </div>
            )}

            {paymentSchedule.installments.map((installment, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">Installment {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeInstallment(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Input
                      type="text"
                      value={installment.description}
                      onChange={(e) => updateInstallment(index, 'description', e.target.value)}
                      className="h-10"
                      placeholder="e.g., Term 1 Payment"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={installment.dueDate}
                        onChange={(e) => updateInstallment(index, 'dueDate', e.target.value)}
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
                      value={installment.amount || ''}
                      onChange={(e) => updateInstallment(index, 'amount', e.target.value)}
                      className="h-10"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={installment.percentage || ''}
                      onChange={(e) => updateInstallment(index, 'percentage', e.target.value)}
                      className="h-10"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Custom installment form */}
            {paymentSchedule.scheduleType === 'custom' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Installment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Description *</Label>
                    <Input
                      type="text"
                      value={newInstallment.description}
                      onChange={(e) => setNewInstallment({ ...newInstallment, description: e.target.value })}
                      className="h-10"
                      placeholder="e.g., Registration Fee"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={newInstallment.dueDate}
                        onChange={(e) => setNewInstallment({ ...newInstallment, dueDate: e.target.value })}
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
                      value={newInstallment.amount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const cleanValue = value.replace(/^0+/, '') || '0';
                        const amount = parseFloat(cleanValue) || 0;
                        setNewInstallment({ ...newInstallment, amount });
                      }}
                      className="h-10"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newInstallment.percentage || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const cleanValue = value.replace(/^0+/, '') || '0';
                        const percentage = parseFloat(cleanValue) || 0;
                        setNewInstallment({ ...newInstallment, percentage });
                      }}
                      className="h-10"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentSchedule.installments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No installments added yet.</p>
                {paymentSchedule.scheduleType === 'custom' && (
                  <p className="text-sm mt-2">Fill in the description above and click "Add Installment" to create payment schedules.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {paymentSchedule.scheduleType && paymentSchedule.installments.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-green-900">Payment Schedule Configured</span>
            </div>
            <div className="text-sm text-green-800">
              <div className="font-medium">{selectedSchedule?.label}</div>
              <div className="text-green-600">{paymentSchedule.installments.length} installment(s) defined</div>
              {paymentSchedule.scheduleType === 'annual' && paymentSchedule.discountPercentage > 0 && (
                <div className="text-green-600">{paymentSchedule.discountPercentage}% early payment discount</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
