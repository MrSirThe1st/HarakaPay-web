// src/app/(dashboard)/admin/analytics/components/AdminAnalyticsView.tsx
"use client";

import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export function AdminAnalyticsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-600">Comprehensive insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    3,847
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    $124,567
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">+23% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Growth Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    18.5%
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">+2.1% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    1,234
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">+8% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Analytics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              User Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">New Registrations</span>
                <span className="text-sm font-medium text-gray-900">247</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium text-gray-900">2,891</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">User Retention</span>
                <span className="text-sm font-medium text-gray-900">87.3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Analytics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Financial Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="text-sm font-medium text-gray-900">$12,847</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">Transaction Volume</span>
                <span className="text-sm font-medium text-gray-900">1,847</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-gray-900">98.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Performance Charts
          </h3>
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Interactive Charts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Revenue trends, user growth, and performance metrics coming soon...
            </p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Export & Reports
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Export Data
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
              Generate Report
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <UsersIcon className="h-4 w-4 mr-2" />
              User Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
