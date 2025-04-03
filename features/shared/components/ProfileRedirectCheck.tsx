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
    '/profile/setup',   // Profile setup page
    '/login',           // Auth pages
    '/register',
    '/verify-email',
    '/verify-code',
    '/api',             // API endpoints
    '/buj',             // FAQ/Help pages
    '/',                // Landing page
    '/profiles',        // Public profile pages
    '/subjects'         // Subject listings
  ];
  
  // System paths that are always excluded (including in production)
  const systemPaths = [
    '/debug',           // Debug tools
    '/admin',           // Admin tools
    '/system'           // System pages
  ];
  
  // Special development paths (only excluded in development)
  const devPaths = process.env.NODE_ENV === 'development' ? [
    '/playground',      // Component playground
    '/test'             // Test pages
  ] : [];
  
  // Combine all excluded paths
  const allExcludedPaths = [...excludedPaths, ...systemPaths, ...devPaths];
  
  // Check if current path is in the excluded list (including paths that start with excluded paths)
  const isExcludedPath = allExcludedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Log debug mode for system paths in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const isSystemPath = systemPaths.some(path => 
        pathname === path || pathname.startsWith(`${path}/`)
      );
      
      if (isSystemPath) {
        console.log('🛠️ Debug mode active:', pathname);
      }
    }
  }, [pathname]);
  
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