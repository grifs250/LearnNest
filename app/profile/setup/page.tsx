'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/providers/SupabaseProvider';
import { toast } from 'react-hot-toast';
import { PostgrestError } from '@supabase/supabase-js';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { supabase, user, loading } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and doesn't have a profile
    const checkUserAndProfile = async () => {
      if (!loading) {
        if (!user) {
          router.replace('/login');
          return;
        }

        // Check if profile already exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          router.replace('/profile');
        }
      }
    };

    checkUserAndProfile();
  }, [user, loading, router, supabase]);

  const handleSetupProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('No user session found');
      router.replace('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: (e.target as HTMLFormElement).full_name.value,
          role: user.user_metadata?.role || 'student',
          email: user.email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'lv',
          is_active: true,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Set session in localStorage to persist it
      const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      if (!refreshedSession.session) {
        throw new Error('Failed to refresh session');
      }

      // Force a hard navigation to ensure everything is reloaded properly
      window.location.href = '/profile';
    } catch (error) {
      console.error('Error creating profile:', error);
      const err = error as Error | PostgrestError;
      
      if ('message' in err && err.message === 'No session found') {
        toast.error('Session expired. Please login again.');
        router.replace('/login');
      } else {
        toast.error('Failed to create profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="max-w-md mx-auto bg-base-100 rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        
        <form onSubmit={handleSetupProfile}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              name="full_name"
              className="input input-bordered"
              required
              defaultValue={user?.user_metadata?.full_name || ''}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                Setting up...
              </>
            ) : (
              'Complete Setup'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 