// src/app/(dashboard)/school/fees/components/SchoolStaffFeesView.tsx
"use client";

import React, { useState } from 'react';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { FeeStructureWizard } from './FeeStructureWizard';
import { FeeManagementView } from './FeeManagementView';
import { ViewMode } from '../types/feeTypes';
import { useTranslation } from '@/hooks/useTranslation';

export function SchoolStaffFeesView() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('management');

  const handleCreateNew = () => {
    setViewMode('wizard');
  };

  const handleWizardComplete = () => {
    setViewMode('management');
  };

  const handleWizardCancel = () => {
    setViewMode('management');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Fee Management System')}</h1>
          <p className="text-gray-600">
            {viewMode === 'wizard' 
              ? t('Create new fee structure step by step')
              : t('Manage existing fee structures, categories, and schedules')
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {viewMode === 'wizard' && (
            <button
              onClick={handleWizardCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {t('Back to Management')}
            </button>
          )}
          {viewMode === 'management' && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('Create New Fee Structure')}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'wizard' ? (
        <FeeStructureWizard 
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      ) : (
        <FeeManagementView 
          onCreateNew={handleCreateNew}
        />
      )}
    </div>
  );
}
