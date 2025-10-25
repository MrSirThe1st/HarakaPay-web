// src/app/(dashboard)/school/fees/components/wizard-steps/DefinePaymentPlansStep.tsx
"use client";

import React, { useState } from 'react';
import { PlusIcon, TrashIcon, CreditCardIcon, CalendarIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InstallmentManager } from './components/InstallmentManager';
import { useTranslation } from '@/hooks/useTranslation';

interface PaymentPlan {
  type: 'monthly' | 'termly' | 'one_time' | 'installment';
  discountPercentage: number;
  installments: {
    label: string;
    amount: number;
    dueDate: string;
  }[];
}

interface DefinePaymentPlansStepProps {
  paymentPlans: PaymentPlan[];
  feeItems: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    isMandatory: boolean;
    paymentModes: Array<'installment' | 'one_time' | 'termly' | 'monthly'>;
  }>;
  academicYear: string;
  onChange: (paymentPlans: PaymentPlan[]) => void;
}

const PLAN_TYPES = [
  {
    value: 'monthly',
    label: 'Monthly',
    description: '12 equal monthly payments',
    icon: '📅',
    color: 'blue'
  },
  {
    value: 'termly',
    label: 'Termly',
    description: 'Payments per academic term',
    icon: '📚',
    color: 'green'
  },
  {
    value: 'one_time',
    label: 'One-time',
    description: 'Single payment upfront',
    icon: '💰',
    color: 'purple'
  },
  {
    value: 'installment',
    label: 'Custom Installment',
    description: 'Define your own schedule',
    icon: '⚙️',
    color: 'gray'
  }
];

export function DefinePaymentPlansStep({ paymentPlans, feeItems, academicYear, onChange }: DefinePaymentPlansStepProps) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'monthly' as PaymentPlan['type'],
    discountPercentage: 0,
    installments: [] as PaymentPlan['installments']
  });

  const totalFeeAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

  const resetForm = () => {
    setFormData({
      type: 'monthly',
      discountPercentage: 0,
      installments: []
    });
    setShowAddForm(false);
    setEditingIndex(null);
  };

  const generateInstallments = (type: PaymentPlan['type'], baseAmount: number) => {
    const discountedAmount = baseAmount * (1 - formData.discountPercentage / 100);
    let installments: PaymentPlan['installments'] = [];

    switch (type) {
      case 'monthly':
        const monthlyAmount = discountedAmount / 12;
        installments = Array.from({ length: 12 }, (_, i) => {
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          return {
            label: monthNames[i],
            amount: Math.round(monthlyAmount * 100) / 100,
            dueDate: `${academicYear.split('-')[0]}-${String(i + 1).padStart(2, '0')}-15`
          };
        });
        break;
      
      case 'termly':
        // Default to 3 trimesters for Congo
        const termAmount = discountedAmount / 3;
        installments = [
          {
            label: 'Term 1',
            amount: Math.round(termAmount * 100) / 100,
            dueDate: `${academicYear.split('-')[0]}-09-15`
          },
          {
            label: 'Term 2',
            amount: Math.round(termAmount * 100) / 100,
            dueDate: `${academicYear.split('-')[0]}-01-15`
          },
          {
            label: 'Term 3',
            amount: Math.round(termAmount * 100) / 100,
            dueDate: `${academicYear.split('-')[0]}-05-15`
          }
        ];
        break;
      
      case 'one_time':
        installments = [{
          label: 'Full Payment',
          amount: Math.round(discountedAmount * 100) / 100,
          dueDate: `${academicYear.split('-')[0]}-08-01`
        }];
        break;
      
      case 'installment':
        // Start with 2 installments for custom
        installments = [
          {
            label: 'Installment 1',
            amount: Math.round(discountedAmount / 2 * 100) / 100,
            dueDate: `${academicYear.split('-')[0]}-09-01`
          },
          {
            label: 'Installment 2',
            amount: Math.round(discountedAmount / 2 * 100) / 100,
            dueDate: `${academicYear.split('-')[0]}-01-01`
          }
        ];
        break;
    }

    return installments;
  };

  const handlePlanTypeChange = (type: PaymentPlan['type']) => {
    const installments = generateInstallments(type, totalFeeAmount);
    setFormData(prev => ({
      ...prev,
      type,
      installments
    }));
  };

  const handleAddPlan = () => {
    if (formData.installments.length === 0) {
      return;
    }

    const newPlan: PaymentPlan = {
      type: formData.type,
      discountPercentage: formData.discountPercentage,
      installments: formData.installments
    };

    if (editingIndex !== null) {
      // Edit existing plan
      const updatedPlans = [...paymentPlans];
      updatedPlans[editingIndex] = newPlan;
      onChange(updatedPlans);
    } else {
      // Add new plan
      onChange([...paymentPlans, newPlan]);
    }

    resetForm();
  };

  const handleEditPlan = (index: number) => {
    const plan = paymentPlans[index];
    setFormData({
      type: plan.type,
      discountPercentage: plan.discountPercentage,
      installments: plan.installments
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleRemovePlan = (index: number) => {
    const updatedPlans = paymentPlans.filter((_, i) => i !== index);
    onChange(updatedPlans);
  };

  const handleInstallmentsChange = (installments: PaymentPlan['installments']) => {
    setFormData(prev => ({ ...prev, installments }));
  };

  const getPlanTypeInfo = (type: PaymentPlan['type']) => {
    return PLAN_TYPES.find(p => p.value === type) || PLAN_TYPES[0];
  };

  const calculatePlanTotal = (plan: PaymentPlan) => {
    return plan.installments.reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getTotalWithDiscount = (plan: PaymentPlan) => {
    const baseTotal = calculatePlanTotal(plan);
    return baseTotal / (1 - plan.discountPercentage / 100);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t('Payment Plans Configuration')}</h3>
          <p className="text-gray-600">{t('Define how parents can pay the fees - create multiple payment options')}</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              {t('You can create multiple payment plans (e.g., both monthly and one-time options). Parents will choose their preferred payment method.')}
            </p>
          </div>
        </div>

        {/* Total Amount Display */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-green-900">{t('Base Fee Total')}</h4>
              <p className="text-sm text-green-700">{t('Total amount from all fee items')}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-900">
                ${totalFeeAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Add Payment Plan Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="h-6 w-6 mr-3" />
            {t('Add Payment Plan')}
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-900">
                {editingIndex !== null ? t('Edit Payment Plan') : t('Add New Payment Plan')}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">{t('Plan Type')} *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PLAN_TYPES.map((planType) => (
                    <button
                      key={planType.value}
                      type="button"
                      onClick={() => handlePlanTypeChange(planType.value as PaymentPlan['type'])}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.type === planType.value
                          ? `border-${planType.color}-500 bg-${planType.color}-50`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{planType.icon}</span>
                        <span className="font-medium text-gray-900">{planType.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{planType.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Percentage */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">{t('Discount Percentage')}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
                    className="h-12 pr-8"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                {formData.discountPercentage > 0 && (
                  <div className="text-sm text-green-600">
                    {t('Discount amount')}: ${(totalFeeAmount * formData.discountPercentage / 100).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Installments Section */}
            <div className="mt-6">
              <Label className="text-sm font-semibold text-gray-900 mb-4 block">
                {t('Payment Installments')}
              </Label>
              <InstallmentManager
                installments={formData.installments.map((inst, index) => ({
                  installmentNumber: index + 1,
                  amount: inst.amount,
                  dueDate: inst.dueDate,
                  percentage: 0,
                  termId: ''
                }))}
                scheduleType={formData.type}
                totalAmount={totalFeeAmount * (1 - formData.discountPercentage / 100)}
                type="tuition"
                onInstallmentsChange={(installments) => {
                  const newInstallments = installments.map(inst => ({
                    label: inst.termId || `Installment ${inst.installmentNumber}`,
                    amount: inst.amount,
                    dueDate: inst.dueDate
                  }));
                  handleInstallmentsChange(newInstallments);
                }}
                onAddInstallment={() => {
                  const newInstallment = {
                    label: `Installment ${formData.installments.length + 1}`,
                    amount: 0,
                    dueDate: `${academicYear.split('-')[0]}-12-31`
                  };
                  handleInstallmentsChange([...formData.installments, newInstallment]);
                }}
                onRemoveInstallment={(index) => {
                  const updatedInstallments = formData.installments.filter((_, i) => i !== index);
                  handleInstallmentsChange(updatedInstallments);
                }}
                onUpdateInstallment={(index, field, value) => {
                  const updatedInstallments = formData.installments.map((inst, i) => 
                    i === index ? { ...inst, [field]: value } : inst
                  );
                  handleInstallmentsChange(updatedInstallments);
                }}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={resetForm}
                className="px-6"
              >
                {t('Cancel')}
              </Button>
              <Button
                onClick={handleAddPlan}
                disabled={formData.installments.length === 0}
                className="px-6 bg-purple-600 hover:bg-purple-700"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {editingIndex !== null ? t('Update Plan') : t('Add Plan')}
              </Button>
            </div>
          </div>
        )}

        {/* Payment Plans List */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
            {t('Payment Plans')} ({paymentPlans.length})
          </h4>
          
          {paymentPlans.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 font-medium">{t('No payment plans created yet')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('Click "Add Payment Plan" above to get started')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {paymentPlans.map((plan, index) => {
                const planTypeInfo = getPlanTypeInfo(plan.type);
                const planTotal = calculatePlanTotal(plan);
                const baseTotal = getTotalWithDiscount(plan);
                
                return (
                  <div key={`${plan.type}-${index}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    {/* Plan Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{planTypeInfo.icon}</span>
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900">{planTypeInfo.label}</h5>
                          <p className="text-sm text-gray-600">{planTypeInfo.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {plan.discountPercentage > 0 && (
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                            {t('Discount')}: {plan.discountPercentage}%
                          </span>
                        )}
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            ${planTotal.toLocaleString()}
                          </div>
                          {plan.discountPercentage > 0 && (
                            <div className="text-sm text-gray-500 line-through">
                              ${baseTotal.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePlan(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Installments Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 font-medium text-gray-900">{t('Installment')}</th>
                            <th className="text-right py-2 font-medium text-gray-900">{t('Amount')}</th>
                            <th className="text-right py-2 font-medium text-gray-900">{t('Due Date')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.installments.map((installment, instIndex) => (
                            <tr key={instIndex} className="border-b border-gray-100">
                              <td className="py-2 text-gray-900">{installment.label}</td>
                              <td className="py-2 text-right font-medium text-gray-900">
                                ${installment.amount.toLocaleString()}
                              </td>
                              <td className="py-2 text-right text-gray-600">
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
          )}
        </div>

        {/* Summary */}
        {paymentPlans.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{t('Payment Plans Summary')}</h4>
                <p className="text-sm text-gray-600">{t('Parents can choose from these payment options')}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {paymentPlans.length} {t('plan(s)')}
                </div>
                <div className="text-sm text-gray-600">
                  {t('Total payment options')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
