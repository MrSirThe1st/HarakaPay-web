"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BanknotesIcon, ClockIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { PaymentFeeRateWithDetails, FEE_STATUS_LABELS, isPendingApproval } from '@/types/payment-fee';
import { Skeleton } from '@/components/ui/skeleton';
import { SchoolApproveRejectModal } from './SchoolApproveRejectModal';
import { createCacheKey, getCachedData, apiCache } from '@/lib/apiCache';

export function SchoolPaymentFeesView() {
  // Initialize with cached data to avoid skeleton flash
  const [rates, setRates] = useState<PaymentFeeRateWithDetails[]>(() => {
    const cached = getCachedData<{ data: PaymentFeeRateWithDetails[] }>(createCacheKey('school:payment-fees'));
    return cached?.data || [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<{ rate: PaymentFeeRateWithDetails; action: 'approve' | 'reject' } | null>(null);

  const fetchRates = useCallback(async () => {
    const cacheKey = createCacheKey('school:payment-fees');

    try {
      setError(null);

      // Check cache synchronously first
      const cached = getCachedData<{ data: PaymentFeeRateWithDetails[] }>(cacheKey);
      if (cached) {
        setRates(cached.data || []);
        return;
      }

      // No cache - fetch from API
      setLoading(true);
      const response = await fetch('/api/school/payment-fees', {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment fee rates');
      }

      const data = await response.json();

      // Cache and set
      apiCache.set(cacheKey, data);
      setRates(data.data || []);
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment fee rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleActionComplete = useCallback(() => {
    setSelectedRate(null);
    apiCache.delete(createCacheKey('school:payment-fees'));
    fetchRates();
  }, [fetchRates]);

  const activeRate = rates.find(rate => rate.status === 'active');
  const pendingRate = rates.find(rate => rate.status === 'pending_school');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Fee Settings</h1>
        <p className="text-gray-600">Manage platform payment fees for your school</p>
      </div>

      {/* Current Active Rate */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Current Fee Rate</h2>
          </div>
        </div>
        <div className="p-6">
          {activeRate ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-12 w-12 text-green-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {activeRate.fee_percentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Platform service fee
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Effective Since:</span>
                  <span className="font-medium">{new Date(activeRate.effective_from).toLocaleDateString()}</span>
                </div>
                {activeRate.admin_approved_by_profile && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Approved By:</span>
                    <span className="font-medium">
                      Platform Admin
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p>This fee is automatically added to each parent transaction. Parents see the breakdown at checkout.</p>
                  <p className="mt-1">Example: KES 10,000 fee + {activeRate.fee_percentage}% = KES {(10000 + (10000 * activeRate.fee_percentage / 100)).toFixed(2)} total charged to parent</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No active fee rate configured</p>
              <p className="text-sm mt-1">Default rate of 2.5% will be applied</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Approval */}
      {pendingRate && (
        <div className="bg-white shadow rounded-lg overflow-hidden border-2 border-yellow-200">
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-medium text-gray-900">Pending Your Approval</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-12 w-12 text-yellow-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {pendingRate.fee_percentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Proposed platform service fee
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Proposed By:</span>
                  <span className="font-medium">
                    {pendingRate.proposed_by?.first_name} {pendingRate.proposed_by?.last_name} (Platform Admin)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Will Take Effect:</span>
                  <span className="font-medium">{new Date(pendingRate.effective_from).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  This proposal requires your approval. Once approved, it will be reviewed by platform admin before becoming active.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedRate({ rate: pendingRate, action: 'approve' })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => setSelectedRate({ rate: pendingRate, action: 'reject' })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {rates.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Fee Rate History</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-gray-900">
                      {rate.fee_percentage}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {FEE_STATUS_LABELS[rate.status]}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(rate.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {selectedRate && (
        <SchoolApproveRejectModal
          rate={selectedRate.rate}
          action={selectedRate.action}
          onClose={() => setSelectedRate(null)}
          onSuccess={handleActionComplete}
        />
      )}
    </div>
  );
}
