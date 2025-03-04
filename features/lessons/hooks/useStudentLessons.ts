"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import dbService from '@/lib/supabase/db';
import { BookingWithDetails, BookingStatus } from '@/types/database';
import { toast } from "react-hot-toast";

// Define a StudentLesson type that represents what's shown in the UI
export interface StudentLesson {
  id: string;
  bookingId: string;
  subject: string;
  teacherName: string;
  teacherId: string;
  date: string;
  time: string;
  status: BookingStatus;
  category: string;
  subjectId: string;
}

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
        const lessonData = booking.lesson;
        
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

        return {
          id: booking.id,
          bookingId: booking.id,
          subject: lessonData?.title || 'Nezināms priekšmets',
          teacherName: lessonData?.teacher?.full_name || 'Nezināms pasniedzējs',
          teacherId: '',  // Will need to get this from the lesson data later
          date: dateStr,
          time: timeStr,
          status: booking.status,
          category: '', // Will need to be updated if needed
          subjectId: ''  // Will need to get this from the lesson data later
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