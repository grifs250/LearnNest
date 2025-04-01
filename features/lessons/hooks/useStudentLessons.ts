"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import dbService from '@/lib/supabase/db';
import { BookingWithDetails, BookingStatus, StudentLesson } from '@/lib/types';
import { toast } from "react-hot-toast";

export function useStudentLessons() {
  const { isLoaded, user } = useUser();
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLessons = async () => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookings = await dbService.getBookings({ 
        student_id: user.id,
      });

      // Transform bookings into student lessons
      const transformedLessons = bookings.map(booking => {
        // Extract data from the booking and related entities
        const scheduleData = booking.schedule;
        
        // Safely access lesson data with type assertion 
        const lessonData = booking.lesson as any;
        
        // Format date and time from schedule
        const scheduleDate = scheduleData ? new Date(scheduleData.start_time) : new Date();
        const dateStr = scheduleDate.toLocaleDateString('lv-LV', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const timeStr = scheduleDate.toLocaleTimeString('lv-LV', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Create StudentLesson 
        return {
          id: booking.id,
          bookingId: booking.id,
          subject: lessonData?.title || 'Nezināms priekšmets',
          teacherName: lessonData?.teacher?.full_name || 'Nezināms pasniedzējs',
          teacherId: lessonData?.teacher?.id || '',
          date: dateStr,
          time: timeStr,
          status: booking.status,
          category: '', // Will be updated if needed with category data
          subjectId: lessonData?.id || ''
        };
      });

      setLessons(transformedLessons);
    } catch (err) {
      console.error('Error fetching student lessons:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch lessons'));
      toast.error('Neizdevās ielādēt nodarbības. Lūdzu, mēģiniet vēlāk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchLessons();
    }
  }, [isLoaded, user]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons
  };
} 