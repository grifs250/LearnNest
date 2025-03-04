'use client';

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { AuthUser, UserRole } from '@/features/auth/types/types'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const { user, loading, signOut } = useSupabase()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const isAuthenticated = !!user
  const isTeacher = (user as AuthUser)?.user_metadata?.role === 'teacher'
  const isStudent = (user as AuthUser)?.user_metadata?.role === 'student'
  const isAdmin = (user as AuthUser)?.user_metadata?.role === 'admin'

  const checkRole = (role: UserRole) => {
    return (user as AuthUser)?.user_metadata?.role === role
  }

  return {
    isLoading,
    session,
    supabase,
    user,
    loading,
    isAuthenticated,
    isTeacher,
    isStudent,
    isAdmin,
    checkRole,
    signOut,
  }
} 