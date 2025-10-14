// src/hooks/useReceiptsAPI.ts
import { useState, useCallback } from 'react';
import { ReceiptTemplate, ReceiptTemplateForm, FeeCategory } from '@/types/receipt';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ReceiptsAPIResponse {
  templates: ReceiptTemplate[];
}

interface ReceiptAPIResponse {
  template: ReceiptTemplate;
}

interface CategoriesAPIResponse {
  categories: FeeCategory[];
}

export function useReceiptsAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async <T>(
    requestFn: () => Promise<Response>
  ): Promise<APIResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await requestFn();
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getAll = useCallback(async (): Promise<APIResponse<ReceiptsAPIResponse>> => {
    return handleRequest<ReceiptsAPIResponse>(() => 
      fetch('/api/school/receipts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  }, []);

  const getById = useCallback(async (id: string): Promise<APIResponse<ReceiptAPIResponse>> => {
    return handleRequest<ReceiptAPIResponse>(() => 
      fetch(`/api/school/receipts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  }, []);

  const create = useCallback(async (template: ReceiptTemplateForm): Promise<APIResponse<ReceiptAPIResponse>> => {
    return handleRequest<ReceiptAPIResponse>(() => 
      fetch('/api/school/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })
    );
  }, []);

  const update = useCallback(async (id: string, template: ReceiptTemplateForm): Promise<APIResponse<ReceiptAPIResponse>> => {
    return handleRequest<ReceiptAPIResponse>(() => 
      fetch(`/api/school/receipts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })
    );
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<APIResponse<null>> => {
    return handleRequest<null>(() => 
      fetch(`/api/school/receipts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  }, []);

  const getAvailableCategories = useCallback(async (): Promise<APIResponse<CategoriesAPIResponse>> => {
    return handleRequest<CategoriesAPIResponse>(() => 
      fetch('/api/school/receipts/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  }, []);

  const uploadLogo = useCallback(async (file: File): Promise<APIResponse<{ logo_url: string; fileName: string }>> => {
    return handleRequest<{ logo_url: string; fileName: string }>(() => {
      const formData = new FormData();
      formData.append('file', file);
      
      return fetch('/api/school/receipt-logo-upload', {
        method: 'POST',
        body: formData,
      });
    });
  }, []);

  const deleteLogo = useCallback(async (fileName: string): Promise<APIResponse<null>> => {
    return handleRequest<null>(() => 
      fetch('/api/school/receipt-logo-upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      })
    );
  }, []);

  return {
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    delete: deleteTemplate,
    getAvailableCategories,
    uploadLogo,
    deleteLogo,
  };
}
