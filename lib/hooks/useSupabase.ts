import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import type { Database } from '@/types/supabase.types'
import type { AuthUser } from '@/features/auth/types'

export function useSupabase() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user ? { uid: user.id, email: user.email || null, displayName: user.user_metadata?.full_name || null, emailVerified: !!user.email_confirmed_at, isTeacher: user.user_metadata?.role === 'teacher', status: 'active', createdAt: new Date(user.created_at) } : null)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initial user fetch
    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? {
        uid: session.user.id,
        email: session.user.email || null,
        displayName: session.user.user_metadata?.full_name || null,
        emailVerified: !!session.user.email_confirmed_at,
        isTeacher: session.user.user_metadata?.role === 'teacher',
        status: 'active',
        createdAt: new Date(session.user.created_at)
      } : null);
      setLoading(false);
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Return user without profile reference
  return { supabase, user, loading, signOut };
}

// export type User = {
//   id: string;
//   email: string;
//   emailVerified: boolean;
//   fullName: string;
//   role: UserRole;
//   createdAt: string;
//   updatedAt: string;
//   profile?: Profile;
//   metadata?: Record<string, any>;
// }; 