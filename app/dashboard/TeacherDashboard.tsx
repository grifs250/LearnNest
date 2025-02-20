'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApiError } from '@/lib/hooks/useApiError';
import { useEffect, useState } from 'react';
import { Lesson, Booking } from '@/types/supabase';
import { getTeacherLessons, getTeacherBookings } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

function TeacherDashboardContent() {
  const { user } = useAuth();
  const { error, handleError, clearError } = useApiError();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      if (user) {
        const [lessonsData, bookingsData] = await Promise.all([
          getTeacherLessons(user.id),
          getTeacherBookings(user.id)
        ]);
        setLessons(lessonsData);
        setBookings(bookingsData);
        clearError();
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, handleError, clearError]);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 mt-1">{error.message}</p>
        <button
          onClick={() => {
            clearError();
            setLoading(true);
            loadData();
          }}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Lessons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Lessons</h2>
        {lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium">{lesson.title}</h3>
                <p className="text-gray-600">{lesson.description}</p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    Duration: {lesson.duration} minutes
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    Price: ${lesson.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No lessons created yet.</p>
        )}
      </section>

      {/* Recent Bookings */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Bookings</h2>
        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {booking.schedule?.lesson?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Student: {booking.student?.profile?.full_name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    Date: {new Date(booking.schedule?.start_time || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No bookings yet.</p>
        )}
      </section>
    </div>
  );
}

export default function TeacherDashboard() {
  return (
    <ErrorBoundary>
      <TeacherDashboardContent />
    </ErrorBoundary>
  );
} 