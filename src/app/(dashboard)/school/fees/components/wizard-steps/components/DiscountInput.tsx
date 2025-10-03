// src/app/(dashboard)/school/fees/components/wizard-steps/components/DiscountInput.tsx
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DiscountInputProps {
  value: number;
  onChange: (value: number) => void;
  type: 'tuition' | 'additional';
}

export function DiscountInput({ value, onChange, type }: DiscountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/^0+/, '') || '0';
    const discountPercentage = parseFloat(cleanValue) || 0;
    onChange(discountPercentage);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-900">
        {type === 'tuition' ? 'Early Payment Discount (%)' : 'Additional Fees Early Payment Discount (%)'}
      </Label>
      <Input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={handleChange}
        className="h-12"
        placeholder="0"
      />
      <p className="text-xs text-gray-500">
        Percentage discount for paying {type === 'tuition' ? 'the full year' : 'additional fees'} upfront
      </p>
    </div>
  );
}
