// src/app/(dashboard)/admin/schools/components/AdminSchoolsView.tsx
"use client";

import React, { useState } from 'react';
import { BuildingOfficeIcon, MapPinIcon, UsersIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CreateSchoolForm } from './CreateSchoolForm';
import { SchoolsList } from './SchoolsList';
import { useSchoolStats } from '@/hooks/useSchoolStats';
import { Database } from '@/types/supabase';

type School = Database['public']['Tables']['schools']['Row'];

export function AdminSchoolsView() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { stats, loading: statsLoading, refetch: refetchStats } = useSchoolStats();

  const handleSchoolCreated = (school: School) => {
    setShowCreateForm(false);
    refetchStats(); // Refresh stats after creating a school
    console.log('School created:', school.name); // Use the school parameter
  };

  const handleRefreshSchools = () => {
    refetchStats(); // This will also refresh the schools list
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Schools</h1>
          <p className="text-gray-600">Manage and monitor all registered schools</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add School
        </button>
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
                    {statsLoading ? '...' : stats.totalSchools}
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
                <UsersIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Schools
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : stats.activeSchools}
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
                <MapPinIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Countries
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : stats.countries}
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
                <BuildingOfficeIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    New This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : stats.newThisMonth}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* School List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Registered Schools
            </h3>
            <button 
              onClick={handleRefreshSchools}
              disabled={statsLoading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          <SchoolsList onRefresh={handleRefreshSchools} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button 
              onClick={() => setShowCreateForm(true)}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <BuildingOfficeIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Add New School
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Register a new school on the platform
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <UsersIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Users
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View and manage school users
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <MapPinIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Geographic View
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View schools by location
                </p>
              </div>
            </button>
          </div>
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
