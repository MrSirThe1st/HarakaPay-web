import { useState, useEffect } from 'react';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface StatsData {
  total: number;
  active?: number;
  inactive?: number;
  mandatory?: number;
  recurring?: number;
  published?: number;
  draft?: number;
  upfront?: number;
  installments?: number;
  completed?: number;
}

// Data Types
export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  term_structure: string;
  is_active: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface FeeCategory {
  id: string;
  name: string;
  description: string;
  is_mandatory: boolean;
  is_recurring: boolean;
  category_type: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface FeeTemplate {
  id: string;
  name: string;
  academic_year_id: string;
  grade_level: string;
  program_type: string;
  total_amount: number;
  status: 'draft' | 'published' | 'archived';
  school_id: string;
  created_at: string;
  updated_at: string;
  academic_years?: { name: string };
  fee_template_categories?: Array<{
    amount: number;
    fee_categories: FeeCategory;
  }>;
}

export interface PaymentSchedule {
  id: string;
  name: string;
  schedule_type: 'upfront' | 'per-term' | 'monthly' | 'custom';
  discount_percentage: number;
  template_id?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  payment_installments?: Array<{
    id: string;
    installment_number: number;
    description: string;
    amount: number;
    percentage: number;
    due_date: string;
    term_id?: string;
  }>;
}

export interface StudentFeeAssignment {
  id: string;
  student_id: string;
  template_id: string;
  schedule_id: string;
  academic_year_id: string;
  total_amount: number;
  paid_amount: number;
  status: 'active' | 'completed' | 'cancelled';
  school_id: string;
  created_at: string;
  updated_at: string;
  students?: { first_name: string; last_name: string; student_id: string };
  fee_templates?: { name: string; grade_level: string; program_type: string };
  academic_years?: { name: string };
  payment_schedules?: { name: string; schedule_type: string };
}

// Custom Hook for Fees API
export function useFeesAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic API call function
  const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Academic Years API
  const academicYears = {
    getAll: async (page = 1, limit = 50) => {
      return apiCall<{
        academicYears: AcademicYear[];
        pagination: PaginationData;
        stats: StatsData;
      }>(`/api/school/fees/academic-years?page=${page}&limit=${limit}`);
    },

    create: async (data: Partial<AcademicYear>) => {
      return apiCall<{ academicYear: AcademicYear }>('/api/school/fees/academic-years', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<AcademicYear>) => {
      return apiCall<{ academicYear: AcademicYear }>(`/api/school/fees/academic-years/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
    },

    delete: async (id: string) => {
      return apiCall(`/api/school/fees/academic-years?id=${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Fee Categories API
  const feeCategories = {
    getAll: async (page = 1, limit = 50) => {
      return apiCall<{
        feeCategories: FeeCategory[];
        pagination: PaginationData;
        stats: StatsData;
      }>(`/api/school/fees/categories?page=${page}&limit=${limit}`);
    },

    create: async (data: Partial<FeeCategory>) => {
      return apiCall<{ feeCategory: FeeCategory }>('/api/school/fees/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<FeeCategory>) => {
      return apiCall<{ feeCategory: FeeCategory }>(`/api/school/fees/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
    },

    delete: async (id: string) => {
      return apiCall(`/api/school/fees/categories?id=${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Fee Templates API
  const feeTemplates = {
    getAll: async (page = 1, limit = 50, filters?: {
      academic_year_id?: string;
      grade_level?: string;
      program_type?: string;
    }) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });
      
      return apiCall<{
        feeTemplates: FeeTemplate[];
        pagination: PaginationData;
        stats: StatsData;
      }>(`/api/school/fees/templates?${params}`);
    },

    getById: async (id: string) => {
      return apiCall<{ feeTemplate: FeeTemplate }>(`/api/school/fees/templates/${id}`);
    },

    create: async (data: Partial<FeeTemplate> & { categories: Array<{ category_id: string; amount: number }> }) => {
      return apiCall<{ feeTemplate: FeeTemplate }>('/api/school/fees/templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<FeeTemplate> & { categories?: Array<{ category_id: string; amount: number }> }) => {
      return apiCall<{ feeTemplate: FeeTemplate }>(`/api/school/fees/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
    },

    delete: async (id: string) => {
      return apiCall(`/api/school/fees/templates/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Payment Schedules API
  const paymentSchedules = {
    getAll: async (page = 1, limit = 50, scheduleType?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(scheduleType && { schedule_type: scheduleType }),
      });
      
      return apiCall<{
        paymentSchedules: PaymentSchedule[];
        pagination: PaginationData;
        stats: StatsData;
      }>(`/api/school/fees/payment-schedules?${params}`);
    },

    create: async (data: Partial<PaymentSchedule> & { 
      template_id?: string;
      installments?: Array<{
        description: string;
        amount: number;
        percentage: number;
        due_date: string;
        term_id?: string;
      }>
    }) => {
      return apiCall<{ paymentSchedule: PaymentSchedule }>('/api/school/fees/payment-schedules', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<PaymentSchedule>) => {
      return apiCall<{ paymentSchedule: PaymentSchedule }>(`/api/school/fees/payment-schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
    },

    delete: async (id: string) => {
      return apiCall(`/api/school/fees/payment-schedules?id=${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Student Fee Assignments API
  const studentFeeAssignments = {
    getAll: async (page = 1, limit = 50, filters?: {
      student_id?: string;
      academic_year_id?: string;
      status?: string;
    }) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });
      
      return apiCall<{
        studentFeeAssignments: StudentFeeAssignment[];
        pagination: PaginationData;
        stats: StatsData;
      }>(`/api/school/fees/student-assignments?${params}`);
    },

    create: async (data: Partial<StudentFeeAssignment>) => {
      return apiCall<{ studentFeeAssignment: StudentFeeAssignment }>('/api/school/fees/student-assignments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<StudentFeeAssignment>) => {
      return apiCall<{ studentFeeAssignment: StudentFeeAssignment }>(`/api/school/fees/student-assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
    },

    delete: async (id: string) => {
      return apiCall(`/api/school/fees/student-assignments?id=${id}`, {
        method: 'DELETE',
      });
    },
  };

  return {
    loading,
    error,
    academicYears,
    feeCategories,
    feeTemplates,
    paymentSchedules,
    studentFeeAssignments,
  };
}
