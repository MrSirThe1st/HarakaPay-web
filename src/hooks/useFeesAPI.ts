import { useState, useEffect, useCallback } from 'react';
import { apiCache, createCacheKey, cachedApiCall } from '@/lib/apiCache';

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

export interface FeeStructure {
  id: string;
  name: string;
  academic_year_id: string;
  grade_level: string;
  applies_to: 'school' | 'grade' | string;
  total_amount: number;
  is_active: boolean;
  is_published: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  academic_years?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    term_structure: string;
    is_active: boolean;
  };
  fee_structure_items?: Array<{
    id: string;
    amount: number;
    is_mandatory: boolean;
    is_recurring: boolean;
    payment_modes: ('one_time' | 'termly' | 'installment' | 'monthly')[];
    fee_categories: FeeCategory;
  }>;
  payment_plans?: Array<{
    id: string;
    type: 'monthly' | 'per-term' | 'upfront' | 'custom';
    discount_percentage: number;
    currency: string;
    installments: any; // JSONB field
    is_active: boolean;
    created_at: string;
  }>;
}

// Keep FeeTemplate for backward compatibility
export interface FeeTemplate extends FeeStructure {
  program_type: string;
  status: 'draft' | 'published' | 'archived';
  fee_template_categories?: Array<{
    amount: number;
    fee_categories: FeeCategory;
  }>;
}

export interface PaymentPlan {
  id: string;
  school_id: string;
  structure_id: string;
  name: string;
  type: 'monthly' | 'per-term' | 'upfront' | 'custom';
  discount_percentage: number;
  installments: Array<{
    label: string;
    amount: number;
    due_date: string;
  }>;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Keep PaymentSchedule for backward compatibility
export interface PaymentSchedule {
  id: string;
  school_id: string;
  template_id?: string;
  structure_id?: string;
  name: string;
  schedule_type: 'upfront' | 'per-term' | 'monthly' | 'custom';
  discount_percentage: number;
  installments: Array<{
    installment_number: number;
    amount: number;
    due_date: string;
    percentage: number;
    term_id?: string;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface StudentFeeAssignment {
  id: string;
  student_id: string;
  structure_id: string;
  payment_plan_id: string;
  academic_year_id: string;
  total_due: number;
  paid_amount: number;
  status: 'active' | 'completed' | 'cancelled';
  school_id: string;
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  assigned_by?: string;
  notes?: string;
  students?: { first_name: string; last_name: string; student_id: string };
  fee_structures?: { name: string; grade_level: string };
  payment_plans?: { type: string };
  academic_years?: { name: string };
}

// Keep old interface for backward compatibility
export interface LegacyStudentFeeAssignment extends StudentFeeAssignment {
  template_id: string;
  schedule_id: string;
  total_amount: number;
  fee_templates?: { name: string; grade_level: string; program_type: string };
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
      const cacheKey = createCacheKey('fees:academic-years', { page, limit });
      return cachedApiCall(
        cacheKey,
        () => apiCall<{
          academicYears: AcademicYear[];
          pagination: PaginationData;
          stats: StatsData;
        }>(`/api/school/fees/academic-years?page=${page}&limit=${limit}`)
      );
    },

    create: async (data: Partial<AcademicYear>) => {
      const result = await apiCall<{ academicYear: AcademicYear }>('/api/school/fees/academic-years', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Clear cache after creation
      if (result.success) {
        apiCache.clearPattern('fees:academic-years');
      }
      
      return result;
    },

    update: async (id: string, data: Partial<AcademicYear>) => {
      const result = await apiCall<{ academicYear: AcademicYear }>(`/api/school/fees/academic-years/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
      
      // Clear cache after update
      if (result.success) {
        apiCache.clearPattern('fees:academic-years');
      }
      
      return result;
    },

    delete: async (id: string) => {
      const result = await apiCall(`/api/school/fees/academic-years?id=${id}`, {
        method: 'DELETE',
      });
      
      // Clear cache after deletion
      if (result.success) {
        apiCache.clearPattern('fees:academic-years');
      }
      
      return result;
    },
  };

  // Fee Categories API
  const feeCategories = {
    getAll: async (page = 1, limit = 50) => {
      const cacheKey = createCacheKey('fees:categories', { page, limit });
      return cachedApiCall(
        cacheKey,
        () => apiCall<{
          feeCategories: FeeCategory[];
          pagination: PaginationData;
          stats: StatsData;
        }>(`/api/school/fees/categories?page=${page}&limit=${limit}`)
      );
    },

    create: async (data: Partial<FeeCategory>) => {
      const result = await apiCall<{ feeCategory: FeeCategory }>('/api/school/fees/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Clear cache after creation
      if (result.success) {
        apiCache.clearPattern('fees:categories');
      }
      
      return result;
    },

    update: async (id: string, data: Partial<FeeCategory>) => {
      const result = await apiCall<{ feeCategory: FeeCategory }>(`/api/school/fees/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
      
      // Clear cache after update
      if (result.success) {
        apiCache.clearPattern('fees:categories');
      }
      
      return result;
    },

    delete: async (id: string) => {
      const result = await apiCall(`/api/school/fees/categories?id=${id}`, {
        method: 'DELETE',
      });
      
      // Clear cache after deletion
      if (result.success) {
        apiCache.clearPattern('fees:categories');
      }
      
      return result;
    },
  };

  // Fee Structures API (New Schema)
  const feeStructures = {
    getAll: async (page = 1, limit = 50, filters?: {
      academic_year_id?: string;
      grade_level?: string;
      applies_to?: string;
    }) => {
      const cacheKey = createCacheKey('fees:structures', { page, limit, ...filters });
      return cachedApiCall(
        cacheKey,
        () => {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters,
          });
          
          return apiCall<{
            feeStructures: FeeStructure[];
            pagination: PaginationData;
            stats: StatsData;
          }>(`/api/school/fees/structures?${params}`);
        }
      );
    },

    getById: async (id: string) => {
      const cacheKey = createCacheKey('fees:structures:by-id', { id });
      return cachedApiCall(
        cacheKey,
        () => apiCall<{ feeStructure: FeeStructure }>(`/api/school/fees/structures/${id}`)
      );
    },

    create: async (data: Partial<FeeStructure> & { items: Array<{ category_id: string; amount: number; is_mandatory: boolean; is_recurring: boolean; payment_modes: string[] }> }) => {
      const result = await apiCall<{ feeStructure: FeeStructure }>('/api/school/fees/structures', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Clear cache after creation
      if (result.success) {
        apiCache.clearPattern('fees:structures');
      }
      
      return result;
    },

    update: async (id: string, data: Partial<FeeStructure> & { items?: Array<{ category_id: string; amount: number; is_mandatory: boolean; is_recurring: boolean; payment_mode: string }> }) => {
      const result = await apiCall<{ feeStructure: FeeStructure }>(`/api/school/fees/structures/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
      
      // Clear cache after update
      if (result.success) {
        apiCache.clearPattern('fees:structures');
      }
      
      return result;
    },

    delete: async (id: string) => {
      const result = await apiCall(`/api/school/fees/structures?id=${id}`, {
        method: 'DELETE',
      });
      
      // Clear cache after deletion
      if (result.success) {
        apiCache.clearPattern('fees:structures');
      }
      
      return result;
    },
  };

  // Fee Templates API (Backward Compatibility)
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

  // Payment Plans API (New Schema)
  const paymentPlans = {
    getAll: async (page = 1, limit = 50, filters?: {
      structure_id?: string;
      type?: string;
    }) => {
      const cacheKey = createCacheKey('fees:payment-plans', { page, limit, ...filters });
      return cachedApiCall(
        cacheKey,
        () => {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters,
          });
          
          return apiCall<{
            paymentPlans: PaymentPlan[];
            pagination: PaginationData;
            stats: StatsData;
          }>(`/api/school/fees/payment-plans?${params}`);
        }
      );
    },

    getById: async (id: string) => {
      const cacheKey = createCacheKey('fees:payment-plans:by-id', { id });
      return cachedApiCall(
        cacheKey,
        () => apiCall<{ paymentPlan: PaymentPlan }>(`/api/school/fees/payment-plans/${id}`)
      );
    },

    create: async (data: Partial<PaymentPlan> & { 
      structure_id: string;
      installments: Array<{
        label: string;
        amount: number;
        due_date: string;
      }>;
      currency?: string;
    }) => {
      const result = await apiCall<{ paymentPlan: PaymentPlan }>('/api/school/fees/payment-plans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Clear cache after creation
      if (result.success) {
        apiCache.clearPattern('fees:payment-plans');
      }
      
      return result;
    },

    update: async (id: string, data: Partial<PaymentPlan>) => {
      const result = await apiCall<{ paymentPlan: PaymentPlan }>(`/api/school/fees/payment-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
      
      // Clear cache after update
      if (result.success) {
        apiCache.clearPattern('fees:payment-plans');
      }
      
      return result;
    },

    delete: async (id: string) => {
      const result = await apiCall(`/api/school/fees/payment-plans?id=${id}`, {
        method: 'DELETE',
      });
      
      // Clear cache after deletion
      if (result.success) {
        apiCache.clearPattern('fees:payment-plans');
      }
      
      return result;
    },
  };

  // Payment Schedules API (Backward Compatibility)
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
      const cacheKey = createCacheKey('fees:student-assignments', { page, limit, ...filters });
      return cachedApiCall(
        cacheKey,
        () => {
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
        }
      );
    },

    create: async (data: Partial<StudentFeeAssignment>) => {
      const result = await apiCall<{ studentFeeAssignment: StudentFeeAssignment }>('/api/school/fees/student-assignments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Clear cache after creation
      if (result.success) {
        apiCache.clearPattern('fees:student-assignments');
      }
      
      return result;
    },

    update: async (id: string, data: Partial<StudentFeeAssignment>) => {
      const result = await apiCall<{ studentFeeAssignment: StudentFeeAssignment }>(`/api/school/fees/student-assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      });
      
      // Clear cache after update
      if (result.success) {
        apiCache.clearPattern('fees:student-assignments');
      }
      
      return result;
    },

    delete: async (id: string) => {
      const result = await apiCall(`/api/school/fees/student-assignments?id=${id}`, {
        method: 'DELETE',
      });
      
      // Clear cache after deletion
      if (result.success) {
        apiCache.clearPattern('fees:student-assignments');
      }
      
      return result;
    },
  };

  return {
    loading,
    error,
    academicYears,
    feeCategories,
    feeStructures,        // New API
    feeTemplates,         // Backward compatibility
    paymentPlans,         // New API
    paymentSchedules,     // Backward compatibility
    studentFeeAssignments,
  };
}
