// src/app/(dashboard)/school/store/components/ItemFormModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useStoreAPI } from '@/hooks/useStoreAPI';
import { StoreItem, StoreCategory, StoreItemFormData } from '@/types/store';

interface ItemFormModalProps {
  item?: StoreItem | null;
  categories: StoreCategory[];
  onClose: () => void;
  onSubmit: () => void;
}

export function ItemFormModal({ item, categories, onClose, onSubmit }: ItemFormModalProps) {
  const [formData, setFormData] = useState<StoreItemFormData>({
    name: '',
    description: '',
    categoryId: '',
    itemType: 'sale',
    price: 0,
    stockQuantity: 0,
    lowStockThreshold: 10,
    isAvailable: true,
    images: [],
    hireSettings: {
      durationType: 'daily',
      minDurationDays: 1,
      maxDurationDays: 7,
      depositAmount: null,
      lateFeePerDay: null,
    },
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const storeAPI = useStoreAPI();

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        categoryId: item.categoryId,
        itemType: item.itemType,
        price: item.price,
        stockQuantity: item.stockQuantity,
        lowStockThreshold: item.lowStockThreshold,
        isAvailable: item.isAvailable,
        images: item.images || [],
        hireSettings: item.hireSettings ? {
          durationType: item.hireSettings.durationType,
          minDurationDays: item.hireSettings.minDurationDays,
          maxDurationDays: item.hireSettings.maxDurationDays,
          depositAmount: item.hireSettings.depositAmount,
          lateFeePerDay: item.hireSettings.lateFeePerDay,
        } : {
          durationType: 'daily',
          minDurationDays: 1,
          maxDurationDays: 7,
          depositAmount: null,
          lateFeePerDay: null,
        },
      });
    }
  }, [item]);

  const handleInputChange = (field: string, value: string | number | boolean | string[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleHireSettingsChange = (field: string, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      hireSettings: {
        ...prev.hireSettings!,
        [field]: value,
      },
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await storeAPI.items.uploadImage(file);
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, response.data.url],
        }));
      } else {
        alert(response.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await storeAPI.items.deleteImage(fileName);
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter(img => img !== imageUrl),
        }));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (formData.price < 0) {
      newErrors.price = 'Price must be non-negative';
    }
    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity must be non-negative';
    }
    if (formData.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = 'Low stock threshold must be non-negative';
    }

    if (formData.itemType === 'hire' && formData.hireSettings) {
      if (formData.hireSettings.minDurationDays <= 0) {
        newErrors.minDurationDays = 'Minimum duration must be positive';
      }
      if (formData.hireSettings.maxDurationDays < formData.hireSettings.minDurationDays) {
        newErrors.maxDurationDays = 'Maximum duration must be greater than or equal to minimum duration';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (item) {
        const response = await storeAPI.items.update(item.id, formData);
        if (response.success) {
          onSubmit();
        } else {
          alert(response.error || 'Failed to update item');
        }
      } else {
        const response = await storeAPI.items.create(formData);
        if (response.success) {
          onSubmit();
        } else {
          alert(response.error || 'Failed to create item');
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter item name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.categoryId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type *
                </label>
                <select
                  value={formData.itemType}
                  onChange={(e) => handleInputChange('itemType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="sale">For Sale</option>
                  <option value="hire">For Hire</option>
                </select>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Pricing & Stock</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.stockQuantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stockQuantity && <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.lowStockThreshold ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="10"
                />
                {errors.lowStockThreshold && <p className="mt-1 text-sm text-red-600">{errors.lowStockThreshold}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                  Available for purchase/hire
                </label>
              </div>
            </div>
          </div>

          {/* Hire Settings */}
          {formData.itemType === 'hire' && (
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Hire Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration Type *
                  </label>
                  <select
                    value={formData.hireSettings?.durationType}
                    onChange={(e) => handleHireSettingsChange('durationType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="per_term">Per Term</option>
                    <option value="per_year">Per Year</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.hireSettings?.minDurationDays || 1}
                    onChange={(e) => handleHireSettingsChange('minDurationDays', parseInt(e.target.value) || 1)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.minDurationDays ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.minDurationDays && <p className="mt-1 text-sm text-red-600">{errors.minDurationDays}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.hireSettings?.maxDurationDays || 7}
                    onChange={(e) => handleHireSettingsChange('maxDurationDays', parseInt(e.target.value) || 7)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.maxDurationDays ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxDurationDays && <p className="mt-1 text-sm text-red-600">{errors.maxDurationDays}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hireSettings?.depositAmount || ''}
                    onChange={(e) => handleHireSettingsChange('depositAmount', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Late Fee Per Day
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hireSettings?.lateFeePerDay || ''}
                    onChange={(e) => handleHireSettingsChange('lateFeePerDay', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Images</h4>
            
            <div className="space-y-4">
              {/* Upload Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {uploading && <p className="mt-1 text-sm text-gray-500">Uploading...</p>}
              </div>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Item ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(imageUrl)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={storeAPI.loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {storeAPI.loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
