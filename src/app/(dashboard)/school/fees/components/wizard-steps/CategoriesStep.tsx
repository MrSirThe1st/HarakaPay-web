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
    isRecurring: boolean;
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
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Books & Materials',
    description: 'Textbooks and learning materials',
    isMandatory: true,
    isRecurring: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Uniform',
    description: 'School uniform and PE kit',
    isMandatory: false,
    isRecurring: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '4',
    name: 'Transport',
    description: 'School bus transportation',
    isMandatory: false,
    isRecurring: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    name: 'Meals',
    description: 'School meal program',
    isMandatory: false,
    isRecurring: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '6',
    name: 'Examination Fees',
    description: 'Exam registration and materials',
    isMandatory: false,
    isRecurring: false,
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
      isRecurring: false
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
      isRecurring: category.isRecurring
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
          <h4 className="text-lg font-semibold text-gray-900">Predefined Categories</h4>
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
                          category.isMandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.isMandatory ? 'Mandatory' : 'Optional'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.isRecurring ? 'Recurring' : 'One-time'}
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
            <div className="space-y-3">
              {selectedCategories.map((category) => (
                <div key={category.categoryId} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${category.isMandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {category.isMandatory ? 'Mandatory' : 'Optional'}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${category.isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {category.isRecurring ? 'Recurring' : 'One-time'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{category.categoryName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeCategory(category.categoryId)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
