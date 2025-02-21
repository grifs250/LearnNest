"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/db';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserProfile } from '@/types/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth');
          return;
        }

        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*, user:users!inner(*)')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;

        if (!userProfile) {
          router.push('/profile/setup');
          return;
        }

        setProfile({
          id: userProfile.id,
          user_id: userProfile.user_id,
          full_name: userProfile.full_name,
          bio: userProfile.bio || '',
          avatar_url: userProfile.avatar_url,
          role: userProfile.user.role,
          created_at: userProfile.created_at,
          updated_at: userProfile.updated_at
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-base-200 rounded-lg p-8">
            <div className="flex items-center gap-6">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center">
                  <span className="text-3xl">{profile.full_name[0]}</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                <p className="text-base-content/70 mt-1 capitalize">{profile.role}</p>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-base-content/70">{profile.bio}</p>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => router.push('/profile/edit')}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
              {profile.role === 'teacher' && (
                <button
                  onClick={() => router.push('/profile/calendar')}
                  className="btn btn-outline"
                >
                  Manage Calendar
                </button>
              )}
            </div>
          </div>

          {/* Additional sections based on role */}
          {profile.role === 'teacher' ? (
            <div className="mt-8 grid gap-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">My Lessons</h2>
                {/* Add TeacherLessons component here */}
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                {/* Add TeacherReviews component here */}
              </section>
            </div>
          ) : (
            <div className="mt-8 grid gap-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
                {/* Add StudentBookings component here */}
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-4">Favorite Teachers</h2>
                {/* Add FavoriteTeachers component here */}
              </section>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
