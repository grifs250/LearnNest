"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { formatClerkId } from '@/lib/utils/helpers';
import { Booking, BookingStatus } from '../types';
import { createClient } from '@/lib/utils/supabaseClient';
import { toast } from 'react-hot-toast';

interface TeacherBookingsProps {
  userId?: string; // Optional Clerk ID, will use current user if not provided
}

export function TeacherBookings({ userId }: TeacherBookingsProps = {}) {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!user && !userId) return;
      
      try {
        const teacherId = userId || user?.id;
        if (!teacherId) return;
        
        const formattedId = formatClerkId(teacherId);
        const supabase = createClient();
        
        // Make sure supabase is initialized before using it
        if (!supabase) {
          console.error('Supabase client not initialized');
          return;
        }
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles:user_profiles(full_name, email),
            lessons(title, description)
          `)
          .eq('teacher_id', formattedId);
          
        if (error) throw error;
        
        if (data && Array.isArray(data)) {
          // Transform the data to match the Booking type
          const formattedBookings: Booking[] = data.map((item: any) => ({
            id: item.id || "",
            student_id: item.student_id || "",
            schedule_id: item.schedule_id || "",
            lesson_schedule_id: item.lesson_schedule_id || "",
            payment_id: item.payment_id || "",
            notes: item.notes || "",
            status: (item.status as BookingStatus) || "pending",
            payment_status: item.payment_status || "pending",
            created_at: item.created_at,
            updated_at: item.updated_at,
            metadata: item.metadata,
            profiles: item.profiles,
            lessons: item.lessons,
            booking_time: item.booking_time || item.created_at
          }));
          
          setBookings(formattedBookings);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }
    
    fetchBookings();
  }, [user, userId]);

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      const supabase = createClient();
      // Make sure supabase is initialized
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
      
      toast.success('Booking status updated');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (!bookings.length) {
    return <div className="alert alert-info">Nav aktīvu rezervāciju</div>;
  }

  return (
    <div className="grid gap-4">
      {bookings.map(booking => (
        <div key={booking.id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{booking.lessons?.title}</h2>
            <p><strong>Students:</strong> {booking.profiles?.full_name}</p>
            <p><strong>Datums:</strong> {new Date(booking.booking_time || '').toLocaleString('lv')}</p>
            <p><strong>Statuss:</strong> <span className={`badge ${getStatusBadge(booking.status)}`}>{booking.status}</span></p>
            
            {booking.status === 'pending' && (
              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                >
                  Apstiprināt
                </button>
                <button 
                  className="btn btn-error btn-sm"
                  onClick={() => updateBookingStatus(booking.id, 'canceled')}
                >
                  Noraidīt
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'confirmed': return 'badge-success';
    case 'canceled': return 'badge-error';
    case 'pending': return 'badge-warning';
    case 'completed': return 'badge-info';
    default: return 'badge-secondary';
  }
}