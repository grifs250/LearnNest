import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Clerk ID for use with Supabase
 * 
 * Clerk IDs use `user_` prefix, but sometimes we need just the ID part.
 * This function ensures the ID is correctly formatted for database operations.
 * 
 * @param clerkId The Clerk user ID to format
 * @returns The formatted ID
 */
export function formatClerkId(clerkId: string): string {
  // If the ID already has a prefix like user_, remove it
  if (clerkId.includes('_')) {
    return clerkId.split('_')[1];
  }
  
  return clerkId;
} 