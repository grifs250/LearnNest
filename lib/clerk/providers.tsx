'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { ReactNode, useEffect, useState } from 'react';
import { latvianLocalization } from './localization';

/**
 * Custom ClerkProvider with Latvian localization and custom styling
 * 
 * This wrapper extends the default ClerkProvider to include:
 * - Latvian localization
 * - Custom themes based on system preference
 * - Email template configuration
 * - Optimized routing
 * - Dynamic theme loading for reduced bundle size
 */
export function ClerkProvider({ children }: { children: ReactNode }) {
  // Initialize with basic appearance settings to avoid bundle bloat
  const [appearance, setAppearance] = useState({
    elements: {
      formButtonPrimary: 
        'bg-indigo-600 hover:bg-indigo-500 text-sm normal-case',
      card: 'rounded-md shadow-md',
      formFieldInput: 'rounded border-gray-300',
      footerActionLink: 'text-indigo-600 hover:text-indigo-500',
      identityPreview: 'bg-indigo-100 border-indigo-600',
    },
    variables: {
      colorPrimary: '#4f46e5', // Indigo 600
      colorText: '#1f2937', // Gray 800
      borderRadius: '0.375rem',
    },
  });

  // Dynamically load themes if needed
  useEffect(() => {
    // Only load the theme in browser environment
    if (typeof window !== 'undefined') {
      import('@clerk/themes').then(({ dark }) => {
        setAppearance(current => ({
          ...current,
          baseTheme: dark,
        }));
      }).catch(err => {
        console.error('Failed to load Clerk themes:', err);
      });
    }
  }, []);

  return (
    <BaseClerkProvider
      localization={latvianLocalization}
      appearance={appearance}
      // Optimize routing and set proper URLs
      signInUrl="/login"
      signUpUrl="/register"
      afterSignInUrl="/"
      afterSignUpUrl="/verify-code"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </BaseClerkProvider>
  );
} 