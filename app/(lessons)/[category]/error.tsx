'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LessonDetails } from '@/features/lessons/components';
import { createClient } from '@/lib/supabase/client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Kaut kas nogāja greizi</h2>
        <p className="text-gray-600">
          {error.message || 'Radās kļūda. Lūdzu, mēģiniet vēlreiz.'}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => reset()}
            className="btn btn-primary"
          >
            Mēģināt vēlreiz
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn btn-outline"
          >
            Atgriezties sākumlapā
          </button>
        </div>
      </div>
    </div>
  );
} 