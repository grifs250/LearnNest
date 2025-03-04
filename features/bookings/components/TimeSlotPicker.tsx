"use client";
import { useState, useEffect } from 'react';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { toast } from 'react-hot-toast';
import { format, addMinutes, isBefore, isAfter } from 'date-fns';
import { TimeRange, WorkHours } from '@/features/bookings/types';

interface BookingScheduleData {
  schedule_id: string;
  lesson_schedules: {
    start_time: string;
    end_time: string;
  } | null;
}

interface TimeSlotPickerProps {
  teacherId: string;
  selectedDate: Date;
  onTimeSelected: (time: string) => void;
  workHours?: WorkHours;
  slotDuration?: number; // in minutes
}

export function TimeSlotPicker({
  teacherId,
  selectedDate,
  onTimeSelected,
  workHours,
  slotDuration = 60,
}: TimeSlotPickerProps) {
  const { supabase, isLoading } = useClerkSupabase();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingsAndGenerateSlots = async () => {
      if (!supabase) {
        toast.error('Database connection not available');
        setLoading(false);
        return;
      }

      try {
        // Get booked slots for the teacher on the selected date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const { data: bookedSlotsData, error } = await supabase
          .from('bookings')
          .select(`
            schedule_id,
            lesson_schedules:schedule_id (
              start_time,
              end_time
            )
          `)
          .eq('teacher_id', teacherId)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
          
        if (error) {
          throw error;
        }

        // Convert the data to the expected format
        const bookedSlots: BookingScheduleData[] = Array.isArray(bookedSlotsData) 
          ? bookedSlotsData.map(item => ({
              schedule_id: item.schedule_id,
              lesson_schedules: item.lesson_schedules && Array.isArray(item.lesson_schedules) && item.lesson_schedules.length > 0
                ? {
                    start_time: item.lesson_schedules[0].start_time,
                    end_time: item.lesson_schedules[0].end_time
                  }
                : null
            }))
          : [];

        // Get the day of week
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[selectedDate.getDay()] as keyof WorkHours;
        
        // Determine working hours for the selected day
        let dayWorkHours: TimeRange | null = null;
        
        if (workHours && workHours[dayOfWeek]) {
          dayWorkHours = workHours[dayOfWeek];
        } else {
          // Default work hours if not specified (9 AM to 5 PM)
          const defaultStart = new Date(selectedDate);
          defaultStart.setHours(9, 0, 0, 0);
          
          const defaultEnd = new Date(selectedDate);
          defaultEnd.setHours(17, 0, 0, 0);
          
          dayWorkHours = {
            start: defaultStart.toISOString(),
            end: defaultEnd.toISOString()
          };
        }
        
        if (!dayWorkHours) {
          // No work hours for this day
          setAvailableSlots([]);
          setLoading(false);
          return;
        }
        
        // Generate all possible time slots based on work hours
        const slots: string[] = [];
        let currentSlot = new Date(dayWorkHours.start);
        const endTime = new Date(dayWorkHours.end);
        
        while (isBefore(currentSlot, endTime)) {
          const slotEnd = addMinutes(currentSlot, slotDuration);
          
          // Check if the slot is not booked
          const isBooked = bookedSlots.some(booking => {
            if (!booking.lesson_schedules) return false;
            
            const bookingStart = new Date(booking.lesson_schedules.start_time);
            const bookingEnd = new Date(booking.lesson_schedules.end_time);
            
            return (
              (isBefore(currentSlot, bookingEnd) && isAfter(slotEnd, bookingStart)) ||
              (isBefore(bookingStart, slotEnd) && isAfter(bookingEnd, currentSlot))
            );
          });
          
          if (!isBooked) {
            slots.push(currentSlot.toISOString());
          }
          
          currentSlot = slotEnd;
        }
        
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load available time slots');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && selectedDate) {
      fetchBookingsAndGenerateSlots();
    }
  }, [supabase, isLoading, teacherId, selectedDate, workHours, slotDuration]);

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    onTimeSelected(time);
  };

  if (isLoading || loading) {
    return <div>Loading available time slots...</div>;
  }

  if (!supabase) {
    return <div>Unable to connect to the database. Please try again later.</div>;
  }

  if (availableSlots.length === 0) {
    return <div>No available time slots for the selected date.</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {availableSlots.map((slot) => (
        <button
          key={slot}
          className={`btn ${selectedTime === slot ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleSelectTime(slot)}
        >
          {format(new Date(slot), 'HH:mm')}
        </button>
      ))}
    </div>
  );
} 