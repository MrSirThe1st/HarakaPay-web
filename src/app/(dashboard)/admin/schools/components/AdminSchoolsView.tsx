// src/app/(dashboard)/admin/schools/components/AdminSchoolsView.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { BuildingOfficeIcon, MapPinIcon, UsersIcon, PlusIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import CreateSchoolForm from './CreateSchoolForm';
import { SchoolsList } from './SchoolsList';
import { useSchoolStats } from '@/hooks/useSchoolStats';
import { Database } from '@/types/supabase';

type School = Database['public']['Tables']['schools']['Row'];

export function AdminSchoolsView() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { stats, loading: statsLoading, refetch: refetchStats } = useSchoolStats();

  const handleSchoolCreated = useCallback((school: School) => {
    setShowCreateForm(false);
    // Trigger both stats and schools list refresh
    refetchStats();
    setRefreshTrigger(prev => prev + 1);
    console.log('School created:', school.name);
  }, [refetchStats]);

  const handleManualRefresh = useCallback(() => {
    // Manual refresh for both components
    refetchStats();
    setRefreshTrigger(prev => prev + 1);
  }, [refetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Schools</h1>
          <p className="text-gray-600">Manage and monitor all registered schools</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleManualRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh
          </button>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add School
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Schools
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                    ) : (
                      stats.totalSchools
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Schools
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                    ) : (
                      stats.activeSchools
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approval
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                    ) : (
                      stats.pendingSchools
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    New This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                    ) : (
                      stats.newThisMonth
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schools List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Schools</h2>
        </div>
        <div className="p-6">
          <SchoolsList 
            refreshTrigger={refreshTrigger}
            onRefresh={undefined} // Don't pass automatic callback to prevent loop
          />
        </div>
      </div>

      {/* Create School Modal */}
      {showCreateForm && (
        <CreateSchoolForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleSchoolCreated}
        />
      )}
    </div>
  );
}