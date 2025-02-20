'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isTeacher, isStudent, profile, isLoading } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome back, {profile?.full_name}!
        </h1>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : isTeacher ? (
          <TeacherDashboard />
        ) : isStudent ? (
          <StudentDashboard />
        ) : (
          <div className="text-center">
            <p className="text-xl">Please complete your profile setup</p>
            <button
              onClick={() => router.push('/profile/setup')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
            >
              Setup Profile
            </button>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
} 