/**
 * Formats a Clerk ID for use with Supabase
 * This function is used to ensure compatibility with Clerk IDs in the database
 */
export function formatClerkId(clerkId: string): string {
  // If the ID starts with 'user_', we'll keep it intact for lookup by user_id field
  if (clerkId.startsWith('user_')) {
    return clerkId;
  }
  
  // Otherwise, treat it as a regular UUID/string
  return clerkId;
} 