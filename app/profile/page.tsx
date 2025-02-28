"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/features/shared/components/ui/LoadingSpinner';
import { useSession } from '@/lib/providers/SessionProvider';
import { initializeUserProfile } from '@/lib/utils/profile';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const userProfile = await initializeUserProfile(session!);
        if (mounted) {
          setProfile(userProfile);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Profile loading error:', error);
        toast.error('Error loading profile');
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    // Only load profile when we have a session and are mounted
    if (!isSessionLoading && session && mounted) {
      loadProfile();
    } else if (!isSessionLoading && !session) {
      // If session loading is done and we have no session, redirect
      router.replace('/login');
    }

    return () => {
      mounted = false;
    };
  }, [session, isSessionLoading, router]);

  // Show loading state while session is loading or profile is loading
  if (isSessionLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show loading state while profile is not loaded
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <div className="bg-base-200 p-4 rounded-lg">
        <h2 className="text-xl mb-2">User Info</h2>
        <p>Email: {profile.email}</p>
        <p>Role: {profile.role}</p>
        <p>Name: {profile.full_name}</p>
        {profile.bio && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Bio</h3>
            <p>{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
