// src/app/(dashboard)/school/store/components/StoreManagementView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useStoreAPI } from '@/hooks/useStoreAPI';
import { StoreStatsData } from '@/types/store';

// Lazy load views - they're conditionally rendered based on currentView
const ItemsListView = dynamic(() => import('./ItemsListView').then(mod => ({ default: mod.ItemsListView })), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

const CategoryManagementView = dynamic(() => import('./CategoryManagementView').then(mod => ({ default: mod.CategoryManagementView })), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

const OrdersListView = dynamic(() => import('./OrdersListView').then(mod => ({ default: mod.OrdersListView })), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

type ViewMode = 'dashboard' | 'items' | 'categories' | 'orders';

interface StoreManagementViewProps {
  onCreateNew?: () => void;
}

export function StoreManagementView({}: StoreManagementViewProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [stats, setStats] = useState<StoreStatsData>({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
    pendingOrders: 0,
    activeHires: 0,
    overdueHires: 0,
    pendingRequests: 0,
  });

  const storeAPI = useStoreAPI();

  // Load stats when component mounts
  useEffect(() => {
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = async () => {
    try {
      // Load all stats in parallel instead of sequentially
      const [itemsResponse, ordersResponse, hiresResponse, requestsResponse] = await Promise.all([
        storeAPI.items.getAll(1, 1),
        storeAPI.orders.getAll(1, 1),
        storeAPI.hireRecords.getAll(1, 1),
        storeAPI.stockRequests.getAll(1, 1)
      ]);

      // Update stats based on responses
      const newStats: StoreStatsData = {
        total: 0,
        active: 0,
        inactive: 0,
        lowStock: 0,
        pendingOrders: 0,
        activeHires: 0,
        overdueHires: 0,
        pendingRequests: 0,
      };

      if (itemsResponse.success && itemsResponse.data) {
        newStats.total = itemsResponse.data.stats.total;
        newStats.active = itemsResponse.data.stats.active;
        newStats.inactive = itemsResponse.data.stats.inactive;
        newStats.lowStock = itemsResponse.data.stats.lowStock;
      }

      if (ordersResponse.success && ordersResponse.data) {
        newStats.pendingOrders = ordersResponse.data.stats.pendingOrders;
      }

      if (hiresResponse.success && hiresResponse.data) {
        newStats.activeHires = hiresResponse.data.stats.activeHires;
        newStats.overdueHires = hiresResponse.data.stats.overdueHires;
      }

      if (requestsResponse.success && requestsResponse.data) {
        newStats.pendingRequests = requestsResponse.data.stats.pendingRequests;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error loading store stats:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'items':
        return <ItemsListView />;
      case 'categories':
        return <CategoryManagementView />;
      case 'orders':
        return <OrdersListView />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
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
          <p className="mt-2 text-sm text-gray-500">Loading store data...</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.lowStock}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingOrders}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Hires</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeHires}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button 
              onClick={() => setCurrentView('items')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <PlusIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Items
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create and manage store items
                </p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView('categories')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <TagIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Categories
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Organize items into categories
                </p>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView('orders')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <ClipboardDocumentListIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Orders
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage customer orders
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                  <EyeIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Stock Requests
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Review parent requests
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {((stats.lowStock || 0) > 0 || (stats.overdueHires || 0) > 0 || (stats.pendingRequests || 0) > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attention Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  {(stats.lowStock || 0) > 0 && (
                    <li>{stats.lowStock} item(s) are running low on stock</li>
                  )}
                  {(stats.overdueHires || 0) > 0 && (
                    <li>{stats.overdueHires} hire(s) are overdue for return</li>
                  )}
                  {(stats.pendingRequests || 0) > 0 && (
                    <li>{stats.pendingRequests} stock request(s) need attention</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      {currentView !== 'dashboard' && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentView === 'items' && 'Manage Items'}
                {currentView === 'categories' && 'Manage Categories'}
                {currentView === 'orders' && 'Manage Orders'}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Current View */}
      {renderCurrentView()}
    </div>
  );
}
