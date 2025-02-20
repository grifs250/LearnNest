'use client';

import { useEffect } from 'react';

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export function LessonErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('Lesson error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <h2 className="text-2xl font-bold mb-4">Kļūda ielādējot nodarbību!</h2>
      <button
        className="btn btn-primary"
        onClick={reset}
      >
        Mēģināt vēlreiz
      </button>
    </div>
  );
} 