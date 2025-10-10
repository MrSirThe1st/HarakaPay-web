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
  
  // Calculate base amounts (without interest)
  const baseTotalAmount = wizardData.selectedCategories.reduce((sum, cat) => sum + (cat.amount || 0), 0);
  
  // Calculate total amount including interest from installments
  const calculateTotalWithInterest = () => {
    let tuitionTotal = 0;
    let additionalTotal = 0;
    
    // Calculate tuition total with interest
    if (wizardData.paymentSchedule.installments.length > 0) {
      tuitionTotal = wizardData.paymentSchedule.installments.reduce((sum, installment) => {
        return sum + installment.amount;
      }, 0);
    } else {
      // If no installments, use base amount for tuition categories
      tuitionTotal = wizardData.selectedCategories
        .filter(cat => cat.categoryType === 'tuition')
        .reduce((sum, cat) => sum + (cat.amount || 0), 0);
    }
    
    // Calculate additional fees total with interest
    if (wizardData.additionalPaymentSchedule && wizardData.additionalPaymentSchedule.installments.length > 0) {
      additionalTotal = wizardData.additionalPaymentSchedule.installments.reduce((sum, installment) => {
        return sum + installment.amount;
      }, 0);
    } else {
      // If no installments, use base amount for additional categories
      additionalTotal = wizardData.selectedCategories
        .filter(cat => cat.categoryType === 'additional')
        .reduce((sum, cat) => sum + (cat.amount || 0), 0);
    }
    
    return tuitionTotal + additionalTotal;
  };
  
  const totalAmount = calculateTotalWithInterest();
  const interestAmount = totalAmount - baseTotalAmount;
  
  // Separate totals for display
  const tuitionBaseTotal = wizardData.selectedCategories
    .filter(cat => cat.categoryType === 'tuition')
    .reduce((sum, cat) => sum + (cat.amount || 0), 0);
  const additionalBaseTotal = wizardData.selectedCategories
    .filter(cat => cat.categoryType === 'additional')
    .reduce((sum, cat) => sum + (cat.amount || 0), 0);
  
  const tuitionTotalWithInterest = wizardData.paymentSchedule.installments.length > 0 
    ? wizardData.paymentSchedule.installments.reduce((sum, installment) => sum + installment.amount, 0)
    : tuitionBaseTotal;
  const additionalTotalWithInterest = wizardData.additionalPaymentSchedule && wizardData.additionalPaymentSchedule.installments.length > 0
    ? wizardData.additionalPaymentSchedule.installments.reduce((sum, installment) => sum + installment.amount, 0)
    : additionalBaseTotal;

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
                <p className="text-lg font-semibold text-gray-900">${totalAmount.toLocaleString()}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Tuition: ${tuitionTotalWithInterest.toLocaleString()}</div>
                  <div>Additional: ${additionalTotalWithInterest.toLocaleString()}</div>
                </div>
                {interestAmount > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Base: ${baseTotalAmount.toLocaleString()} + Interest: ${interestAmount.toLocaleString()}
                  </p>
                )}
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
                      {category.supportsRecurring && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Recurring
                        </span>
                      )}
                      {category.supportsOneTime && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          One-time
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Schedule */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h4>
            
            {/* Tuition Fees Schedule */}
            {tuitionBaseTotal > 0 && (
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-green-900">Tuition Fees Schedule</h5>
                  <p className="text-sm font-medium text-green-900 capitalize">{wizardData.paymentSchedule.scheduleType.replace('-', ' ')}</p>
                </div>
                {wizardData.paymentSchedule.discountPercentage && (
                  <p className="text-xs text-green-600 mb-2">Discount: {wizardData.paymentSchedule.discountPercentage}%</p>
                )}
                <div className="text-xs text-green-600 mb-3">
                  Total: ${tuitionTotalWithInterest.toLocaleString()}
                  {tuitionTotalWithInterest !== tuitionBaseTotal && (
                    <span className="text-orange-600 ml-2">
                      (Base: ${tuitionBaseTotal.toLocaleString()} + Interest: ${(tuitionTotalWithInterest - tuitionBaseTotal).toLocaleString()})
                    </span>
                  )}
                </div>
                
                {/* Tuition Installment Details */}
                {wizardData.paymentSchedule.installments.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-xs font-semibold text-green-700 mb-2">Tuition Installments:</h6>
                    <div className="space-y-1">
                      {wizardData.paymentSchedule.installments.map((installment, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-green-600">
                            Installment {installment.installmentNumber}
                            {installment.percentage > 0 && (
                              <span className="text-orange-600 ml-1">(+{installment.percentage}%)</span>
                            )}
                          </span>
                          <span className="font-medium text-green-900">${installment.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Additional Fees Schedule */}
            {additionalBaseTotal > 0 && wizardData.additionalPaymentSchedule && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-purple-900">Additional Fees Schedule</h5>
                  <p className="text-sm font-medium text-purple-900 capitalize">{wizardData.additionalPaymentSchedule.scheduleType.replace('-', ' ')}</p>
                </div>
                {wizardData.additionalPaymentSchedule.discountPercentage && (
                  <p className="text-xs text-purple-600 mb-2">Discount: {wizardData.additionalPaymentSchedule.discountPercentage}%</p>
                )}
                <div className="text-xs text-purple-600 mb-3">
                  Total: ${additionalTotalWithInterest.toLocaleString()}
                  {additionalTotalWithInterest !== additionalBaseTotal && (
                    <span className="text-orange-600 ml-2">
                      (Base: ${additionalBaseTotal.toLocaleString()} + Interest: ${(additionalTotalWithInterest - additionalBaseTotal).toLocaleString()})
                    </span>
                  )}
                </div>
                
                {/* Additional Installment Details */}
                {wizardData.additionalPaymentSchedule.installments.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-xs font-semibold text-purple-700 mb-2">Additional Fees Installments:</h6>
                    <div className="space-y-1">
                      {wizardData.additionalPaymentSchedule.installments.map((installment, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-purple-600">
                            Installment {installment.installmentNumber}
                            {installment.percentage > 0 && (
                              <span className="text-orange-600 ml-1">(+{installment.percentage}%)</span>
                            )}
                          </span>
                          <span className="font-medium text-purple-900">${installment.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Publish Button */}
        <div className="text-center pt-6">
          <button
            onClick={onPublish}
            disabled={isSaving}
            className={`inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white transition-colors shadow-lg ${
              isSaving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Publishing...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-6 w-6 mr-3" />
                Publish Fee Structure
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Publish this fee structure to make it available for student assignments
          </p>
        </div>
      </div>
    </div>
  );
}
