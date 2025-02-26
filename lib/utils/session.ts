import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Session } from '@supabase/supabase-js';

export async function getSessionOrRedirect() {
  const supabase = createClientComponentClient();
  
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }

    if (!session) {
      // Try to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        return null;
      }

      return refreshedSession;
    }

    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function validateSession(session: Session | null) {
  if (!session) return false;
  
  const supabase = createClientComponentClient();
  
  try {
    // Verify the session is still valid
    const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
    return !error && !!user;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
} 