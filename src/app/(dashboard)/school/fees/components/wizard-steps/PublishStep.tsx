// src/app/(dashboard)/school/fees/components/wizard-steps/PublishStep.tsx
"use client";

import { CheckCircleIcon, BuildingOfficeIcon, CreditCardIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
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
        </div>
      </div>
    </div>
  );
}
