"use client";

import { useState, useEffect } from 'react';
import { getBookings } from '@/lib/supabase/db';
import { BookedLesson } from "../types";
import { toast } from "react-hot-toast";

export function useStudentBookings(userId: string) {
  const [bookings, setBookings] = useState<BookedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBookings() {
    if (!userId) return;
    setLoading(true);
    
    try {
      const fetchedBookings = await getBookings(userId);
      setBookings(fetchedBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      toast.error("Neizdevās ielādēt rezervācijas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  return {
    bookings,
    loading,
    error,
    refreshBookings: fetchBookings
  };
} 