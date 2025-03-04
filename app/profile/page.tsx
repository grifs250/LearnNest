"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/features/shared/components/ui/LoadingSpinner';
import { useUser } from '@clerk/nextjs';
import { useAuth } from '@/features/auth';
import { initializeUserProfile } from '@/lib/utils/profile';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/database';
import type { SupabaseError } from '@/lib/types/supabase';
import { StudentBookings, TeacherBookings } from '@/features/bookings/components';
import { formatClerkId } from '@/lib/utils/user';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { isTeacher } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      const supabase = createClient();
      const formattedId = formatClerkId(user.id);
      
      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', formattedId)
          .single();

        if (fetchError) {
          const error = fetchError as SupabaseError;
          console.error('Profile fetch error:', {
            code: error.code,
            message: error.message,
            details: error.details
          });

          if (error.code === 'PGRST116') {
            try {
              const newProfile = await initializeUserProfile(user);
              // Create a proper UserProfile object with all required fields
              const userProfile: UserProfile = {
                id: newProfile.id,
                user_id: newProfile.user_id,
                email: newProfile.email,
                full_name: newProfile.full_name,
                profile_type: newProfile.role as 'student' | 'teacher' | 'admin',
                avatar_url: newProfile.avatar_url || null,
                url_slug: newProfile.id,
                page_title: newProfile.full_name,
                page_description: newProfile.bio || null,
                teacher_bio: null,
                teacher_rate: null,
                teacher_experience_years: null,
                teacher_specializations: null,
                teacher_education: null,
                teacher_certificates: null,
                student_goals: null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: null
              };
              
              setProfile(userProfile);
              toast.success('Profile created successfully');
            } catch (initError) {
              console.error('Profile initialization error:', initError);
              toast.error('Failed to create profile');
            }
          } else {
            toast.error(`Failed to load profile: ${error.message}`);
          }
        } else if (existingProfile) {
          setProfile(existingProfile as UserProfile);
        }
      } catch (error) {
        const err = error as Error;
        console.error('Profile error:', {
          message: err.message,
          stack: err.stack
        });
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, user, router]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Router will handle redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Info */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Profils</h1>
        
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-24 rounded-full">
                <img 
                  src={user.imageUrl || '/default-avatar.png'} 
                  alt={user.fullName || 'Profils'} 
                />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.full_name}</h2>
              <p className="text-gray-600">{user.emailAddresses[0].emailAddress}</p>
              <span className="badge badge-primary mt-2">
                {isTeacher ? 'Pasniedzējs' : 'Skolēns'}
              </span>
            </div>
          </div>

          <div className="divider"></div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Pamatinformācija</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-600">E-pasts: </span>
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Teacher Specific Info */}
            {isTeacher && profile.profile_type === 'teacher' && (
              <div>
                <h3 className="font-semibold mb-2">Pasniedzēja informācija</h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Izglītība: </span>
                    {profile.teacher_education ? profile.teacher_education.join(', ') : 'Nav norādīta'}
                  </p>
                  <p>
                    <span className="text-gray-600">Pieredze: </span>
                    {profile.teacher_experience_years ? `${profile.teacher_experience_years} gadi` : 'Nav norādīta'}
                  </p>
                  {profile.teacher_specializations && (
                    <p>
                      <span className="text-gray-600">Specializācijas: </span>
                      {profile.teacher_specializations.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6">
            <button
              onClick={() => router.push('/profile/edit')}
              className="btn btn-primary"
            >
              Rediģēt profilu
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">
          {isTeacher ? 'Manas nodarbības' : 'Manas rezervācijas'}
        </h2>
        
        {isTeacher ? (
          <div>
            {/* Using userId instead of teacherId to match the component's expected props */}
            {profile && <StudentBookings userId={formatClerkId(user.id)} />}
          </div>
        ) : (
          <StudentBookings userId={formatClerkId(user.id)} />
        )}
      </div>
    </div>
  );
}
