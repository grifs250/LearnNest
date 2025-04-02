import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProfileByUserId } from '@/lib/supabase/server';

interface ProfileRedirectProps {
  params: {
    userId: string;
  };
}

// Special case paths that should NOT be redirected (handled elsewhere)
const SPECIAL_PATHS = ['setup'];

export default async function ProfileRedirect({ params }: ProfileRedirectProps) {
  // Extract userId using destructuring to avoid Next.js "params should be awaited" error
  const { userId } = params;
  
  console.log(`🔄 ProfileRedirect handling /profile/${userId}`);
  
  // Don't redirect special paths
  if (SPECIAL_PATHS.includes(userId)) {
    console.log(`Special path detected: /profile/${userId} - not redirecting`);
    return null; // Let the appropriate page handle it
  }
  
  // Immediately do a hard redirect for all non-special paths
  // This ensures we don't try any complex logic that might fail
  console.log(`⚠️ Forcing hard redirect from /profile/${userId} to /profiles/${userId}`);
  
  // Use return redirect to stop execution and ensure the redirect happens
  return redirect(`/profiles/${userId}`);
} 