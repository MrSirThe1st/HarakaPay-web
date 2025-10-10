import { useState, useEffect, useCallback } from 'react';

export interface Student {
  id: string;
  school_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  grade_level: string | null;
  level: string | null;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
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

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.grade && filters.grade !== 'all') searchParams.set('grade', filters.grade);
      if (filters.status && filters.status !== 'all') searchParams.set('status', filters.status);
      searchParams.set('page', filters.page.toString());
      searchParams.set('limit', filters.limit.toString());

      const response = await fetch(`/api/students?${searchParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch students');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch students');
      }

      setStudents(result.data.students);
      setStats(result.data.stats);
      setPagination(result.data.pagination);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<StudentFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const refreshStudents = useCallback(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
