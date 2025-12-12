// src/app/(dashboard)/school/dashboard/components/SchoolStaffDashboard.tsx
"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  studentsChange: number;
  revenueChange: number;
}

interface CachedData {
  stats: DashboardStats;
  timestamp: number;
}

const CACHE_KEY = 'dashboard_stats_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const SchoolStaffDashboardComponent = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Load from cache
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: CachedData = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - data.timestamp < CACHE_DURATION) {
          setStats(data.stats);
          return true;
        }
      }
    } catch (err) {
      console.error('Error loading from cache:', err);
    }
    return false;
  }, []);

  // Save to cache
  const saveToCache = useCallback((statsData: DashboardStats) => {
    try {
      const cacheData: CachedData = {
        stats: statsData,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();

      if (!response.ok || !result.stats) {
        throw new Error(result.error || 'Failed to fetch dashboard statistics');
      }

      setStats(result.stats);
      saveToCache(result.stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, [saveToCache]);

  // Initial load: check cache first, then fetch if needed
  useEffect(() => {
    const hasCachedData = loadFromCache();
    if (hasCachedData) {
      setIsLoading(false);
    } else {
      fetchStats();
    }
  }, [loadFromCache, fetchStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowTrendingUpIcon className="h-4 w-4" />;
    if (change < 0) return <ArrowTrendingDownIcon className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchStats()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {formatNumber(stats.totalStudents)}
                </p>
                {stats.studentsChange !== 0 && (
                  <div className={`flex items-center mt-3 text-sm font-medium ${getChangeColor(stats.studentsChange)}`}>
                    {getChangeIcon(stats.studentsChange)}
                    <span className="ml-1">
                      {Math.abs(stats.studentsChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                <UserGroupIcon className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Students */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {formatNumber(stats.activeStudents)}
                </p>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {stats.totalStudents > 0 
                    ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% of total`
                    : '0% of total'
                  }
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
                <AcademicCapIcon className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                {stats.revenueChange !== 0 && (
                  <div className={`flex items-center mt-3 text-sm font-medium ${getChangeColor(stats.revenueChange)}`}>
                    {getChangeIcon(stats.revenueChange)}
                    <span className="ml-1">
                      {Math.abs(stats.revenueChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3">
                <CurrencyDollarIcon className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Current month revenue
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3">
                <ChartBarIcon className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Additional Info Section */}
      {stats && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-center p-5 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-sm">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-600 mb-1">Student Activity</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.activeStudents} active out of {stats.totalStudents} total
                </p>
              </div>
            </div>
            <div className="flex items-center p-5 bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 shadow-sm">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-600 mb-1">Revenue Performance</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.totalRevenue > 0 
                    ? `${((stats.monthlyRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total this month`
                    : 'No revenue data'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export const SchoolStaffDashboard = memo(SchoolStaffDashboardComponent);
SchoolStaffDashboard.displayName = 'SchoolStaffDashboard';
