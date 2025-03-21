'use client';

import { useEffect } from 'react';

interface CategoryErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoryError({ error, reset }: CategoryErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Category page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body text-center">
          <h2 className="card-title text-2xl text-error mb-4">
            Kaut kas nogāja greizi
          </h2>
          
          <p className="text-base-content/70 mb-6">
            Neizdevās ielādēt kategorijas informāciju. Lūdzu, mēģiniet vēlreiz.
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              className="btn btn-primary"
            >
              Mēģināt vēlreiz
            </button>
            
            <a
              href="/"
              className="btn btn-outline"
            >
              Uz sākumlapu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 