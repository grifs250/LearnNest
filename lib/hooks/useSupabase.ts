import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import type { Database } from '@/types/supabase.types'
import type { User } from '@/features/auth/types'

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
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
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { supabase, user, profile: user?.profile ?? null, loading, signOut }
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