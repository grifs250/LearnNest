'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-8">
        {user?.role === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
    </ProtectedRoute>
  );
} 