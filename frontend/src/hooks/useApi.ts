import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Define types for options
interface MutationOptions {
  invalidateQueries?: string | string[];
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  [key: string]: any;
}

// Generic fetch function for GET requests
const fetchData = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);
  return response.data;
};

// Hook for GET requests
export function useApiQuery<T>(
  queryKey: string | string[], 
  url: string, 
  options = {}
) {
  const queryKeyArray = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  return useQuery({
    queryKey: queryKeyArray,
    queryFn: () => fetchData<T>(url),
    ...options,
  });
}

// Hook for POST requests
export function useApiMutation<T, _R = any>(url: string, options: MutationOptions = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: T) => api.post(url, data),
    onSuccess: (data) => {
      // Invalidate and refetch queries that may have been affected
      if (options.invalidateQueries) {
        const queriesToInvalidate = Array.isArray(options.invalidateQueries)
          ? options.invalidateQueries
          : [options.invalidateQueries];
          
        queriesToInvalidate.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      // Call custom onSuccess handler if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    ...options,
  });
}

// Hook for PUT requests
export function useApiPut<T, _R = any>(url: string, options: MutationOptions = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: T) => api.put(url, data),
    onSuccess: (data) => {
      // Invalidate and refetch queries that may have been affected
      if (options.invalidateQueries) {
        const queriesToInvalidate = Array.isArray(options.invalidateQueries)
          ? options.invalidateQueries
          : [options.invalidateQueries];
          
        queriesToInvalidate.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      // Call custom onSuccess handler if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    ...options,
  });
}

// Hook for DELETE requests
export function useApiDelete<_R = any>(url: string, options: MutationOptions = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`${url}/${id}`),
    onSuccess: (data) => {
      // Invalidate and refetch queries that may have been affected
      if (options.invalidateQueries) {
        const queriesToInvalidate = Array.isArray(options.invalidateQueries)
          ? options.invalidateQueries
          : [options.invalidateQueries];
          
        queriesToInvalidate.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      // Call custom onSuccess handler if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    ...options,
  });
} 