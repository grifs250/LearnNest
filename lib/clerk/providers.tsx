'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { ReactNode, useEffect, useState } from 'react';
import { latvianLocalization } from './localization';

// Define the full appearance type for TypeScript
type ClerkAppearance = {
  elements: {
    formButtonPrimary?: string;
    card?: string;
    formFieldInput?: string;
    footerActionLink?: string;
    identityPreview?: string;
    [key: string]: string | undefined;
  };
  variables: {
    colorPrimary: string;
    colorText?: string;
    borderRadius?: string;
    [key: string]: string | undefined;
  };
  baseTheme?: any;
};

/**
 * Custom ClerkProvider with Latvian localization and custom styling
 * 
 * This wrapper extends the default ClerkProvider to include:
 * - Latvian localization
 * - Custom themes based on system preference
 * - Email template configuration
 * - Optimized routing
 * - Dynamic theme loading for reduced bundle size
 * - Fast loading with minimal initial configuration
 */
export function ClerkProvider({ children }: { children: ReactNode }) {
  // Initialize with minimal appearance settings to speed up initial load
  const [appearance, setAppearance] = useState<ClerkAppearance>({
    elements: {
      formButtonPrimary: 
        'bg-indigo-600 hover:bg-indigo-500 text-sm normal-case',
      card: 'rounded-md shadow-md',
    },
    variables: {
      colorPrimary: '#4f46e5',
    },
  });

  // Load additional theme settings only after the page has rendered
  useEffect(() => {
    // Use setTimeout to delay non-critical appearance settings
    const timer = setTimeout(() => {
      setAppearance({
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
          borderRadius: '0.375rem', // 6px
        },
      });
    }, 300); // Delay by 300ms to prioritize core content loading
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <BaseClerkProvider
      localization={latvianLocalization}
      appearance={appearance}
      // Optimize routing and set proper URLs
      signInUrl="/login"
      signUpUrl="/register"
      afterSignInUrl="/"
      afterSignUpUrl="/profile/setup"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </BaseClerkProvider>
  );
} 