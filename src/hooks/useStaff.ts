import { useState, useEffect, useCallback } from 'react';

export interface Staff {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: 'school_staff';
  school_id: string;
  is_active: boolean;
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StaffStats {
  total: number;
  active: number;
  inactive: number;
}

export interface StaffFilters {
  search: string;
  page: number;
  limit: number;
}

export interface StaffResponse {
  staff: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: StaffStats;
}

export function useStaff(initialFilters: Partial<StaffFilters> = {}) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    page: 1,
    limit: 50,
    ...initialFilters
  });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      if (filters.search) searchParams.set('search', filters.search);
      searchParams.set('page', filters.page.toString());
      searchParams.set('limit', filters.limit.toString());

      const response = await fetch(`/api/school/staff?${searchParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch staff');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch staff');
      }

      setStaff(result.data.staff);
      setStats(result.data.stats);
      setPagination(result.data.pagination);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<StaffFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const refreshStaff = useCallback(() => {
    fetchStaff();
  }, [fetchStaff]);

  const createStaff = useCallback(async (staffData: {
    email: string;
    first_name: string;
    last_name: string;
    permissions?: Record<string, any>;
  }) => {
    try {
      const response = await fetch('/api/school/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create staff member');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create staff member');
      }

      // Refresh the staff list
      refreshStaff();
      return result;
    } catch (error) {
      console.error('Create staff error:', error);
      throw error;
    }
  }, [refreshStaff]);

  const updateStaff = useCallback(async (staffId: string, staffData: {
    first_name: string;
    last_name: string;
    is_active?: boolean;
    permissions?: Record<string, any>;
  }) => {
    try {
      const response = await fetch(`/api/school/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update staff member');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to update staff member');
      }

      // Refresh the staff list
      refreshStaff();
      return result;
    } catch (error) {
      console.error('Update staff error:', error);
      throw error;
    }
  }, [refreshStaff]);

  const deleteStaff = useCallback(async (staffId: string) => {
    try {
      const response = await fetch(`/api/school/staff/${staffId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete staff member');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete staff member');
      }

      // Refresh the staff list
      refreshStaff();
      return result;
    } catch (error) {
      console.error('Delete staff error:', error);
      throw error;
    }
  }, [refreshStaff]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    stats,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refreshStaff,
    createStaff,
    updateStaff,
    deleteStaff
  };
}
