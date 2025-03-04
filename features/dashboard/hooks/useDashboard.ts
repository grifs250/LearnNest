"use client";

import { useState, useEffect } from 'react';
// import { auth, db } from "@/lib/firebase/client";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const router = useRouter();
  const { user, isLoaded: clerkLoaded } = useUser();
  const { supabase, isLoading: supabaseLoading } = useClerkSupabase();

  useEffect(() => {
    // Wait for both Clerk and Supabase to load
    if (!clerkLoaded || supabaseLoading || !supabase) return;

    const checkUserRole = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, is_teacher')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
          return;
        }

        // Check if user is a teacher based on role or is_teacher field
        setIsTeacher(data?.role === 'teacher' || !!data?.is_teacher);
      } catch (error) {
        console.error('Error in useDashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [router, user, clerkLoaded, supabase, supabaseLoading]);

  return { loading: loading || !clerkLoaded || supabaseLoading || !supabase, isTeacher };
} 