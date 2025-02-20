'use client';

import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface ApiCallOptions {
  maxRetries?: number;
  retryDelay?: number;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface ApiCallState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  retryCount: number;
}

export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    successMessage,
    errorMessage,
    showSuccessToast = false,
    showErrorToast = true,
  } = options;

  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    error: null,
    isLoading: false,
    retryCount: 0,
  });

  const { success, error: showError } = useToast();

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await apiFunction(...args);
        setState({
          data: result,
          error: null,
          isLoading: false,
          retryCount: 0,
        });

        if (showSuccessToast && successMessage) {
          success(successMessage);
        }

        return result;
      } catch (err) {
        const error = err as Error;
        const shouldRetry = state.retryCount < maxRetries;

        if (shouldRetry) {
          // Retry after delay
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          setState(prev => ({
            ...prev,
            retryCount: prev.retryCount + 1,
          }));
          return execute(...args);
        }

        setState({
          data: null,
          error,
          isLoading: false,
          retryCount: 0,
        });

        if (showErrorToast) {
          showError(errorMessage || error.message);
        }

        throw error;
      }
    },
    [
      apiFunction,
      maxRetries,
      retryDelay,
      state.retryCount,
      successMessage,
      errorMessage,
      showSuccessToast,
      showErrorToast,
      success,
      showError,
    ]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      retryCount: 0,
    });
  }, []);

  return {
    execute,
    reset,
    ...state,
  };
} 