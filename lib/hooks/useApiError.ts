'use client';

import { useState } from 'react';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = (err: unknown) => {
    console.error('API Error:', err);
    
    if (err instanceof Error) {
      setError({
        message: err.message,
        code: (err as any).code,
        status: (err as any).status,
      });
    } else if (typeof err === 'string') {
      setError({ message: err });
    } else {
      setError({ message: 'An unexpected error occurred' });
    }
  };

  const clearError = () => setError(null);

  return {
    error,
    setError,
    handleError,
    clearError,
  };
} 