"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createCacheKey, cachedApiCall, getCachedData, apiCache } from '@/lib/apiCache';
import { CheckCircleIcon, ClockIcon, XCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { PaymentFeeRateWithDetails, FEE_STATUS_LABELS, isPendingApproval } from '@/types/payment-fee';
import { ApproveRejectModal } from './ApproveRejectModal';

interface PaymentFeeRatesListProps {
  onRefresh?: () => void;
  refreshTrigger?: number;
}

export function PaymentFeeRatesList({ onRefresh, refreshTrigger }: PaymentFeeRatesListProps) {
  const [filter, setFilter] = useState<string>('all');

  // Initialize with cached data to avoid skeleton flash
  const [rates, setRates] = useState<PaymentFeeRateWithDetails[]>(() => {
    const cached = getCachedData<{ data: PaymentFeeRateWithDetails[] }>(
      createCacheKey('admin:payment-fee-rates', { filter: 'all' })
    );
    return cached?.data || [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<{ rate: PaymentFeeRateWithDetails; action: 'approve' | 'reject' } | null>(null);

  const fetchRates = useCallback(async (skipCache = false) => {
    const cacheKey = createCacheKey('admin:payment-fee-rates', { filter });

    try {
      setError(null);

      // Check cache synchronously first
      if (!skipCache) {
        const cached = getCachedData<{ data: PaymentFeeRateWithDetails[] }>(cacheKey);
        if (cached) {
          setRates(cached.data || []);
          return;
        }
      }

      // No cache or skip requested - fetch from API
      setLoading(true);
      const url = filter === 'all' ? '/api/admin/payment-fees' : `/api/admin/payment-fees?status=${filter}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment fee rates');
      }

      const result = await response.json();

      // Cache the result
      apiCache.set(cacheKey, result);
      setRates(result.data || []);
    } catch (err) {
      console.error('Payment fee rates fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      apiCache.clearPattern('admin:payment-fee-rates');
      fetchRates(true);
    }
  }, [refreshTrigger, fetchRates]);

  const handleActionComplete = useCallback(() => {
    setSelectedRate(null);
    // Clear cache and force refresh
    apiCache.clearPattern('admin:payment-fee-rates');
    fetchRates(true);
    onRefresh?.();
  }, [fetchRates, onRefresh]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      pending_school: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      pending_admin: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      rejected_by_school: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      rejected_by_admin: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      expired: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || ClockIcon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-4 h-4 mr-1" />
        {FEE_STATUS_LABELS[status as keyof typeof FEE_STATUS_LABELS] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchRates}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('pending_school')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'pending_school' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Pending School
        </button>
        <button
          onClick={() => setFilter('pending_admin')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'pending_admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Pending Admin
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proposed By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effective From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No payment fee rates found</p>
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rate.school?.name || 'Unknown School'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {rate.fee_percentage}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(rate.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {rate.proposed_by?.first_name} {rate.proposed_by?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rate.proposed_by_role === 'platform_admin' ? 'Platform Admin' : 'School Admin'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(rate.effective_from).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {rate.status === 'pending_admin' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRate({ rate, action: 'approve' })}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedRate({ rate, action: 'reject' })}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {!isPendingApproval(rate.status) && (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Approve/Reject Modal */}
      {selectedRate && (
        <ApproveRejectModal
          rate={selectedRate.rate}
          action={selectedRate.action}
          onClose={() => setSelectedRate(null)}
          onSuccess={handleActionComplete}
        />
      )}
    </div>
  );
}
