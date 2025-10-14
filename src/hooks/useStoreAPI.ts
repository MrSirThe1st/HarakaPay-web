// src/hooks/useStoreAPI.ts
import { useState, useEffect } from 'react';
import { 
  StoreCategory, 
  StoreItem, 
  StoreOrder, 
  HireRecord, 
  StockRequest,
  StoreApiResponse, 
  StorePaginationData, 
  StoreStatsData,
  StoreItemFilters,
  StoreOrderFilters,
  StockRequestFilters,
  StoreCategoryFormData,
  StoreItemFormData,
  CreateOrderData,
  StockRequestFormData
} from '@/types/store';

// Generic API call function
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<StoreApiResponse<T>> => {
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
    return { success: false, error: errorMessage };
  }
};

// Custom Hook for Store API
export function useStoreAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic API call function with loading state
  const apiCallWithLoading = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<StoreApiResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall<T>(endpoint, options);
      if (!result.success) {
        setError(result.error || 'API request failed');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Store Categories API
  const categories = {
    getAll: async (page = 1, limit = 50) => {
      return apiCallWithLoading<{
        categories: StoreCategory[];
        pagination: StorePaginationData;
        stats: StoreStatsData;
      }>(`/api/school/store/categories?page=${page}&limit=${limit}`);
    },

    create: async (data: StoreCategoryFormData) => {
      return apiCallWithLoading<{ category: StoreCategory }>('/api/school/store/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: StoreCategoryFormData) => {
      return apiCallWithLoading<{ category: StoreCategory }>(`/api/school/store/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return apiCallWithLoading<null>(`/api/school/store/categories/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Store Items API
  const items = {
    getAll: async (page = 1, limit = 50, filters?: StoreItemFilters) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });
      
      return apiCallWithLoading<{
        items: StoreItem[];
        pagination: StorePaginationData;
        stats: StoreStatsData;
      }>(`/api/school/store/items?${params}`);
    },

    getById: async (id: string) => {
      return apiCallWithLoading<{ item: StoreItem }>(`/api/school/store/items/${id}`);
    },

    create: async (data: StoreItemFormData) => {
      return apiCallWithLoading<{ item: StoreItem }>('/api/school/store/items', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: StoreItemFormData) => {
      return apiCallWithLoading<{ item: StoreItem }>(`/api/school/store/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return apiCallWithLoading<null>(`/api/school/store/items/${id}`, {
        method: 'DELETE',
      });
    },

    uploadImage: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/school/store/image-upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },

    deleteImage: async (fileName: string) => {
      return apiCallWithLoading<null>('/api/school/store/image-upload', {
        method: 'DELETE',
        body: JSON.stringify({ fileName }),
      });
    },
  };

  // Store Orders API
  const orders = {
    getAll: async (page = 1, limit = 50, filters?: StoreOrderFilters) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });
      
      return apiCallWithLoading<{
        orders: StoreOrder[];
        pagination: StorePaginationData;
        stats: StoreStatsData;
      }>(`/api/school/store/orders?${params}`);
    },

    getById: async (id: string) => {
      return apiCallWithLoading<{ order: StoreOrder }>(`/api/school/store/orders/${id}`);
    },

    create: async (data: CreateOrderData) => {
      return apiCallWithLoading<{ order: StoreOrder }>('/api/school/store/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateStatus: async (id: string, status: string, paymentStatus?: string, paymentMethod?: string, paymentReference?: string, notes?: string) => {
      return apiCallWithLoading<{ order: StoreOrder }>(`/api/school/store/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          paymentStatus,
          paymentMethod,
          paymentReference,
          notes,
        }),
      });
    },
  };

  // Stock Requests API
  const stockRequests = {
    getAll: async (page = 1, limit = 50, filters?: StockRequestFilters) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });
      
      return apiCallWithLoading<{
        requests: StockRequest[];
        pagination: StorePaginationData;
        stats: StoreStatsData;
      }>(`/api/school/store/stock-requests?${params}`);
    },

    create: async (data: StockRequestFormData) => {
      return apiCallWithLoading<{ request: StockRequest }>('/api/school/store/stock-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateStatus: async (requestId: string, status: string) => {
      return apiCallWithLoading<{ request: StockRequest }>('/api/school/store/stock-requests', {
        method: 'PUT',
        body: JSON.stringify({ requestId, status }),
      });
    },
  };

  // Hire Records API
  const hireRecords = {
    getAll: async (page = 1, limit = 50, status?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });
      
      return apiCallWithLoading<{
        records: HireRecord[];
        pagination: StorePaginationData;
        stats: StoreStatsData;
      }>(`/api/school/store/hire-records?${params}`);
    },

    processReturn: async (recordId: string, actualReturnDate: string, notes?: string, depositReturned?: boolean, lateFees?: number) => {
      return apiCallWithLoading<{ record: HireRecord }>(`/api/school/store/hire-records/${recordId}/return`, {
        method: 'POST',
        body: JSON.stringify({
          actualReturnDate,
          notes,
          depositReturned,
          lateFees,
        }),
      });
    },
  };

  return {
    loading,
    error,
    categories,
    items,
    orders,
    stockRequests,
    hireRecords,
  };
}
