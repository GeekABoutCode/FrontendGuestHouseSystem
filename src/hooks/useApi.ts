import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../lib/api';

// Generic API hook for handling loading states and errors
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Hook for API operations that don't need automatic execution
export function useApiOperation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
}

// Hook for managing API state with success/error notifications
export function useApiWithNotifications<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>, successMessage?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await apiCall();
      setData(result);
      if (successMessage) {
        setSuccess(successMessage);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { 
    data, 
    loading, 
    error, 
    success, 
    execute, 
    clearNotifications 
  };
}
