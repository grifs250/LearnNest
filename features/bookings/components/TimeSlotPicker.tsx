"use client";
import { useState, useEffect } from 'react';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import type { WorkHours, TimeRange } from '../types';
import type { Booking } from '../types';
import { addDays, format, parse, startOfWeek } from 'date-fns';

interface TimeSlotPickerProps {
  workHours: WorkHours;
  lessonLength: number;
  onTimeSlotSelect: (timeSlot: string) => void;
  selectedTimeSlot?: string;
  mode?: 'booking' | 'scheduling';
  bookedTimes?: Record<string, {
    scheduleId: string;
    studentId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null>;
  teacherId?: string;
}

export function TimeSlotPicker({
  workHours,
  lessonLength,
  onTimeSlotSelect,
  selectedTimeSlot,
  mode = 'booking',
  bookedTimes = {},
  teacherId
}: TimeSlotPickerProps) {
  const { supabase } = useClerkSupabase();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!teacherId) return;

      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            schedule:lesson_schedules(*)
          `)
          .eq('schedule.lesson.teacher_id', teacherId)
          .gte('schedule.start_time', currentWeekStart.toISOString())
          .lte('schedule.start_time', addDays(currentWeekStart, 7).toISOString());

        if (error) throw error;

        // Process bookings and update available slots
        const bookedSlots = new Set(
          bookings?.map(booking => booking.schedule?.start_time) || []
        );

        // Generate available slots based on work hours and booked slots
        const newAvailableSlots = generateAvailableTimeSlots(
          workHours,
          lessonLength,
          bookedSlots
        );

        setAvailableSlots(newAvailableSlots);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [supabase, teacherId, currentWeekStart, workHours, lessonLength]);

  const generateAvailableTimeSlots = (
    workHours: WorkHours,
    lessonLength: number,
    bookedSlots: Set<string>
  ): string[] => {
    const slots: string[] = [];
    const now = new Date();

    // Generate slots for the next 7 days
    for (let day = 0; day < 7; day++) {
      const date = addDays(currentWeekStart, day);
      const dayName = format(date, 'EEEE').toLowerCase();
      const dayConfig = workHours[dayName];

      if (dayConfig?.enabled && dayConfig.timeSlots) {
        for (const timeSlot of dayConfig.timeSlots) {
          const startTime = new Date(date);
          startTime.setHours(
            parseInt(timeSlot.start.split(':')[0]),
            parseInt(timeSlot.start.split(':')[1]),
            0,
            0
          );
          
          const endTime = new Date(date);
          endTime.setHours(
            parseInt(timeSlot.end.split(':')[0]),
            parseInt(timeSlot.end.split(':')[1]),
            0,
            0
          );

          // Generate slots within the time range
          let currentSlot = startTime;
          while (currentSlot < endTime) {
            const slotString = currentSlot.toISOString();

            // Skip if slot is in the past or is booked
            if (currentSlot > now && !bookedSlots.has(slotString)) {
              slots.push(slotString);
            }

            // Move to next slot based on lesson length
            currentSlot = new Date(currentSlot.getTime() + lessonLength * 60000);
          }
        }
      }
    }

    return slots;
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev: Date) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev: Date) => addDays(prev, 7));
  };

  if (loading) {
    return <div>Loading available time slots...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousWeek}
          className="btn btn-ghost btn-sm"
        >
          Previous Week
        </button>
        <span className="font-semibold">
          Week of {format(currentWeekStart, 'MMM d, yyyy')}
        </span>
        <button
          onClick={handleNextWeek}
          className="btn btn-ghost btn-sm"
        >
          Next Week
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(currentWeekStart, i);
          const daySlots = availableSlots.filter(slot => 
            new Date(slot).toDateString() === date.toDateString()
          );

          return (
            <div key={i} className="space-y-2">
              <div className="text-center font-semibold">
                {format(date, 'EEE')}
                <br />
                {format(date, 'MMM d')}
              </div>
              <div className="space-y-1">
                {daySlots.map(slot => {
                  const isSelected = selectedTimeSlot === slot;
                  const isBooked = bookedTimes[slot] !== null;

                  return (
                    <button
                      key={slot}
                      onClick={() => onTimeSlotSelect(slot)}
                      disabled={isBooked}
                      className={`
                        w-full px-2 py-1 text-sm rounded
                        ${isSelected ? 'bg-primary text-primary-content' : 
                          isBooked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 
                          'bg-base-200 hover:bg-base-300'}
                      `}
                    >
                      {format(new Date(slot), 'HH:mm')}
                    </button>
                  );
                })}
                {daySlots.length === 0 && (
                  <div className="text-center text-sm text-gray-500">
                    No slots
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 