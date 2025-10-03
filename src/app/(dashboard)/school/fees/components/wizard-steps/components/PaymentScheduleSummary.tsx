// src/app/(dashboard)/school/fees/components/wizard-steps/components/PaymentScheduleSummary.tsx
"use client";

import React from 'react';

interface ScheduleType {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface PaymentScheduleSummaryProps {
  scheduleType: string;
  installments: any[];
  discountPercentage?: number;
  type: 'tuition' | 'additional';
  selectedSchedule?: ScheduleType;
}

export function PaymentScheduleSummary({
  scheduleType,
  installments,
  discountPercentage,
  type,
  selectedSchedule
}: PaymentScheduleSummaryProps) {
  const colorScheme = type === 'tuition' ? {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    textSecondary: 'text-green-800',
    textAccent: 'text-green-600',
    dot: 'bg-green-500'
  } : {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    textSecondary: 'text-purple-800',
    textAccent: 'text-purple-600',
    dot: 'bg-purple-500'
  };

  if (!scheduleType || installments.length === 0) {
    return null;
  }

  return (
    <div className={`${colorScheme.bg} ${colorScheme.border} rounded-lg p-4`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className={`w-2 h-2 ${colorScheme.dot} rounded-full`}></div>
        <span className={`text-sm font-semibold ${colorScheme.text}`}>
          {type === 'tuition' ? 'Tuition' : 'Additional Fees'} Payment Schedule Configured
        </span>
      </div>
      <div className={`text-sm ${colorScheme.textSecondary}`}>
        <div className="font-medium">{selectedSchedule?.label}</div>
        <div className={colorScheme.textAccent}>{installments.length} installment(s) defined</div>
        {scheduleType === 'upfront' && discountPercentage && discountPercentage > 0 && (
          <div className={colorScheme.textAccent}>{discountPercentage}% early payment discount</div>
        )}
      </div>
    </div>
  );
}
