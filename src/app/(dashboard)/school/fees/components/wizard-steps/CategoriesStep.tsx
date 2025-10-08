// src/app/(dashboard)/school/fees/components/wizard-steps/CategoriesStep.tsx
"use client";

import React, { useState } from 'react';
import { PlusIcon, TrashIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { FeeCategory } from '../../types/feeTypes';

interface CategoriesStepProps {
  selectedCategories: {
    categoryId: string;
    categoryName: string;
    amount: number;
    isMandatory: boolean;
    supportsRecurring: boolean;
    supportsOneTime: boolean;
    categoryType: 'tuition' | 'additional';
  }[];
  onChange: (categories: any[]) => void;
}

// Predefined categories
const availableCategories: FeeCategory[] = [
  {
    id: '1',
    name: 'Tuition',
    description: 'Core academic instruction fees',
    isMandatory: true,
    isRecurring: true,
    supportsOneTime: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Books & Materials',
    description: 'Textbooks and learning materials',
    isMandatory: true,
    isRecurring: true,
    supportsOneTime: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Uniform',
    description: 'School uniform and PE kit',
    isMandatory: false,
    isRecurring: false,
    supportsOneTime: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '4',
    name: 'Transport',
    description: 'School bus transportation',
    isMandatory: false,
    isRecurring: true,
    supportsOneTime: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    name: 'Meals',
    description: 'School meal program',
    isMandatory: false,
    isRecurring: true,
    supportsOneTime: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '6',
    name: 'Examination Fees',
    description: 'Exam registration and materials',
    isMandatory: false,
    isRecurring: false,
    supportsOneTime: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

export function CategoriesStep({ selectedCategories, onChange }: CategoriesStepProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const addCustomCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const customCategory = {
      categoryId: `custom-${Date.now()}`,
      categoryName: newCategoryName,
      amount: 0,
      isMandatory: false,
      supportsRecurring: true,
      supportsOneTime: true,
      categoryType: 'additional' as const
    };
    
    onChange([...selectedCategories, customCategory]);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const addPredefinedCategory = (category: FeeCategory) => {
    // Check if category is already selected
    if (isCategorySelected(category.id)) {
      return;
    }
    
    const categoryData = {
      categoryId: category.id,
      categoryName: category.name,
      amount: 0,
      isMandatory: category.isMandatory,
      supportsRecurring: true, // All categories support both by default
      supportsOneTime: true,    // All categories support both by default
      categoryType: category.name.toLowerCase().includes('tuition') ? 'tuition' as const : 'additional' as const
    };
    
    onChange([...selectedCategories, categoryData]);
  };

  const removeCategory = (categoryId: string) => {
    onChange(selectedCategories.filter(cat => cat.categoryId !== categoryId));
  };

  const isCategorySelected = (categoryId: string) => {
    return selectedCategories.some(cat => cat.categoryId === categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Fee Category Configuration</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Tuition fees</strong> are the main academic fees (can be paid any way: one-time, installments, per semester, etc.)</li>
                  <li><strong>Additional fees</strong> are supplementary fees (uniforms, books, transport, etc.)</li>
                  <li>You can customize payment requirements (mandatory/optional) and frequency options for each category</li>
                  <li>Categories can support multiple payment frequencies simultaneously (both recurring AND one-time)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Add Custom Category */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Category</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Category Name *</label>
              <input
                type="text"
                placeholder="e.g., Sports Equipment, Field Trip"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Description</label>
              <input
                type="text"
                placeholder="Brief description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={addCustomCategory}
              disabled={!newCategoryName.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Custom Category
            </button>
          </div>
        </div>

        {/* Predefined Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Predefined Categories</h4>
            <div className="text-sm text-gray-600">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                Tuition
              </span>
              <span className="text-gray-500">= Main academic fees</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 mr-2">
                Additional
              </span>
              <span className="text-gray-500">= Supplementary fees</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {availableCategories.map((category) => (
              <div key={category.id} className="relative">
                <button
                  onClick={() => addPredefinedCategory(category)}
                  disabled={isCategorySelected(category.id)}
                  className={`w-full p-4 border rounded-xl text-left transition-colors ${
                    isCategorySelected(category.id)
                      ? 'border-green-500 bg-green-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900">{category.name}</h5>
                      <p className="text-xs text-gray-500">{category.description}</p>
                      <div className="flex space-x-2 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.name.toLowerCase().includes('tuition') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {category.name.toLowerCase().includes('tuition') ? 'Tuition' : 'Additional'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.isMandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.isMandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                    </div>
                    {isCategorySelected(category.id) && (
                      <div className="text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Categories */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Selected Categories ({selectedCategories.length})</h4>
          {selectedCategories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 font-medium">No categories selected yet</p>
              <p className="text-sm text-gray-500 mt-1">Select categories above to continue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedCategories.map((category) => (
                <div key={category.categoryId} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h5 className="text-lg font-semibold text-gray-900">{category.categoryName}</h5>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${category.categoryType === 'tuition' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                        {category.categoryType === 'tuition' ? 'Tuition' : 'Additional'}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeCategory(category.categoryId)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Category Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mandatory/Optional Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Payment Requirement</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const updated = selectedCategories.map(cat => 
                              cat.categoryId === category.categoryId 
                                ? { ...cat, isMandatory: true }
                                : cat
                            );
                            onChange(updated);
                          }}
                          className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                            category.isMandatory 
                              ? 'bg-red-100 text-red-800 border-red-300' 
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-red-50'
                          }`}
                        >
                          Mandatory
                        </button>
                        <button
                          onClick={() => {
                            const updated = selectedCategories.map(cat => 
                              cat.categoryId === category.categoryId 
                                ? { ...cat, isMandatory: false }
                                : cat
                            );
                            onChange(updated);
                          }}
                          className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                            !category.isMandatory 
                              ? 'bg-blue-100 text-blue-800 border-blue-300' 
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50'
                          }`}
                        >
                          Optional
                        </button>
                      </div>
                    </div>

                    {/* Payment Frequency Support */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Supported Payment Frequencies</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={category.supportsRecurring}
                            onChange={(e) => {
                              const updated = selectedCategories.map(cat => 
                                cat.categoryId === category.categoryId 
                                  ? { ...cat, supportsRecurring: e.target.checked }
                                  : cat
                              );
                              onChange(updated);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Recurring Payments</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={category.supportsOneTime}
                            onChange={(e) => {
                              const updated = selectedCategories.map(cat => 
                                cat.categoryId === category.categoryId 
                                  ? { ...cat, supportsOneTime: e.target.checked }
                                  : cat
                              );
                              onChange(updated);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">One-time Payments</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Current Settings Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${category.isMandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {category.isMandatory ? 'Mandatory' : 'Optional'}
                      </span>
                      {category.supportsRecurring && (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Supports Recurring
                        </span>
                      )}
                      {category.supportsOneTime && (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Supports One-time
                        </span>
                      )}
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${category.categoryType === 'tuition' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                        {category.categoryType === 'tuition' ? 'Tuition Fee' : 'Additional Fee'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
