'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Component that checks if a user's profile needs setup and redirects accordingly
 * 
 * Excludes certain paths from the redirect check (like the setup page itself)
 */
export default function ProfileRedirectCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  
  // Paths that should be excluded from the redirect check
  const excludedPaths = [
    '/profile/setup',
    '/login',
    '/register',
    '/verify-email',
    '/verify-code',
    '/api',
    '/buj',
    '/',
    '/profiles',
    '/subjects'
  ];
  
  // Check if current path is in the excluded list (including paths that start with excluded paths)
  const isExcludedPath = excludedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  useEffect(() => {
    // Skip checking for excluded paths or if auth isn't loaded yet
    if (isExcludedPath || !isLoaded) {
      setIsChecking(false);
      return;
    }
    
    // If user is signed in, check their profile status
    if (user) {
      // Check explicit profile_needs_setup flag first
      const needsSetup = user.unsafeMetadata?.profile_needs_setup;
      
      // Fallback to checking profile_completed flag
      const profileCompleted = user.unsafeMetadata?.profile_completed === true;
      
      // Redirect if either profile_needs_setup is true or profile_completed is not true
      if (needsSetup === true || profileCompleted !== true) {
        console.log('Redirecting to profile setup:', {
          needsSetup,
          profileCompleted,
          path: pathname
        });
        
        // Redirect to profile setup
        router.push('/profile/setup');
      } else {
        setIsChecking(false);
      }
    } else {
      // Not signed in, no need to check or redirect
      setIsChecking(false);
    }
  }, [isLoaded, user, router, pathname, isExcludedPath]);
  
  // Also exclude public paths from the loading indicator
  if (isChecking && !isExcludedPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content">Pārbauda profila statusu...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 