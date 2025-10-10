// src/app/(dashboard)/school/fees/components/wizard-steps/components/FeeSummary.tsx
"use client";

import React from 'react';
import { CurrencyDollarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface FeeCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  isMandatory: boolean;
  supportsRecurring: boolean;
  supportsOneTime: boolean;
  categoryType: 'tuition' | 'additional';
}

interface ScheduleType {
  value: string;
  label: string;
  description: string;
  recommended?: boolean;
  termCount?: number;
  termType?: string;
}

interface FeeSummaryProps {
  categories: FeeCategory[];
  total: number;
  type: 'tuition' | 'additional';
  scheduleType?: string;
  installments: any[];
  scheduleTypes: ScheduleType[];
  isDropdownOpen: boolean;
  onDropdownOpenChange: (open: boolean) => void;
  onScheduleChange: (scheduleType: string, installments: any[]) => void;
  oneTimeEnabled?: boolean;
  onOneTimeToggle?: (enabled: boolean) => void;
  oneTimeDiscount?: number;
  onOneTimeDiscountChange?: (discount: number) => void;
  oneTimeDueDate?: string;
  onOneTimeDueDateChange?: (dueDate: string) => void;
}

export function FeeSummary({
  categories,
  total,
  type,
  scheduleType,
  installments,
  scheduleTypes,
  isDropdownOpen,
  onDropdownOpenChange,
  onScheduleChange,
  oneTimeEnabled = false,
  onOneTimeToggle,
  oneTimeDiscount = 0,
  onOneTimeDiscountChange,
  oneTimeDueDate = '',
  onOneTimeDueDateChange
}: FeeSummaryProps) {
  const recurringCategories = categories.filter(cat => cat.supportsRecurring);
  const oneTimeCategories = categories.filter(cat => cat.supportsOneTime);
  
  const colorScheme = type === 'tuition' ? {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    textSecondary: 'text-green-700',
    textAccent: 'text-green-600',
    button: 'border-green-300 text-green-800 hover:bg-green-50',
    label: 'text-green-700',
    badge: 'bg-green-100 text-green-800'
  } : {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    textSecondary: 'text-purple-700',
    textAccent: 'text-purple-600',
    button: 'border-purple-300 text-purple-800 hover:bg-purple-50',
    label: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800'
  };

  const selectedSchedule = scheduleTypes.find(s => s.value === scheduleType);

  // Auto-enable one-time payment if any category supports it
  React.useEffect(() => {
    const hasOneTimeSupport = categories.some(cat => cat.supportsOneTime);
    if (hasOneTimeSupport && !oneTimeEnabled && onOneTimeToggle) {
      onOneTimeToggle(true);
    }
  }, [categories, oneTimeEnabled, onOneTimeToggle]);

  return (
    <div className={`${colorScheme.bg} ${colorScheme.border} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CurrencyDollarIcon className={`h-5 w-5 ${colorScheme.textAccent} mr-2`} />
          <span className={`text-lg font-semibold ${colorScheme.text}`}>
            {type === 'tuition' ? 'Tuition Fees' : 'Additional Fees'}
          </span>
        </div>
        <span className={`text-xl font-bold ${colorScheme.text}`}>
          ${total.toLocaleString()}
        </span>
      </div>

      {/* Recurring Payments (Installments) */}
      {recurringCategories.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${colorScheme.textSecondary}`}>
              Recurring Payments (Installments):
            </span>
            <span className={`text-sm font-semibold ${colorScheme.text}`}>
              ${total.toLocaleString()}
            </span>
          </div>
          
          {/* Category breakdown */}
          <div className="space-y-1 mb-3 ml-4">
            {recurringCategories.map((fee) => (
              <div key={fee.categoryId} className="flex justify-between items-center text-sm">
                <span className={colorScheme.textAccent}>{fee.categoryName}</span>
                <span className={`font-medium ${colorScheme.textSecondary}`}>
                  ${fee.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          {/* Payment schedule dropdown */}
          <div className="space-y-2 ml-4">
            <label className={`block text-sm font-medium ${colorScheme.label}`}>
              Payment Schedule:
            </label>
            <DropdownMenu.Root open={isDropdownOpen} onOpenChange={onDropdownOpenChange}>
              <DropdownMenu.Trigger asChild>
                <Button variant="outline" className={`w-full justify-between bg-white ${colorScheme.button}`}>
                  {selectedSchedule ? selectedSchedule.label : 'Select payment schedule'}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg">
                  {scheduleTypes.map((schedule) => (
                    <DropdownMenu.Item
                      key={schedule.value}
                      className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onSelect={() => {
                        // This will be handled by the parent component
                        onScheduleChange(schedule.value, []);
                      }}
                    >
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{schedule.label}</div>
                          <div className="text-xs text-gray-500">{schedule.description}</div>
                        </div>
                      </div>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          
          {/* Installment breakdown */}
          {scheduleType && installments.length > 0 && (
            <div className={`mt-2 ml-4 text-sm ${colorScheme.textAccent}`}>
              {scheduleType === 'upfront' && (
                <span>Single payment of ${total.toLocaleString()}</span>
              )}
              {scheduleType === 'per-term' && (
                <span>{installments.length} term payments of ${Math.round(total / installments.length).toLocaleString()} each</span>
              )}
              {scheduleType === 'monthly' && (
                <span>12 monthly payments of ${Math.round(total / 12).toLocaleString()} each</span>
              )}
              {scheduleType === 'custom' && (
                <span>{installments.length} custom payments</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* One-time Payments */}
      {oneTimeCategories.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className={`text-lg font-semibold ${colorScheme.text}`}>
              💰 One-time Payment Options
            </h4>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${colorScheme.textSecondary}`}>
                Total: ${total.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {oneTimeCategories.map((fee) => (
              <div key={fee.categoryId} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className={`font-medium ${colorScheme.textAccent}`}>{fee.categoryName}</span>
                <span className={`font-semibold ${colorScheme.textSecondary}`}>
                  ${fee.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          {/* One-time Payment Toggle */}
          <div className={`${colorScheme.bg} ${colorScheme.border} rounded-lg p-4 border-2`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id={`${type}-one-time-toggle`}
                  checked={oneTimeEnabled}
                  onChange={(e) => onOneTimeToggle?.(e.target.checked)}
                  className={`w-5 h-5 rounded border-2 ${colorScheme.button} focus:ring-${type === 'tuition' ? 'green' : 'purple'}-500 focus:ring-2`}
                />
                <label htmlFor={`${type}-one-time-toggle`} className={`text-lg font-semibold ${colorScheme.text} cursor-pointer`}>
                  Enable Annual Upfront Payment
                </label>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${oneTimeEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {oneTimeEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            
            {oneTimeEnabled && (
              <div className="space-y-4 pl-8 border-l-2 border-gray-300">
                {/* Discount Input */}
                <div className="flex items-center space-x-4">
                  <label className={`text-sm font-medium ${colorScheme.textSecondary} min-w-[120px]`}>
                    Early Payment Discount:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      min="0" 
                      max="50" 
                      step="0.5"
                      value={oneTimeDiscount}
                      onChange={(e) => onOneTimeDiscountChange?.(parseFloat(e.target.value) || 0)}
                      className={`w-20 px-3 py-2 border ${colorScheme.border} rounded-lg text-sm focus:ring-2 focus:ring-${type === 'tuition' ? 'green' : 'purple'}-500 focus:border-${type === 'tuition' ? 'green' : 'purple'}-500`}
                    />
                    <span className={`text-sm ${colorScheme.textAccent}`}>%</span>
                  </div>
                </div>
                
                {/* Due Date Input */}
                <div className="flex items-center space-x-4">
                  <label className={`text-sm font-medium ${colorScheme.textSecondary} min-w-[120px]`}>
                    Payment Due Date:
                  </label>
                  <input 
                    type="date" 
                    value={oneTimeDueDate}
                    onChange={(e) => onOneTimeDueDateChange?.(e.target.value)}
                    className={`px-3 py-2 border ${colorScheme.border} rounded-lg text-sm focus:ring-2 focus:ring-${type === 'tuition' ? 'green' : 'purple'}-500 focus:border-${type === 'tuition' ? 'green' : 'purple'}-500`}
                  />
                </div>
                
                {/* Payment Summary */}
                <div className={`${colorScheme.bg} ${colorScheme.border} rounded-lg p-3 border`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${colorScheme.textSecondary}`}>
                      Original Amount:
                    </span>
                    <span className={`text-sm font-semibold ${colorScheme.text}`}>
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  {oneTimeDiscount > 0 && (
                    <>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-sm font-medium ${colorScheme.textSecondary}`}>
                          Discount ({oneTimeDiscount}%):
                        </span>
                        <span className={`text-sm font-semibold text-green-600`}>
                          -${(total * oneTimeDiscount / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                        <span className={`text-base font-semibold ${colorScheme.text}`}>
                          Final Amount:
                        </span>
                        <span className={`text-lg font-bold text-green-600`}>
                          ${(total * (1 - oneTimeDiscount / 100)).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
