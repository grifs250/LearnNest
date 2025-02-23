"use client";

import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pārbaudiet savu e-pastu
          </h2>
          <p className="text-gray-600 mb-8">
            Mēs nosūtījām jums e-pastu ar verifikācijas saiti. Lūdzu, pārbaudiet savu e-pastu un noklikšķiniet uz saites, lai apstiprinātu savu kontu.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Nesaņēmāt e-pastu? Pārbaudiet savu mēstuļu mapi.
            </p>
            <Link 
              href="/login" 
              className="text-primary hover:text-primary-focus underline"
            >
              Atgriezties uz pieteikšanās lapu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 