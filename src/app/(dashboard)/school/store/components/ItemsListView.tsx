// src/app/(dashboard)/school/store/components/ItemsListView.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useStoreAPI } from '@/hooks/useStoreAPI';
import { StoreItem, StoreCategory, StoreItemFilters } from '@/types/store';
// import { ItemFormModal } from './ItemFormModal';

interface ItemsListViewProps {
  onCreateNew?: () => void;
}

export function ItemsListView({}: ItemsListViewProps) {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [filters, setFilters] = useState<StoreItemFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const storeAPI = useStoreAPI();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      // Load categories
      const categoriesResponse = await storeAPI.categories.getAll(1, 50);
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data.categories);
      }

      // Load items
      await loadItems();
    } catch (error) {
      console.error('Error loading items data:', error);
    }
  };

  const loadItems = async () => {
    try {
      const itemsResponse = await storeAPI.items.getAll(1, 50, filters);
      if (itemsResponse.success && itemsResponse.data) {
        setItems(itemsResponse.data.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  // Debounced search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: query || undefined };
      setFilters(newFilters);
      loadItemsWithFilters(newFilters);
    }, 300);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    const newFilters = { ...filters, categoryId: categoryId || undefined };
    setFilters(newFilters);
    loadItemsWithFilters(newFilters);
  };

  const handleTypeFilter = (itemType: 'sale' | 'hire' | null) => {
    const newFilters = { ...filters, itemType: itemType || undefined };
    setFilters(newFilters);
    loadItemsWithFilters(newFilters);
  };

  const handleAvailabilityFilter = (isAvailable: boolean | null) => {
    const newFilters = { ...filters, isAvailable: isAvailable !== null ? isAvailable : undefined };
    setFilters(newFilters);
    loadItemsWithFilters(newFilters);
  };

  const handleLowStockFilter = (lowStock: boolean | null) => {
    const newFilters = { ...filters, lowStock: lowStock !== null ? lowStock : undefined };
    setFilters(newFilters);
    loadItemsWithFilters(newFilters);
  };

  const loadItemsWithFilters = async (newFilters: StoreItemFilters) => {
    try {
      const itemsResponse = await storeAPI.items.getAll(1, 50, newFilters);
      if (itemsResponse.success && itemsResponse.data) {
        setItems(itemsResponse.data.items);
      }
    } catch (error) {
      console.error('Error loading items with filters:', error);
    }
  };

  const handleCreateItem = () => {
    setShowFormModal(true);
  };

  const handleEditItem = () => {
    setShowFormModal(true);
  };

  const handleDeleteItem = async (item: StoreItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const response = await storeAPI.items.delete(item.id);
        if (response.success) {
          await loadItems();
        } else {
          alert(response.error || 'Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  // const handleFormSubmit = async () => {
  //   setShowFormModal(false);
  //   await loadItems();
  // };

  const getStockStatus = (item: StoreItem) => {
    if (item.stockQuantity === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    }
    if (item.stockQuantity <= item.lowStockThreshold) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {storeAPI.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{storeAPI.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {storeAPI.loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading items...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Store Items</h2>
        <button
          onClick={handleCreateItem}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleCategoryFilter(e.target.value || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.itemType || ''}
                  onChange={(e) => handleTypeFilter(e.target.value as 'sale' | 'hire' || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="hire">For Hire</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={filters.isAvailable === undefined ? '' : filters.isAvailable.toString()}
                  onChange={(e) => handleAvailabilityFilter(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Items</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                <select
                  value={filters.lowStock === undefined ? '' : filters.lowStock.toString()}
                  onChange={(e) => handleLowStockFilter(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Stock Levels</option>
                  <option value="true">Low Stock</option>
                  <option value="false">Normal Stock</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {item.images && item.images.length > 0 ? (
                              <Image className="h-10 w-10 rounded-lg object-cover" src={item.images[0]} alt={item.name} width={40} height={40} />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category?.name || 'No Category'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.itemType === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.itemType === 'sale' ? 'For Sale' : 'For Hire'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.stockQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditItem()}
                            className="text-green-600 hover:text-green-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="text-center py-8">
              <p className="text-gray-500">Item form modal temporarily disabled for performance testing</p>
              <button
                onClick={() => {
                  setShowFormModal(false);
                }}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
