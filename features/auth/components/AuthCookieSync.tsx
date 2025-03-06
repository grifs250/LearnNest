'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setCookie, removeCookie, AUTH_COOKIE_NAME, USER_ROLE_COOKIE } from '@/lib/utils/cookies';

/**
 * AuthCookieSync - Invisible component that syncs Clerk auth state to cookies
 * 
 * This component runs in the background and keeps cookies in sync with the 
 * actual auth state, allowing for instant UI rendering without waiting for
 * full auth checks to complete.
 */
export default function AuthCookieSync() {
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;
    
    if (userId) {
      // User is logged in, set cookies
      setCookie(AUTH_COOKIE_NAME, 'true');
      
      // Get user role from public metadata if available
      const userRole = user?.publicMetadata?.role as string;
      if (userRole === 'teacher' || userRole === 'student') {
        setCookie(USER_ROLE_COOKIE, userRole);
      }
    } else {
      // User is logged out, remove cookies
      removeCookie(AUTH_COOKIE_NAME);
      removeCookie(USER_ROLE_COOKIE);
    }
  }, [isAuthLoaded, isUserLoaded, userId, user?.publicMetadata?.role]);

  // This component doesn't render anything visible
  return null;
} 