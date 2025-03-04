// Create a wrapper around Clerk's auth functionality
import { currentUser } from '@clerk/nextjs/server';

// Export a function that matches the signature of what we're using
export async function auth() {
  const user = await currentUser();
  return {
    userId: user?.id
  };
} 