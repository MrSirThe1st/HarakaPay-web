// src/app/(dashboard)/school/payments/components/SchoolStaffPaymentsView.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  CreditCardIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserGroupIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import { PaymentsByGradeView } from './PaymentsByGradeView';

interface Payment {
  id: string;
  amount: number;
  payment_date: string | null;
  payment_method: string;
  status: string;
  transaction_reference: string | null;
  mpesa_conversation_id: string | null;
  installment_number: number | null;
  description: string | null;
  created_at: string;
  students: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
  };
  parents: {
    first_name: string;
    last_name: string;
  } | null;
}

interface CachedPaymentsData {
  payments: Payment[];
  stats: {
    totalRevenue: number;
    successfulCount: number;
    pendingCount: number;
    failedCount: number;
  };
  hasMore: boolean;
  timestamp: number;
  filterStatus: string;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const AUTO_REFRESH_INTERVAL = 30 * 1000; // 30 seconds

const SchoolStaffPaymentsViewComponent = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'list' | 'byGrade'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, CachedPaymentsData>>(new Map());

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });

  // Generate cache key based on filter
  const getCacheKey = useCallback((status: string) => {
    return `payments_${status}`;
  }, []);

  // Load from cache
  const loadFromCache = useCallback((status: string) => {
    const cacheKey = getCacheKey(status);
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      const now = Date.now();
      // Check if cache is still valid
      if (now - cached.timestamp < CACHE_DURATION) {
        setPayments(cached.payments);
        setStats(cached.stats);
        setHasMore(cached.hasMore);
        return true;
      }
    }
    return false;
  }, [getCacheKey]);

  // Save to cache
  const saveToCache = useCallback((status: string, data: Payment[], statsData: typeof stats, hasMoreData: boolean) => {
    const cacheKey = getCacheKey(status);
    const cacheData: CachedPaymentsData = {
      payments: data,
      stats: statsData,
      hasMore: hasMoreData,
      timestamp: Date.now(),
      filterStatus: status
    };
    cacheRef.current.set(cacheKey, cacheData);
  }, [getCacheKey]);

  const fetchPayments = useCallback(async (page: number = 1, reset: boolean = false, isAutoRefresh = false) => {
    try {
      if (reset && !isAutoRefresh) {
        setIsLoading(true);
        setCurrentPage(1);
      } else if (!isAutoRefresh) {
        setIsLoadingMore(true);
      }

      const searchParams = new URLSearchParams();
      searchParams.set('page', page.toString());
      searchParams.set('limit', '25');
      if (filterStatus !== 'all') {
        searchParams.set('status', filterStatus);
      }

      const url = `/api/school/payments?${searchParams.toString()}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch payments');
      }

      const newPayments = result.data.payments || [];
      const newStats = result.data.stats;
      const newHasMore = result.data.pagination.hasMore;

      if (reset) {
        setPayments(newPayments);
        saveToCache(filterStatus, newPayments, newStats, newHasMore);
      } else {
        setPayments(prev => [...prev, ...newPayments]);
      }

      setHasMore(newHasMore);
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching payments:', error);
      if (!isAutoRefresh) {
        setPayments([]);
        setStats({
          totalRevenue: 0,
          successfulCount: 0,
          pendingCount: 0,
          failedCount: 0,
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filterStatus, saveToCache]);

  // Initial load: check cache first, then fetch if needed
  useEffect(() => {
    const hasCachedData = loadFromCache(filterStatus);
    if (hasCachedData) {
      setIsLoading(false);
    } else {
      fetchPayments(1, true);
    }
  }, [filterStatus, loadFromCache, fetchPayments]);

  // Auto-refresh setup with Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is not visible, pause auto-refresh
        if (autoRefreshTimerRef.current) {
          clearInterval(autoRefreshTimerRef.current);
          autoRefreshTimerRef.current = null;
        }
      } else {
        // Tab is visible, resume auto-refresh
        if (!autoRefreshTimerRef.current) {
          autoRefreshTimerRef.current = setInterval(() => {
            fetchPayments(1, true, true);
          }, AUTO_REFRESH_INTERVAL);
        }
      }
    };

    // Start auto-refresh if tab is visible
    if (!document.hidden) {
      autoRefreshTimerRef.current = setInterval(() => {
        fetchPayments(1, true, true);
      }, AUTO_REFRESH_INTERVAL);
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPayments]);

  const loadMorePayments = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPayments(nextPage, false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payment.students.first_name.toLowerCase().includes(search) ||
      payment.students.last_name.toLowerCase().includes(search) ||
      payment.students.student_id.toLowerCase().includes(search) ||
      payment.transaction_reference?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Payment Management')}</h1>
          <p className="text-gray-600">{t('Process and track student payments and fees')}</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ListBulletIcon className="h-4 w-4" />
              <span>{t('List View')}</span>
            </div>
          </button>
          <button
            onClick={() => setViewMode('byGrade')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'byGrade'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4" />
              <span>{t('By Grade')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {viewMode === 'list' && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Total Revenue')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.totalRevenue.toFixed(2)}
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
                    {t('Successful')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.successfulCount}
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
                    {t('Pending')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingCount}
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
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Failed')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.failedCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('Search payments by student name, ID, or reference...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative"> 
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">{t('All Status')}</option>
                  <option value="completed">{t('Completed')}</option>
                  <option value="pending">{t('Pending')}</option>
                  <option value="failed">{t('Failed')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {t('Recent Payments')}
          </h3>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm text-gray-500">{t('Loading payments...')}</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('No payments found')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('Payments will appear here once transactions are made')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Date')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Student')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Parent')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Amount')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Method')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Status')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Transaction')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.students.first_name} {payment.students.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.students.student_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.parents ? `${payment.parents.first_name} ${payment.parents.last_name}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(payment.amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.payment_method === 'mobile_money' ? '📱 M-Pesa' : payment.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.status === 'completed' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            {t('Completed')}
                          </span>
                        )}
                        {payment.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {t('Pending')}
                          </span>
                        )}
                        {payment.status === 'failed' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            {t('Failed')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {payment.transaction_reference || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Load More Button */}
          {!isLoading && filteredPayments.length > 0 && hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMorePayments}
                disabled={isLoadingMore}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('Loading...')}
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('Load Older Payments')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* No More Payments Message */}
          {!isLoading && filteredPayments.length > 0 && !hasMore && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {t('No more payments to load')}
              </p>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Grade-Level View */}
      {viewMode === 'byGrade' && (
        <PaymentsByGradeView />
      )}
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export const SchoolStaffPaymentsView = memo(SchoolStaffPaymentsViewComponent);
SchoolStaffPaymentsView.displayName = 'SchoolStaffPaymentsView';