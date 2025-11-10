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

interface FeeItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  isMandatory: boolean;
  paymentModes: Array<'installment' | 'one_time' | 'termly' | 'monthly'>;
  paymentPlans: PaymentPlan[];
}

interface DefinePaymentPlansStepProps {
  paymentPlans: PaymentPlan[]; // Deprecated - keeping for compatibility
  feeItems: FeeItem[];
  academicYear: string;
  onChange: (paymentPlans: PaymentPlan[]) => void; // Deprecated
  onFeeItemsChange?: (feeItems: FeeItem[]) => void;
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

export function DefinePaymentPlansStep({ paymentPlans, feeItems, academicYear, onChange, onFeeItemsChange }: DefinePaymentPlansStepProps) {
  const { t } = useTranslation();
  const [selectedFeeItemIndex, setSelectedFeeItemIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'monthly' as PaymentPlan['type'],
    discountPercentage: 0,
    installments: [] as PaymentPlan['installments']
  });
  const [discountInput, setDiscountInput] = useState<string>('0');

  const selectedFeeItem = selectedFeeItemIndex !== null ? feeItems[selectedFeeItemIndex] : null;

  const resetForm = () => {
    setFormData({
      type: 'monthly',
      discountPercentage: 0,
      installments: []
    });
    setDiscountInput('0');
    setShowAddForm(false);
    setEditingPlanIndex(null);
  };

  const generateInstallments = (type: PaymentPlan['type'], baseAmount: number, discountPercentage: number = 0) => {
    const discountedAmount = baseAmount * (1 - discountPercentage / 100);
    let installments: PaymentPlan['installments'] = [];

    console.log('💰 Generating installments:', { type, baseAmount, discountPercentage, discountedAmount });

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
    if (!selectedFeeItem) return;
    console.log('📋 Changing plan type to:', type);
    const installments = generateInstallments(type, selectedFeeItem.amount, formData.discountPercentage);
    setFormData(prev => ({
      ...prev,
      type,
      installments
    }));
  };

  const handleAddPlan = () => {
    console.log('➕ Adding plan:', { selectedFeeItem, selectedFeeItemIndex, formData });

    if (!selectedFeeItem || selectedFeeItemIndex === null || formData.installments.length === 0) {
      console.error('❌ Cannot add plan - missing data:', {
        hasSelectedFeeItem: !!selectedFeeItem,
        selectedFeeItemIndex,
        installmentsLength: formData.installments.length
      });
      alert('Please ensure all required fields are filled and plan type is selected');
      return;
    }

    const newPlan: PaymentPlan = {
      type: formData.type,
      discountPercentage: formData.discountPercentage,
      installments: formData.installments
    };

    const updatedFeeItems = [...feeItems];
    const updatedPaymentPlans = [...(updatedFeeItems[selectedFeeItemIndex].paymentPlans || [])];

    if (editingPlanIndex !== null) {
      // Edit existing plan
      console.log('✏️ Editing plan at index:', editingPlanIndex);
      updatedPaymentPlans[editingPlanIndex] = newPlan;
    } else {
      // Add new plan
      console.log('✨ Adding new plan');
      updatedPaymentPlans.push(newPlan);
    }

    updatedFeeItems[selectedFeeItemIndex].paymentPlans = updatedPaymentPlans;

    console.log('💾 Saving updated fee items:', updatedFeeItems);

    if (onFeeItemsChange) {
      onFeeItemsChange(updatedFeeItems);
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleEditPlan = (feeItemIndex: number, planIndex: number) => {
    const plan = feeItems[feeItemIndex].paymentPlans?.[planIndex];
    if (!plan) return;
    setFormData({
      type: plan.type,
      discountPercentage: plan.discountPercentage,
      installments: plan.installments
    });
    setDiscountInput(plan.discountPercentage.toString());
    setSelectedFeeItemIndex(feeItemIndex);
    setEditingPlanIndex(planIndex);
    setShowAddForm(true);
  };

  const handleRemovePlan = (feeItemIndex: number, planIndex: number) => {
    const updatedFeeItems = [...feeItems];
    updatedFeeItems[feeItemIndex].paymentPlans = (updatedFeeItems[feeItemIndex].paymentPlans || []).filter((_, i) => i !== planIndex);

    if (onFeeItemsChange) {
      onFeeItemsChange(updatedFeeItems);
    }
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

  const getTotalPlansCount = () => {
    return feeItems.reduce((sum, item) => sum + (item.paymentPlans?.length || 0), 0);
  };

  const handleSelectFeeItem = (index: number) => {
    console.log('🎯 Selecting fee item at index:', index, feeItems[index]);
    setSelectedFeeItemIndex(index);
    setShowAddForm(true);

    // Generate initial installments for monthly plan
    const feeItem = feeItems[index];
    const initialInstallments = generateInstallments('monthly', feeItem.amount);

    setFormData({
      type: 'monthly',
      discountPercentage: 0,
      installments: initialInstallments
    });
    setDiscountInput('0');
  };

  return (
    <div className="space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t('Payment Plans Configuration')}</h3>
          <p className="text-gray-600">{t('Define payment plans for each fee item separately')}</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              {t('Each fee item (Tuition, Transport, etc.) can have its own payment plans. Parents will choose their preferred payment method for each item.')}
            </p>
          </div>
        </div>

        {/* Fee Items - Select to Add Plans */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('Select Fee Item to Add Payment Plans')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeItems.map((item, index) => (
              <div
                key={`${item.categoryId}-${index}`}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSelectFeeItem(index)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900">{item.categoryName}</h5>
                    <p className="text-sm text-gray-600">
                      {item.paymentPlans?.length || 0} {t('payment plan(s)')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${item.amount.toLocaleString()}
                    </div>
                    <Button
                      size="sm"
                      className="mt-2 bg-green-600 hover:bg-green-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      {t('Add Plan')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && selectedFeeItem && (
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-900">
                {editingPlanIndex !== null ? t('Edit Payment Plan for') : t('Add Payment Plan for')} <span className="text-green-600">{selectedFeeItem.categoryName}</span>
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

            {/* Fee Item Amount Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-green-900">{t('Base Amount')}</h5>
                  <p className="text-xs text-green-700">{selectedFeeItem.categoryName}</p>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  ${selectedFeeItem.amount.toLocaleString()}
                </div>
              </div>
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
                    type="text"
                    inputMode="decimal"
                    value={discountInput}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Allow empty string or valid numbers
                      if (value === '' || value === '-') {
                        setDiscountInput(value);
                        setFormData(prev => ({ ...prev, discountPercentage: 0 }));
                        return;
                      }

                      // Only allow numbers and one decimal point
                      if (!/^\d*\.?\d*$/.test(value)) {
                        return;
                      }

                      setDiscountInput(value);

                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                        console.log('💸 Discount changed to:', numValue);
                        // Regenerate installments with new discount
                        const installments = generateInstallments(formData.type, selectedFeeItem.amount, numValue);
                        setFormData({
                          ...formData,
                          discountPercentage: numValue,
                          installments
                        });
                      }
                    }}
                    onBlur={() => {
                      // On blur, ensure we have a valid number
                      const numValue = parseFloat(discountInput);
                      if (isNaN(numValue) || discountInput === '') {
                        setDiscountInput('0');
                        const installments = generateInstallments(formData.type, selectedFeeItem.amount, 0);
                        setFormData({
                          ...formData,
                          discountPercentage: 0,
                          installments
                        });
                      } else {
                        // Format the number properly
                        setDiscountInput(numValue.toString());
                      }
                    }}
                    className="h-12 pr-8"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                {formData.discountPercentage > 0 && (
                  <div className="text-sm text-green-600">
                    {t('Discount amount')}: ${(selectedFeeItem.amount * formData.discountPercentage / 100).toLocaleString()}
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
                totalAmount={selectedFeeItem.amount * (1 - formData.discountPercentage / 100)}
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
                {editingPlanIndex !== null ? t('Update Plan') : t('Add Plan')}
              </Button>
            </div>
          </div>
        )}

        {/* Payment Plans List - Grouped by Fee Item */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
            {t('Payment Plans')} ({getTotalPlansCount()})
          </h4>

          {getTotalPlansCount() === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 font-medium">{t('No payment plans created yet')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('Click on a fee item above to add payment plans')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feeItems.map((feeItem, feeItemIndex) => (
                feeItem.paymentPlans && feeItem.paymentPlans.length > 0 && (
                  <div key={`${feeItem.categoryId}-${feeItemIndex}`} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    {/* Fee Item Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
                      <div>
                        <h5 className="text-xl font-bold text-gray-900">{feeItem.categoryName}</h5>
                        <p className="text-sm text-gray-600">{feeItem.paymentPlans?.length || 0} {t('payment plan(s)')}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${feeItem.amount.toLocaleString()}</div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectFeeItem(feeItemIndex)}
                          className="mt-2 bg-green-600 hover:bg-green-700"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          {t('Add Plan')}
                        </Button>
                      </div>
                    </div>

                    {/* Plans for this Fee Item */}
                    <div className="space-y-4">
                      {(feeItem.paymentPlans || []).map((plan, planIndex) => {
                        const planTypeInfo = getPlanTypeInfo(plan.type);
                        const planTotal = calculatePlanTotal(plan);
                        const baseTotal = getTotalWithDiscount(plan);

                        return (
                          <div key={`plan-${planIndex}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            {/* Plan Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{planTypeInfo.icon}</span>
                                <div>
                                  <h6 className="text-lg font-semibold text-gray-900">{planTypeInfo.label}</h6>
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
                                    onClick={() => handleEditPlan(feeItemIndex, planIndex)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemovePlan(feeItemIndex, planIndex)}
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
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {getTotalPlansCount() > 0 && (
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{t('Payment Plans Summary')}</h4>
                <p className="text-sm text-gray-600">{t('Total payment plans across all fee items')}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {getTotalPlansCount()} {t('plan(s)')}
                </div>
                <div className="text-sm text-gray-600">
                  {feeItems.filter(item => item.paymentPlans && item.paymentPlans.length > 0).length} {t('fee item(s) configured')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
