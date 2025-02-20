"use client";

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
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
      const userBookingsRef = collection(db, "users", userId, "bookings");
      const bookingsSnap = await getDocs(userBookingsRef);
      
      const bookingsList = bookingsSnap.docs.map(doc => {
        const data = doc.data();
        const [date, time] = data.timeSlot.split('T');
        
        return {
          id: doc.id,
          lessonId: data.lessonId,
          subject: data.subject,
          teacherId: data.teacherId,
          teacherName: data.teacherName,
          date,
          time,
          status: data.status,
          lessonLength: data.lessonLength || 60,
          bookedAt: data.bookedAt,
          paid: data.paid,
          price: data.price,
          category: data.category,
          subjectId: data.subjectId
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
  }, [userId]);

  return {
    bookings,
    loading,
    error,
    refreshBookings: fetchBookings
  };
} 