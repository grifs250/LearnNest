"use client";

import { useState, useEffect } from 'react';
import { getBookings } from '@/lib/supabase/db';
import { BookingRequest } from "../types";
import { toast } from "react-hot-toast";

export function useTeacherBookings(teacherId: string) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBookings() {
    if (!teacherId) return;
    setLoading(true);
    
    try {
      const fetchedBookings = await getBookings(teacherId);
      setBookings(fetchedBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      toast.error('Neizdevās ielādēt rezervācijas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, [teacherId]);

  return {
    bookings,
    loading,
    error,
    refreshBookings: fetchBookings
  };
} 