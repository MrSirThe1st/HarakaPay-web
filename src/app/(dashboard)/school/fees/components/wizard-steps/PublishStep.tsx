// src/app/(dashboard)/school/fees/components/wizard-steps/PublishStep.tsx
"use client";

import React from 'react';
import { CheckCircleIcon, CalendarIcon, ClipboardDocumentListIcon, AcademicCapIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';
import { WizardData } from '../../types/feeTypes';

interface PublishStepProps {
  wizardData: WizardData;
  onPublish: () => void;
  isSaving?: boolean;
}

export function PublishStep({ wizardData, onPublish, isSaving = false }: PublishStepProps) {
  const totalCategories = wizardData.selectedCategories.length;
  const totalAmount = wizardData.selectedCategories.reduce((sum, cat) => sum + (cat.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Summary Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Your Fee Structure</h3>
          <p className="text-gray-600">Please review all details before publishing your fee schedule</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Academic Year */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Academic Year</h4>
                <p className="text-lg font-semibold text-gray-900">{wizardData.academicYear.name}</p>
                <p className="text-xs text-gray-500">{wizardData.academicYear.termStructure}</p>
              </div>
            </div>
          </div>

          {/* Grade/Program */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Grade/Program</h4>
                <p className="text-lg font-semibold text-gray-900">{wizardData.gradeProgram.gradeLevel}</p>
                <p className="text-xs text-gray-500">{wizardData.gradeProgram.programType}</p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Fee Categories</h4>
                <p className="text-lg font-semibold text-gray-900">{totalCategories}</p>
                <p className="text-xs text-gray-500">Categories selected</p>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ReceiptPercentIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Total Amount</h4>
                <p className="text-lg font-semibold text-gray-900">${totalAmount}</p>
                <p className="text-xs text-gray-500">{wizardData.paymentSchedule.scheduleType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Summary */}
        <div className="space-y-6">
          {/* Academic Year Details */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Academic Year Details</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Year Name</p>
                <p className="text-sm font-medium text-gray-900">{wizardData.academicYear.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-sm font-medium text-gray-900">{wizardData.academicYear.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-sm font-medium text-gray-900">{wizardData.academicYear.endDate}</p>
              </div>
            </div>
          </div>

          {/* Fee Categories */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Fee Categories ({totalCategories})</h4>
            {totalCategories === 0 ? (
              <p className="text-gray-500 text-sm">No categories selected</p>
            ) : (
              <div className="space-y-2">
                {wizardData.selectedCategories.map((category) => (
                  <div key={category.categoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.categoryName}</p>
                      <p className="text-xs text-gray-500">Amount: ${category.amount}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.isMandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {category.isMandatory ? 'Mandatory' : 'Optional'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {category.isRecurring ? 'Recurring' : 'One-time'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Schedule */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-gray-900">Schedule Type</h5>
                <p className="text-sm font-medium text-gray-900 capitalize">{wizardData.paymentSchedule.scheduleType.replace('-', ' ')}</p>
              </div>
              {wizardData.paymentSchedule.discountPercentage && (
                <p className="text-xs text-gray-500 mb-2">Discount: {wizardData.paymentSchedule.discountPercentage}%</p>
              )}
              <div className="text-xs text-gray-500">
                Total Amount: ${totalAmount}
              </div>
            </div>
          </div>
        </div>

        {/* Save Template Buttons */}
        <div className="text-center pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onPublish}
              disabled={isSaving}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white transition-colors shadow-lg ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Save Template
                </>
              )}
            </button>
            <button
              onClick={onPublish}
              disabled={isSaving}
              className={`inline-flex items-center px-6 py-3 border text-base font-semibold rounded-lg transition-colors ${
                isSaving 
                  ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'border-green-600 text-green-600 bg-white hover:bg-green-50'
              }`}
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Save & Apply to Students
            </button>
            <button
              onClick={onPublish}
              disabled={isSaving}
              className={`inline-flex items-center px-6 py-3 border text-base font-semibold rounded-lg transition-colors ${
                isSaving 
                  ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Save as Draft
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Choose how you want to save this fee template
          </p>
        </div>
      </div>
    </div>
  );
}
