// src/app/(dashboard)/school/fees/components/wizard-steps/FeeItemsStep.tsx
"use client";

import React, { useState } from 'react';
import { PlusIcon, TrashIcon, ClipboardDocumentListIcon, CurrencyDollarIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';

interface FeeItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  isMandatory: boolean;
  paymentModes: Array<'installment' | 'one_time' | 'termly' | 'monthly'>;
  paymentPlans: {
    type: 'monthly' | 'termly' | 'one_time' | 'installment';
    discountPercentage: number;
    installments: {
      label: string;
      amount: number;
      dueDate: string;
    }[];
  }[];
}

interface FeeItemsStepProps {
  feeItems: FeeItem[];
  onChange: (feeItems: FeeItem[]) => void;
}

// Hardcoded fee categories
const FEE_CATEGORIES = [
  {
    id: 'tuition',
    name: 'Tuition',
    description: 'Core academic instruction fees',
    isMandatory: true,
    isRecurring: true,
    defaultPaymentModes: ['installment', 'one_time', 'termly', 'monthly']
  },
  {
    id: 'books',
    name: 'Books & Materials',
    description: 'Textbooks and learning materials',
    isMandatory: false,
    isRecurring: true,
    defaultPaymentModes: ['one_time', 'termly']
  },
  {
    id: 'uniform',
    name: 'Uniform',
    description: 'School uniform and PE kit',
    isMandatory: false,
    isRecurring: false,
    defaultPaymentModes: ['one_time']
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'School bus transportation',
    isMandatory: false,
    isRecurring: true,
    defaultPaymentModes: ['monthly', 'termly']
  },
  {
    id: 'meals',
    name: 'Meals',
    description: 'School meal program',
    isMandatory: false,
    isRecurring: true,
    defaultPaymentModes: ['monthly', 'termly']
  },
  {
    id: 'examination',
    name: 'Examination Fees',
    description: 'Exam registration and materials',
    isMandatory: false,
    isRecurring: false,
    defaultPaymentModes: ['one_time']
  }
];

const PAYMENT_MODE_LABELS = {
  installment: 'Installment',
  one_time: 'One-time',
  termly: 'Termly',
  monthly: 'Monthly'
};

export function FeeItemsStep({ feeItems, onChange }: FeeItemsStepProps) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: 0,
    isMandatory: false,
    paymentModes: [] as Array<'installment' | 'one_time' | 'termly' | 'monthly'>
  });

  const selectedCategory = FEE_CATEGORIES.find(cat => cat.id === formData.categoryId);

  const resetForm = () => {
    setFormData({
      categoryId: '',
      amount: 0,
      isMandatory: false,
      paymentModes: []
    });
    setShowAddForm(false);
    setEditingIndex(null);
  };

  const handleAddItem = () => {
    if (!formData.categoryId || formData.amount <= 0 || formData.paymentModes.length === 0) {
      return;
    }

    const category = FEE_CATEGORIES.find(cat => cat.id === formData.categoryId);
    if (!category) return;

    const newItem: FeeItem = {
      categoryId: formData.categoryId,
      categoryName: category.name,
      amount: formData.amount,
      isMandatory: formData.isMandatory,
      isRecurring: formData.paymentModes.includes('one_time') ? false : true, // Auto-determine from payment modes
      paymentModes: formData.paymentModes,
      paymentPlans: [] // Initialize empty payment plans array
    };

    if (editingIndex !== null) {
      // Edit existing item
      const updatedItems = [...feeItems];
      updatedItems[editingIndex] = newItem;
      onChange(updatedItems);
    } else {
      // Add new item
      onChange([...feeItems, newItem]);
    }

    resetForm();
  };

  const handleEditItem = (index: number) => {
    const item = feeItems[index];
    setFormData({
      categoryId: item.categoryId,
      amount: item.amount,
      isMandatory: item.isMandatory,
      paymentModes: item.paymentModes
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = feeItems.filter((_, i) => i !== index);
    onChange(updatedItems);
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = FEE_CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      setFormData(prev => ({
        ...prev,
        categoryId,
        isMandatory: category.isMandatory,
        paymentModes: category.defaultPaymentModes
      }));
    }
  };

  const handlePaymentModeToggle = (mode: 'installment' | 'one_time' | 'termly' | 'monthly') => {
    setFormData(prev => ({
      ...prev,
      paymentModes: prev.paymentModes.includes(mode)
        ? prev.paymentModes.filter(m => m !== mode)
        : [...prev.paymentModes, mode]
    }));
  };

  const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);
  const mandatoryTotal = feeItems.filter(item => item.isMandatory).reduce((sum, item) => sum + item.amount, 0);
  const optionalTotal = feeItems.filter(item => !item.isMandatory).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t('Fee Items Configuration')}</h3>
          <p className="text-gray-600">{t('Add and configure individual fee components for this structure')}</p>
        </div>

        {/* Add Fee Item Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="h-6 w-6 mr-3" />
            {t('Add Fee Item')}
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-900">
                {editingIndex !== null ? t('Edit Fee Item') : t('Add New Fee Item')}
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
              {/* Category Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">{t('Fee Category')} *</Label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">{t('Select a category')}</option>
                  {FEE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <p className="text-sm text-gray-600">{selectedCategory.description}</p>
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">{t('Amount')} *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="h-12 pl-10 pr-4"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Mandatory Toggle */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">{t('Payment Requirement')}</Label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isMandatory: true }))}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                      formData.isMandatory 
                        ? 'bg-red-100 text-red-800 border-red-300' 
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-red-50'
                    }`}
                  >
                    {t('Mandatory')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isMandatory: false }))}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                      !formData.isMandatory 
                        ? 'bg-blue-100 text-blue-800 border-blue-300' 
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    {t('Optional')}
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Modes */}
            <div className="mt-6 space-y-3">
              <Label className="text-sm font-semibold text-gray-900">{t('Supported Payment Modes')} *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(PAYMENT_MODE_LABELS).map(([mode, label]) => (
                  <label
                    key={mode}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.paymentModes.includes(mode as any)}
                      onChange={() => handlePaymentModeToggle(mode as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </label>
                ))}
              </div>
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
                onClick={handleAddItem}
                disabled={!formData.categoryId || formData.amount <= 0 || formData.paymentModes.length === 0}
                className="px-6 bg-green-600 hover:bg-green-700"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {editingIndex !== null ? t('Update Item') : t('Add Item')}
              </Button>
            </div>
          </div>
        )}

        {/* Fee Items List */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-gray-600" />
            {t('Fee Items')} ({feeItems.length})
          </h4>
          
          {feeItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 font-medium">{t('No fee items added yet')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('Click "Add Fee Item" above to get started')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feeItems.map((item, index) => (
                <div key={`${item.categoryId}-${index}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  {/* Item Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h5 className="text-lg font-semibold text-gray-900">{item.categoryName}</h5>
                      <div className="flex space-x-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          item.isMandatory ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.isMandatory ? t('Mandatory') : t('Optional')}
                        </span>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          item.isRecurring ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.isRecurring ? t('Recurring') : t('One-time')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${item.amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Modes */}
                  <div className="flex flex-wrap gap-2">
                    {item.paymentModes.map((mode) => (
                      <span
                        key={mode}
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                      >
                        {PAYMENT_MODE_LABELS[mode]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Section */}
        {feeItems.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Mandatory vs Optional Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mandatoryTotal > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-red-900">{t('Mandatory Fees')}</h3>
                      <p className="text-xs text-red-700">{t('Required payments')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-900">
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
                      <h3 className="text-sm font-semibold text-blue-900">{t('Optional Fees')}</h3>
                      <p className="text-xs text-blue-700">{t('Additional services')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-900">
                        ${optionalTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grand Total */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">{t('Total Amount')}</h3>
                    <p className="text-sm text-green-700">{t('All fees combined')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-900">
                      ${totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
