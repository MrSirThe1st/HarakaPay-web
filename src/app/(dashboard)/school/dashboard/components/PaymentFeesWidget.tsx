"use client";

import React, { useState, useEffect } from 'react';
import { BanknotesIcon, ArrowRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { createCacheKey, getCachedData, apiCache } from '@/lib/apiCache';

interface FeesSummary {
  total_fees_owed: number;
  transaction_count: number;
  current_fee_percentage: number;
}

export function PaymentFeesWidget() {
  // Initialize with cached data to avoid skeleton flash
  const [summary, setSummary] = useState<FeesSummary | null>(() => {
    const cached = getCachedData<{ data: { summary: FeesSummary } }>(createCacheKey('school:payment-fees-summary'));
    return cached?.data?.summary || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    const cacheKey = createCacheKey('school:payment-fees-summary');

    try {
      // Check cache synchronously first
      const cached = getCachedData<{ data: { summary: FeesSummary } }>(cacheKey);
      if (cached) {
        setSummary(cached.data.summary);
        return;
      }

      // No cache - fetch from API
      setLoading(true);
      const response = await fetch('/api/school/payment-fees/reports', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment fees summary');
      }

      const data = await response.json();

      // Cache and set
      apiCache.set(cacheKey, data);
      setSummary(data.data.summary);
    } catch (err) {
      console.error('Error fetching payment fees summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <BanknotesIcon className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-medium text-gray-900">Platform Fees Owed</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <BanknotesIcon className="h-12 w-12 text-orange-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                KES {summary.total_fees_owed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">
                Total platform fees to pay
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Fee Rate:</span>
              <span className="font-medium">{summary.current_fee_percentage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transactions:</span>
              <span className="font-medium">{summary.transaction_count}</span>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-md p-3 flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p>This amount represents the {summary.current_fee_percentage}% platform service fee from parent transactions.</p>
              <p className="mt-1 font-medium">Payment arrangements should be made directly with the platform admin.</p>
            </div>
          </div>

          <Link
            href="/school/settings/payment-fees"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
          >
            View Details
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
