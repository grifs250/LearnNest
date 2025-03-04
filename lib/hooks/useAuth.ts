'use client';

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { UserRole } from '@/features/auth/types/types'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const { user, isLoading: userLoading, signOut } = useSupabase()

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

  // Get role from user profile
  const userRole = user?.profile?.role || null;
  
  const isAuthenticated = !!user
  const isTeacher = userRole === 'teacher'
  const isStudent = userRole === 'student'
  const isAdmin = userRole === 'admin'

  const checkRole = (role: UserRole) => {
    return userRole === role;
  }

  return {
    isLoading: isLoading || userLoading,
    session,
    supabase,
    user,
    isAuthenticated,
    isTeacher,
    isStudent,
    isAdmin,
    checkRole,
    signOut
  }
} 