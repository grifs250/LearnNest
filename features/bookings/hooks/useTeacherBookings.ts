"use client";

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
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
      const teacherBookingsRef = collection(db, "users", teacherId, "bookings");
      const bookingsSnap = await getDocs(teacherBookingsRef);
      
      const bookingsList = bookingsSnap.docs.map(doc => {
        const data = doc.data();
        const [date, time] = (data.timeSlot || `${data.date}T${data.time}`).split('T');

        return {
          id: doc.id,
          lessonId: data.lessonId,
          subject: data.subject,
          userId: data.userId || data.studentId,
          userName: data.userName || data.studentName,
          date,
          time,
          status: data.status,
          bookedAt: data.bookedAt,
          price: data.price,
          lessonLength: data.lessonLength
        };
      });

      setBookings(bookingsList);
      setError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings");
      toast.error("Neizdevās ielādēt rezervācijas");
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