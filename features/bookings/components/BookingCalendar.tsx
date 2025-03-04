'use client';

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabase } from "@/lib/hooks/useClerkSupabase";
import { useState } from "react";
import { toast } from "react-hot-toast";
import type { BookingStatus } from "../types";

interface BookingCalendarProps {
  lessonId: string;
}

export function BookingCalendar({ lessonId }: BookingCalendarProps) {
  const router = useRouter();
  const { user } = useUser();
  const { supabase, isLoading } = useClerkSupabase();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<BookingStatus>('pending');

  const handleBooking = async (date: Date) => {
    if (!user) {
      toast.error('Please sign in to book a lesson');
      router.push('/login');
      return;
    }

    try {
      // First create a schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('lesson_schedules')
        .insert({
          lesson_id: lessonId,
          start_time: date.toISOString(),
          end_time: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          is_available: true
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Then create the booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          schedule_id: schedule.id,
          student_id: user.id,
          status: 'pending',
          amount: 0, // This should be set based on lesson price
          payment_status: 'pending'
        });

      if (bookingError) throw bookingError;

      toast.success('Booking request sent!');
      router.refresh();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book lesson');
    }
  };

  if (isLoading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="p-4 bg-base-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Book a Lesson</h3>
      {/* Add your calendar UI here */}
      <div className="flex justify-end mt-4">
        <button 
          className="btn btn-primary"
          onClick={() => selectedDate && handleBooking(selectedDate)}
          disabled={!selectedDate}
        >
          Book Now
        </button>
      </div>
    </div>
  );
} 