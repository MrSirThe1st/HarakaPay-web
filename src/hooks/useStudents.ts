import { useState, useEffect, useCallback } from 'react';

// Simple in-memory cache for students data
const studentsCache = new Map<string, {
  data: StudentsResponse;
  timestamp: number;
}>();

export interface Student {
  id: string;
  school_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  gender: 'M' | 'F' | null;
  grade_level: string | null;
  level: string | null;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  home_address: string | null;
  date_of_birth: string | null;
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  allergies: string[] | null;
  guardian_relationship: 'mother' | 'father' | 'guardian' | 'uncle' | 'aunt' | 'grandmother' | 'grandfather' | 'sibling' | 'other' | null;
  chronic_conditions: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  graduated: number;
  newThisMonth: number;
  graduating: number;
}

export interface StudentFilters {
  search: string;
  grade: string;
  status: string;
  page: number;
  limit: number;
}

export interface StudentsResponse {
  students: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: StudentStats;
}

export function useStudents(initialFilters: Partial<StudentFilters> = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
    newThisMonth: 0,
    graduating: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    grade: 'all',
    status: 'all',
    page: 1,
    limit: 50,
    ...initialFilters
  });

  const fetchStudents = useCallback(async (currentFilters = filters) => {
    // Create cache key from filters
    const cacheKey = JSON.stringify(currentFilters);
    const cached = studentsCache.get(cacheKey);
    
    // Check if we have cached data (no time expiration)
    if (cached) {
      setStudents(cached.data.students);
      setStats(cached.data.stats);
      setPagination(cached.data.pagination);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      if (currentFilters.search) searchParams.set('search', currentFilters.search);
      if (currentFilters.grade && currentFilters.grade !== 'all') searchParams.set('grade', currentFilters.grade);
      if (currentFilters.status && currentFilters.status !== 'all') searchParams.set('status', currentFilters.status);
      searchParams.set('page', currentFilters.page.toString());
      searchParams.set('limit', currentFilters.limit.toString());

      const response = await fetch(`/api/students?${searchParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch students');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch students');
      }

      // Cache the result (persists until manually cleared)
      studentsCache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });

      setStudents(result.data.students);
      setStats(result.data.stats);
      setPagination(result.data.pagination);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<StudentFilters>) => {
    setFilters(prev => {
      const updatedFilters = {
        ...prev,
        ...newFilters,
        // Only reset to page 1 if we're changing filters other than page
        page: 'page' in newFilters ? newFilters.page! : 1
      };
      // Trigger fetch with new filters
      fetchStudents(updatedFilters);
      return updatedFilters;
    });
  }, [fetchStudents]);

  const refreshStudents = useCallback(() => {
    // Clear cache before refreshing
    studentsCache.clear();
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    // Only fetch on initial mount, not on every filter change
    fetchStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    students,
    stats,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refreshStudents
  };
}
