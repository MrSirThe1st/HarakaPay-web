import { useState, useEffect } from 'react';
import { DashboardStats, SchoolStats } from '@/lib/dashboardService';

interface DashboardData {
  stats: DashboardStats | SchoolStats | null;
  recentActivity: any[];
  loading: boolean;
  error: string | null;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    recentActivity: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const statsData = await statsResponse.json();

      // Fetch recent activity
      const activityResponse = await fetch('/api/dashboard/recent-activity');
      if (!activityResponse.ok) {
        throw new Error('Failed to fetch recent activity');
      }
      const activityData = await activityResponse.json();

      setData({
        stats: statsData.stats,
        recentActivity: activityData.recentActivity,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
      }));
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    ...data,
    refreshData
  };
};

