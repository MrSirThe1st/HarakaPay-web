"use client";

import React, { useState, useCallback } from 'react';
import { BanknotesIcon, BuildingOfficeIcon, ClockIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PaymentFeeRatesList } from './PaymentFeeRatesList';
import { CreateFeeRateModal } from './CreateFeeRateModal';
import { usePaymentFeeStats } from '@/hooks/usePaymentFeeStats';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminPaymentFeesView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { stats, loading: statsLoading, refetch: refetchStats } = usePaymentFeeStats();

  const handleFeeRateCreated = useCallback(() => {
    refetchStats();
    setRefreshTrigger(prev => prev + 1);
    setShowCreateModal(false);
  }, [refetchStats]);

  const handleManualRefresh = useCallback(() => {
    refetchStats();
    setRefreshTrigger(prev => prev + 1);
  }, [refetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Fees Management</h1>
          <p className="text-gray-600">Configure platform payment fees per school</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Propose New Rate
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
                    Active Rates
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-12" />
                    ) : (
                      stats.activeRates
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
                      <Skeleton className="h-6 w-12" />
                    ) : (
                      stats.pendingApproval
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
                <BanknotesIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Fee Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-12" />
                    ) : (
                      `${stats.averageFeeRate}%`
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
                <CheckCircleIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Schools Configured
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-12" />
                    ) : (
                      stats.schoolsConfigured
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Rates List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment Fee Rates</h2>
        </div>
        <div className="p-6">
          <PaymentFeeRatesList
            refreshTrigger={refreshTrigger}
            onRefresh={handleManualRefresh}
          />
        </div>
      </div>

      {/* Create Fee Rate Modal */}
      {showCreateModal && (
        <CreateFeeRateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFeeRateCreated}
        />
      )}
    </div>
  );
}
