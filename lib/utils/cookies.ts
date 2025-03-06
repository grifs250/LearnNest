/**
 * Simple cookie utilities for fast UI state management
 * These are used to make the UI load instantly while full auth loads in background
 */

// Cookie names
export const AUTH_COOKIE_NAME = 'mt_auth_state';
export const THEME_COOKIE_NAME = 'mt_theme';
export const USER_ROLE_COOKIE = 'mt_role';

/**
 * Set a cookie with the specified name and value
 */
export function setCookie(name: string, value: string, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
}

/**
 * Remove a cookie by name
 */
export function removeCookie(name: string) {
  document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax`;
}

/**
 * Check if user is logged in based on cookie
 * This is ONLY for UI purposes and doesn't replace real auth checks
 */
export function isLoggedInFromCookie(): boolean {
  return getCookie(AUTH_COOKIE_NAME) === 'true';
}

/**
 * Get user role from cookie
 * This is ONLY for UI purposes and doesn't replace real auth checks
 */
export function getUserRoleFromCookie(): 'student' | 'teacher' | null {
  const role = getCookie(USER_ROLE_COOKIE);
  if (role === 'student' || role === 'teacher') return role;
  return null;
} 