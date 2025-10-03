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
  icon: string;
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
  onScheduleChange
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
                        <span className="mr-2">{schedule.icon}</span>
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${colorScheme.textSecondary}`}>
              One-time Payments:
            </span>
            <span className={`text-sm font-semibold ${colorScheme.text}`}>
              ${total.toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-1 mb-3 ml-4">
            {oneTimeCategories.map((fee) => (
              <div key={fee.categoryId} className="flex justify-between items-center text-sm">
                <span className={colorScheme.textAccent}>{fee.categoryName}</span>
                <span className={`font-medium ${colorScheme.textSecondary}`}>
                  ${fee.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          <div className="ml-4 space-y-2">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id={`${type}-upfront`}
                className={`rounded ${colorScheme.button} focus:ring-${type === 'tuition' ? 'green' : 'purple'}-500`}
              />
              <label htmlFor={`${type}-upfront`} className={`text-sm ${colorScheme.textAccent}`}>
                💰 Annual Upfront Payment (with discount)
              </label>
            </div>
            <div className={`text-sm ${colorScheme.textAccent}`}>
              📅 Due Date: <input type="date" className={`ml-2 px-2 py-1 border ${colorScheme.border} rounded text-sm`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
