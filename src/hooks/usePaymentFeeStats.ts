"use client";

import { useState, useEffect, useCallback } from 'react';
import { PaymentFeeRate } from '@/types/payment-fee';
import { apiCache, createCacheKey, getCachedData } from '@/lib/apiCache';

interface PaymentFeeStats {
  activeRates: number;
  pendingApproval: number;
  averageFeeRate: number;
  schoolsConfigured: number;
}

const calculateStats = (rates: PaymentFeeRate[]): PaymentFeeStats => {
  const activeRates = rates.filter(rate => rate.status === 'active').length;
  const pendingApproval = rates.filter(
    rate => rate.status === 'pending_school' || rate.status === 'pending_admin'
  ).length;

  const activeFeeRates = rates
    .filter(rate => rate.status === 'active')
    .map(rate => rate.fee_percentage);

  const averageFeeRate = activeFeeRates.length > 0
    ? Number((activeFeeRates.reduce((sum, rate) => sum + rate, 0) / activeFeeRates.length).toFixed(2))
    : 2.5;

  const schoolsConfigured = new Set(
    rates.filter(rate => rate.status === 'active').map(rate => rate.school_id)
  ).size;

  return {
    activeRates,
    pendingApproval,
    averageFeeRate,
    schoolsConfigured,
  };
};

export function usePaymentFeeStats() {

  // Initialize with cached data
  const [stats, setStats] = useState<PaymentFeeStats>(() => {
    const cached = getCachedData<{ data: PaymentFeeRate[] }>(createCacheKey('admin:payment-fee-stats'));
    if (cached?.data) {
      return calculateStats(cached.data);
    }
    return {
      activeRates: 0,
      pendingApproval: 0,
      averageFeeRate: 2.5,
      schoolsConfigured: 0,
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const cacheKey = createCacheKey('admin:payment-fee-stats');

    try {
      setError(null);

      // Check cache synchronously first
      const cached = getCachedData<{ data: PaymentFeeRate[] }>(cacheKey);
      if (cached?.data) {
        setStats(calculateStats(cached.data));
        return;
      }

      // No cache - fetch from API
      setLoading(true);
      const response = await fetch('/api/admin/payment-fees', {
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

      // Cache and calculate
      apiCache.set(cacheKey, result);
      const rates: PaymentFeeRate[] = result.data || [];
      const calculatedStats = calculateStats(rates);
      setStats(calculatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    apiCache.clearPattern('admin:payment-fee-stats');
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    stats,
    loading,
    error,
    refetch,
  };
}
