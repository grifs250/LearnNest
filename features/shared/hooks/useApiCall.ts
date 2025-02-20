import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { errorTracker } from '@/features/monitoring/utils/error-tracking';

interface ApiCallState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseApiCallOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  trackError?: boolean;
}

export function useApiCall<T = any>() {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const { success, error: showError } = useToast();

  const execute = useCallback(
    async (
      apiFunction: () => Promise<T>,
      options: UseApiCallOptions = {
        showSuccessToast: false,
        showErrorToast: true,
        trackError: true,
      }
    ) => {
      const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = 'Operation completed successfully',
        errorMessage = 'An error occurred. Please try again.',
        trackError = true,
      } = options;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiFunction();
        setState({ data: result, error: null, isLoading: false });

        if (showSuccessToast) {
          success(successMessage);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        setState({ data: null, error, isLoading: false });

        if (showErrorToast) {
          showError(errorMessage);
        }

        if (trackError) {
          errorTracker.captureError(error);
        }

        throw error;
      }
    },
    [success, showError]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
} 