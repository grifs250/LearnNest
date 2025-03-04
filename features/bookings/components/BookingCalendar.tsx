'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { formatClerkId } from '@/lib/utils/helpers';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import type { LocalBookingStatus } from "../types";

interface BookingCalendarProps {
  lessonId: string;
  teacherId: string;
  price: number;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  lessonId,
  teacherId,
  price
}) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { supabase } = useClerkSupabase();

  useEffect(() => {
    // Generate dates for the next 30 days
    const generateDates = () => {
      const today = new Date();
      const nextDates = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        nextDates.push(date);
      }
      setDates(nextDates);
    };

    generateDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchTimeSlots = async (date: Date) => {
    setLoading(true);
    try {
      if (!supabase) {
        toast.error('Database connection not available');
        setLoading(false);
        return;
      }

      // Format the date to YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      // Get teacher's available time slots for the selected date
      const { data, error } = await supabase
        .from('lesson_schedules')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_available', true)
        .gte('start_time', `${formattedDate}T00:00:00`)
        .lte('start_time', `${formattedDate}T23:59:59`)
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      // Extract time slots
      const slots = data?.map(slot => {
        const time = new Date(slot.start_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        return {
          id: slot.id,
          time,
          start_time: slot.start_time
        };
      }) || [];

      setTimeSlots(slots.map(slot => slot.start_time));
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to book a lesson');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      if (!supabase) {
        toast.error('Database connection not available');
        setLoading(false);
        return;
      }

      // Find the schedule ID for the selected time slot
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('lesson_schedules')
        .select('id')
        .eq('lesson_id', lessonId)
        .eq('start_time', selectedTimeSlot)
        .eq('is_available', true)
        .single();

      if (scheduleError) {
        throw scheduleError;
      }

      if (!scheduleData) {
        throw new Error('Selected time slot is no longer available');
      }

      const studentId = formatClerkId(user.id);
      const scheduleId = scheduleData.id;

      // Create a booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          student_id: studentId,
          lesson_schedule_id: scheduleId,
          status: 'pending' as LocalBookingStatus,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          amount: price
        });

      if (bookingError) {
        throw bookingError;
      }

      // Update schedule availability
      const { error: updateError } = await supabase
        .from('lesson_schedules')
        .update({ is_available: false })
        .eq('id', scheduleId);

      if (updateError) {
        throw updateError;
      }

      toast.success('Lesson booked successfully');
      router.push('/student/bookings');
    } catch (error) {
      console.error('Error booking lesson:', error);
      toast.error('Failed to book lesson');
    } finally {
      setLoading(false);
    }
  };

  const getDateClasses = (date: Date) => {
    const currentDate = new Date();
    if (date < currentDate && date.getDate() !== currentDate.getDate()) {
      return 'btn-disabled';
    }
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      return 'btn-primary';
    }
    return 'btn-outline';
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Rezervēt nodarbību</h2>
        
        <div className="my-4">
          <h3 className="text-lg font-medium mb-2">Izvēlieties datumu:</h3>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {dates.map((date, index) => (
              <button
                key={index}
                className={`btn btn-sm ${getDateClasses(date)}`}
                onClick={() => setSelectedDate(date)}
                disabled={date < new Date() && date.getDate() !== new Date().getDate()}
              >
                {date.toLocaleDateString('lv', { day: 'numeric', month: 'short' })}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="my-4">
            <h3 className="text-lg font-medium mb-2">Izvēlieties laiku:</h3>
            {loading ? (
              <div className="flex justify-center">
                <div className="loading loading-spinner loading-md"></div>
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`btn btn-sm ${selectedTimeSlot === slot ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedTimeSlot(slot)}
                  >
                    {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">Nav pieejamu laiku šajā datumā</p>
            )}
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-primary"
            onClick={handleBooking}
            disabled={!selectedTimeSlot || loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Rezervē...
              </>
            ) : (
              'Rezervēt'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 