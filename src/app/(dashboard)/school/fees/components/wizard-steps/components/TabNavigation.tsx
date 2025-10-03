// src/app/(dashboard)/school/fees/components/wizard-steps/components/TabNavigation.tsx
"use client";

import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface TabNavigationProps {
  activeTab: 'tuition' | 'additional';
  onTabChange: (tab: 'tuition' | 'additional') => void;
  tuitionTotal: number;
  additionalTotal: number;
}

export function TabNavigation({ activeTab, onTabChange, tuitionTotal, additionalTotal }: TabNavigationProps) {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onTabChange('tuition')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'tuition'
            ? 'bg-white text-green-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <CurrencyDollarIcon className="h-4 w-4" />
          <span>Tuition Fees</span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            ${tuitionTotal.toLocaleString()}
          </span>
        </div>
      </button>
      <button
        onClick={() => onTabChange('additional')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'additional'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <CurrencyDollarIcon className="h-4 w-4" />
          <span>Additional Fees</span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            ${additionalTotal.toLocaleString()}
          </span>
        </div>
      </button>
    </div>
  );
}
