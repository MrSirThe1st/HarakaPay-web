// src/app/(dashboard)/school/fees/components/wizard-steps/PublishStep.tsx
"use client";

import React from 'react';
import { CheckCircleIcon, CalendarIcon, ClipboardDocumentListIcon, BuildingOfficeIcon, ReceiptPercentIcon, CreditCardIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { WizardData } from '../../types/feeTypes';
import { useTranslation } from '@/hooks/useTranslation';

interface PublishStepProps {
  wizardData: WizardData;
  onPublish: () => void;
  isSaving?: boolean;
}

export function PublishStep({ wizardData, onPublish, isSaving = false }: PublishStepProps) {
  const { t } = useTranslation();
  
  // Calculate totals
  const totalFeeAmount = wizardData.feeItems.reduce((sum, item) => sum + item.amount, 0);
  const mandatoryTotal = wizardData.feeItems.filter(item => item.isMandatory).reduce((sum, item) => sum + item.amount, 0);
  const optionalTotal = wizardData.feeItems.filter(item => !item.isMandatory).reduce((sum, item) => sum + item.amount, 0);

  // Calculate total payment plans across all fee items
  const getTotalPaymentPlansCount = () => {
    return wizardData.feeItems.reduce((sum, item) => sum + (item.paymentPlans?.length || 0), 0);
  };

  // Calculate payment plan totals
  const calculatePlanTotal = (plan: { installments: Array<{ amount: number }> }) => {
    return plan.installments.reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getTotalWithDiscount = (plan: { installments: Array<{ amount: number }>; discountPercentage: number }) => {
    const planTotal = calculatePlanTotal(plan);
    return planTotal / (1 - plan.discountPercentage / 100);
  };

  const formatGradeLevel = () => {
    if (wizardData.academicContext.appliesTo === 'school') {
      return 'All Grades';
    }
    if (Array.isArray(wizardData.academicContext.gradeLevel)) {
      return wizardData.academicContext.gradeLevel.join(', ');
    }
    return wizardData.academicContext.gradeLevel;
  };

  return (
    <div className="space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Summary Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">{t('Review & Finalize')}</h3>
          <p className="text-lg text-gray-600">{t('Please review all details before finalizing your fee structure')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Academic Context */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">{t('Academic Year')}</h4>
                <p className="text-lg font-semibold text-gray-900">{wizardData.academicContext.academicYear}</p>
                <p className="text-xs text-gray-500">{formatGradeLevel()}</p>
              </div>
            </div>
          </div>

          {/* Structure Name */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">{t('Structure Name')}</h4>
                <p className="text-lg font-semibold text-gray-900 truncate">{wizardData.academicContext.structureName}</p>
                <p className="text-xs text-gray-500">{t('Fee Structure')}</p>
              </div>
            </div>
          </div>

          {/* Fee Items */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ReceiptPercentIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">{t('Fee Items')}</h4>
                <p className="text-lg font-semibold text-gray-900">{wizardData.feeItems.length}</p>
                <p className="text-xs text-gray-500">{t('Categories configured')}</p>
              </div>
            </div>
          </div>

          {/* Payment Plans */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">{t('Payment Plans')}</h4>
                <p className="text-lg font-semibold text-gray-900">{getTotalPaymentPlansCount()}</p>
                <p className="text-xs text-gray-500">{t('Payment options')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Summary */}
        <div className="space-y-8">
          {/* Academic Context Card */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BuildingOfficeIcon className="h-6 w-6 mr-3 text-blue-600" />
              {t('Academic Context')}
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{t('Academic Year')}</p>
                <p className="text-lg font-semibold text-gray-900">{wizardData.academicContext.academicYear}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{t('Grade Level')}</p>
                <p className="text-lg font-semibold text-gray-900">{formatGradeLevel()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{t('Applies To')}</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {wizardData.academicContext.appliesTo === 'school' ? t('Entire School') : t('Specific Grades')}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{t('Structure Name')}</p>
                <p className="text-lg font-semibold text-gray-900">{wizardData.academicContext.structureName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{t('Currency')}</p>
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                    {wizardData.academicContext.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Items Table */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ClipboardDocumentListIcon className="h-6 w-6 mr-3 text-green-600" />
              {t('Fee Items')} ({wizardData.feeItems.length})
            </h4>
            
            {wizardData.feeItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('No fee items configured')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('Category')}</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">{t('Amount')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">{t('Mandatory')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">{t('Recurring')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('Payment Modes')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wizardData.feeItems.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.categoryName}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-gray-900">
                            ${item.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            item.isMandatory ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.isMandatory ? t('Yes') : t('No')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            !item.paymentModes.includes('one_time') ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {!item.paymentModes.includes('one_time') ? t('Yes') : t('No')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {item.paymentModes.map((mode) => (
                              <span
                                key={mode}
                                className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                              >
                                {mode.replace('_', '-')}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold">
                      <td className="py-4 px-4 text-lg">{t('Total')}</td>
                      <td className="py-4 px-4 text-right text-lg text-gray-900">
                        ${totalFeeAmount.toLocaleString()}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Fee Breakdown */}
            {wizardData.feeItems.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {mandatoryTotal > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-semibold text-red-900">{t('Mandatory Fees')}</h5>
                        <p className="text-xs text-red-700">{t('Required payments')}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-900">
                          ${mandatoryTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {optionalTotal > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-semibold text-blue-900">{t('Optional Fees')}</h5>
                        <p className="text-xs text-blue-700">{t('Additional services')}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-900">
                          ${optionalTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-semibold text-green-900">{t('Grand Total')}</h5>
                      <p className="text-xs text-green-700">{t('All fees combined')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-900">
                        ${totalFeeAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Plans Section - Grouped by Fee Item */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCardIcon className="h-6 w-6 mr-3 text-purple-600" />
              {t('Payment Plans')} ({getTotalPaymentPlansCount()})
            </h4>

            {getTotalPaymentPlansCount() === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('No payment plans configured')}</p>
            ) : (
              <div className="space-y-8">
                {wizardData.feeItems.map((feeItem, feeItemIndex) => (
                  feeItem.paymentPlans && feeItem.paymentPlans.length > 0 && (
                    <div key={feeItemIndex} className="border-l-4 border-purple-500 pl-6">
                      {/* Fee Item Header */}
                      <div className="mb-4">
                        <h5 className="text-lg font-bold text-gray-900">{feeItem.categoryName}</h5>
                        <p className="text-sm text-gray-600">
                          Base Amount: <span className="font-semibold">${feeItem.amount.toLocaleString()}</span>
                          {' • '}
                          {feeItem.paymentPlans.length} {t('payment plan(s)')}
                        </p>
                      </div>

                      {/* Plans for this Fee Item */}
                      <div className="space-y-4">
                        {feeItem.paymentPlans.map((plan, planIndex) => {
                          const planTotal = calculatePlanTotal(plan);
                          const baseTotal = getTotalWithDiscount(plan);
                          const discountAmount = baseTotal - planTotal;

                          return (
                            <div key={planIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                              {/* Plan Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">
                                    {plan.type === 'monthly' ? '📅' :
                                     plan.type === 'termly' ? '📚' :
                                     plan.type === 'one_time' ? '💰' : '⚙️'}
                                  </span>
                                  <div>
                                    <h6 className="text-lg font-semibold text-gray-900 capitalize">
                                      {plan.type.replace('_', ' ')} {t('Payment Plan')}
                                    </h6>
                                    <p className="text-sm text-gray-600">
                                      {plan.installments.length} {t('installment(s)')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-gray-900">
                                    ${planTotal.toLocaleString()}
                                  </div>
                                  {plan.discountPercentage > 0 && (
                                    <div className="text-sm text-green-600">
                                      {t('Discount')}: {plan.discountPercentage}% (${discountAmount.toLocaleString()})
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Installments Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm bg-white rounded">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 px-3 font-medium text-gray-900">{t('Installment')}</th>
                                      <th className="text-right py-2 px-3 font-medium text-gray-900">{t('Amount')}</th>
                                      <th className="text-right py-2 px-3 font-medium text-gray-900">{t('Due Date')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {plan.installments.map((installment, instIndex) => (
                                      <tr key={instIndex} className="border-b border-gray-100">
                                        <td className="py-2 px-3 text-gray-900">{installment.label}</td>
                                        <td className="py-2 px-3 text-right font-medium text-gray-900">
                                          ${installment.amount.toLocaleString()}
                                        </td>
                                        <td className="py-2 px-3 text-right text-gray-600">
                                          {new Date(installment.dueDate).toLocaleDateString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Final Actions */}
        <div className="text-center pt-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-green-900 mb-2">{t('Ready to Finalize')}</h4>
            <p className="text-sm text-green-700 mb-4">
              {t('This fee structure will be saved as a draft. You can apply it to students later to activate it.')}
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-green-600">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>{t('Structure will be inactive by default')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>{t('Can be applied to students later')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onPublish}
            disabled={isSaving}
            className={`inline-flex items-center px-10 py-4 border border-transparent text-xl font-semibold rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl ${
              isSaving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                {t('Finalizing...')}
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-6 w-6 mr-3" />
                {t('Finalize Fee Structure')}
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            {t('This will create your fee structure and make it available for student assignments')}
          </p>
        </div>
      </div>
    </div>
  );
}
