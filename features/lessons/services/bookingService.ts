import { db } from "@/lib/firebase/client";
import { runTransaction, doc, getDoc } from "firebase/firestore";
import { BookingData, TimeSlot } from "../types";
import { lessonsConfig } from "../config";

export const bookingService = {
  async validateTimeSlot(teacherId: string, timeSlot: TimeSlot): Promise<boolean> {
    const bookingDate = new Date(timeSlot);
    const now = new Date();
    
    // Check minimum notice period
    const hoursDifference = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursDifference < lessonsConfig.minBookingNotice) {
      throw new Error("Booking must be made at least 24 hours in advance");
    }

    // Check maximum advance booking
    if (hoursDifference > lessonsConfig.maxBookingAdvance * 24) {
      throw new Error("Cannot book more than 30 days in advance");
    }

    // Check teacher availability
    const teacherRef = doc(db, "users", teacherId);
    const teacherSnap = await getDoc(teacherRef);
    if (!teacherSnap.exists()) return false;

    const teacherData = teacherSnap.data();
    const workHours = teacherData.workHours?.[bookingDate.getDay()];
    
    return !!workHours?.enabled;
  },

  async createBooking(bookingData: BookingData): Promise<void> {
    await runTransaction(db, async (transaction) => {
      const lessonRef = doc(db, "lessons", bookingData.lessonId);
      const lessonDoc = await transaction.get(lessonRef);
      
      if (!lessonDoc.exists()) {
        throw new Error("Lesson not found");
      }

      const lessonData = lessonDoc.data();
      if (lessonData.bookedTimes?.[bookingData.timeSlot]) {
        throw new Error("Time slot already booked");
      }

      // Update lesson document
      transaction.update(lessonRef, {
        [`bookedTimes.${bookingData.timeSlot}`]: {
          studentId: bookingData.studentId,
          status: 'pending',
          bookedAt: new Date().toISOString()
        }
      });

      // Create booking records for both teacher and student
      const teacherBookingRef = doc(db, "users", lessonData.teacherId, "bookings", `${bookingData.lessonId}_${bookingData.timeSlot}`);
      const studentBookingRef = doc(db, "users", bookingData.studentId, "bookings", `${bookingData.lessonId}_${bookingData.timeSlot}`);

      transaction.set(teacherBookingRef, bookingData);
      transaction.set(studentBookingRef, bookingData);
    });
  },

  async cancelBooking(bookingId: string): Promise<void> {
    // Add cancellation logic here
    throw new Error("Not implemented");
  }
}; 