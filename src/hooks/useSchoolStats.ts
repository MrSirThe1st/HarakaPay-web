"use client";

import { useState, useEffect, useCallback } from 'react';
import { Database } from '@/types/supabase';
import { apiCache, createCacheKey, cachedApiCall } from '@/lib/apiCache';

type School = Database['public']['Tables']['schools']['Row'];

interface SchoolStats {
  totalSchools: number;
  activeSchools: number;
  pendingSchools: number;
  suspendedSchools: number;
  countries: number;
  newThisMonth: number;
}

export function useSchoolStats() {
  const [stats, setStats] = useState<SchoolStats>({
    totalSchools: 0,
    activeSchools: 0,
    pendingSchools: 0,
    suspendedSchools: 0,
    countries: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = (schools: School[]): SchoolStats => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalSchools = schools.length;
    const activeSchools = schools.filter(
      school => school.status === 'approved' && school.verification_status === 'verified'
    ).length;
    const pendingSchools = schools.filter(
      school => school.status === 'pending' || school.verification_status === 'pending'
    ).length;
    const suspendedSchools = schools.filter(
      school => school.status === 'suspended' || school.verification_status === 'rejected'
    ).length;
    
    // Extract unique countries from addresses (simple approach)
    const countries = new Set(
      schools
        .map(school => school.address)
        .filter(Boolean)
        .map(address => {
          // Simple country extraction - in a real app, you'd use a proper geocoding service
          const parts = address!.split(',').map(part => part.trim());
          return parts[parts.length - 1]; // Assume last part is country
        })
    ).size;
    
    const newThisMonth = schools.filter(school => {
      const createdDate = new Date(school.created_at);
      return createdDate >= thisMonth;
    }).length;

    return {
      totalSchools,
      activeSchools,
      pendingSchools,
      suspendedSchools,
      countries,
      newThisMonth,
    };
  };

  const fetchStats = useCallback(async () => {
    const cacheKey = createCacheKey('admin:school-stats');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await cachedApiCall(
        cacheKey,
        async () => {
          const response = await fetch('/api/schools', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch schools');
          }

          return response.json();
        }
      );

      const schools: School[] = result.schools || [];
      const calculatedStats = calculateStats(schools);
      setStats(calculatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    // Clear cache before refetching
    apiCache.clearPattern('admin:school-stats');
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
