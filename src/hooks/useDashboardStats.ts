// src/hooks/useDashboardStats.ts
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface DashboardStats {
  schools: number;
  students: number;
  totalRevenue: number;
  successRate: number;
  pendingPayments: number;
  completedPayments: number;
  loading: boolean;
  error: string | null;
}

export function useDashboardStats(isAdmin: boolean, schoolId?: string | null, profileLoading?: boolean) {
  const [stats, setStats] = useState<DashboardStats>({
    schools: 0,
    students: 0,
    totalRevenue: 0,
    successRate: 0,
    pendingPayments: 0,
    completedPayments: 0,
    loading: true,
    error: null,
  });

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    // Don't fetch stats if profile is still loading
    if (profileLoading) return;
    
    // For school staff, don't fetch if schoolId is not available yet
    if (!isAdmin && !schoolId) {
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'School ID not found. Please contact your administrator.' 
      }));
      return;
    }

    fetchDashboardStats();
  }, [isAdmin, schoolId, profileLoading]);

  const fetchDashboardStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      if (isAdmin) {
        // Admin stats - platform-wide data
        await fetchAdminStats();
      } else {
        // School staff stats - school-specific data
        await fetchSchoolStats();
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : JSON.stringify(error);
      console.error('Error fetching dashboard stats:', errorMsg);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMsg || 'Failed to load dashboard statistics'
      }));
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Fetch schools count
      const { count: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (schoolsError) throw schoolsError;

      // Fetch total students count across all schools
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (studentsError) throw studentsError;

      // Fetch payments data for revenue and success rate
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status');

      if (paymentsError) throw paymentsError;

      // Calculate revenue and success rate
      const completedPayments = paymentsData?.filter(p => p.status === 'completed') || [];
      const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const successRate = paymentsData?.length > 0 
        ? (completedPayments.length / paymentsData.length) * 100 
        : 0;

      setStats({
        schools: schoolsCount || 0,
        students: studentsCount || 0,
        totalRevenue,
        successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
        pendingPayments: paymentsData?.filter(p => p.status === 'pending').length || 0,
        completedPayments: completedPayments.length,
        loading: false,
        error: null,
      });
    } catch (error) {
      throw error;
    }
  };

  const fetchSchoolStats = async () => {
    try {
      // Double-check schoolId is available
      if (!schoolId) {
        throw new Error('School ID is required for school staff. Please ensure your profile is properly configured.');
      }

      // Fetch students count for this school
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'active');

      if (studentsError) throw studentsError;

      // Fetch payments for students in this school
      const { data: studentsData, error: studentsDataError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', schoolId);

      if (studentsDataError) throw studentsDataError;

      const studentIds = studentsData?.map(s => s.id) || [];

      if (studentIds.length > 0) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, status')
          .in('student_id', studentIds);

        if (paymentsError) throw paymentsError;

        // Calculate school-specific revenue and success rate
        const completedPayments = paymentsData?.filter(p => p.status === 'completed') || [];
        const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const successRate = paymentsData?.length > 0 
          ? (completedPayments.length / paymentsData.length) * 100 
          : 0;

        setStats({
          schools: 1, // School staff sees their own school
          students: studentsCount || 0,
          totalRevenue,
          successRate: Math.round(successRate * 10) / 10,
          pendingPayments: paymentsData?.filter(p => p.status === 'pending').length || 0,
          completedPayments: completedPayments.length,
          loading: false,
          error: null,
        });
      } else {
        // No students in this school yet
        setStats({
          schools: 1,
          students: 0,
          totalRevenue: 0,
          successRate: 0,
          pendingPayments: 0,
          completedPayments: 0,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const refreshStats = () => {
    // Only refresh if we have the required data
    if (!profileLoading && (isAdmin || schoolId)) {
      fetchDashboardStats();
    }
  };

  return {
    ...stats,
    refreshStats,
  };
}