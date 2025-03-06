'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useTheme } from '@/app/themeProvider';
import { setCookie, getCookie, removeCookie } from '@/lib/utils/cookies';

/**
 * ClientInitializer - Client-side component that initializes app state
 * 
 * This component handles:
 * 1. Fast auth state detection using cookies and localStorage
 * 2. Theme state persistence using cookies
 * 3. Any other client-side setup needed
 * 
 * No visible UI is rendered by this component
 */
export default function ClientInitializer() {
  const { isLoaded: isAuthLoaded, userId, sessionId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  // Set up fast auth detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Store auth state in localStorage for even faster access
      // This helps with initial page load before cookies are processed
      if (sessionId) {
        localStorage.setItem('mt_auth_state', 'true');
        localStorage.setItem('hasSession', 'true'); // Backward compatibility
      } else if (isAuthLoaded && !sessionId) {
        localStorage.removeItem('mt_auth_state');
        localStorage.removeItem('hasSession');
      }
      
      // Set auth cookie for communication between components
      if (isAuthLoaded) {
        if (userId) {
          setCookie('mt_auth_state', 'true');
          
          // Get user role from public metadata if available
          const userRole = user?.publicMetadata?.role as string;
          if (userRole === 'teacher' || userRole === 'student') {
            setCookie('mt_role', userRole);
          }
        } else {
          removeCookie('mt_auth_state');
          removeCookie('mt_role');
        }
      }
    }
  }, [isAuthLoaded, sessionId, userId, user?.publicMetadata?.role]);

  // Theme synchronization with cookies
  useEffect(() => {
    if (typeof window !== 'undefined' && theme) {
      // Save theme to cookie whenever it changes
      setCookie('theme', theme);
      
      // Ensure the HTML attribute is set
      document.documentElement.setAttribute('data-theme', theme);
      
      // Dispatch a custom event to inform other components
      window.dispatchEvent(new Event('themechange'));
    }
  }, [theme]);

  // This component doesn't render anything visible
  return null;
} 