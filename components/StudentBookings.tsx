"use client";
import { useEffect, useState } from 'react';
import { db } from "@/lib/firebaseClient";
import { collection, query, getDocs, where } from "firebase/firestore";
import { BookingStatus } from "@/types/lesson";

interface BookedLesson {
  id: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  status: BookingStatus;
  lessonLength: number;
  bookedAt: string;
  category?: string;
  subjectId?: string;
}

export default function StudentBookings({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<BookedLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            subject: data.subject,
            teacherId: data.teacherId,
            teacherName: data.teacherName,
            date,
            time,
            status: data.status,
            lessonLength: data.lessonLength || 60,
            bookedAt: data.bookedAt
          };
        });

        console.log('Fetched bookings:', bookingsList);
        setBookings(bookingsList);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [userId]);

  if (loading) return <div>Ielādē...</div>;

  if (bookings.length === 0) {
    return <p>Nav rezervētu nodarbību</p>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="space-y-4">
        {bookings.map((booking) => {
          const lessonTime = new Date(`${booking.date}T${booking.time}`);
          const endTime = new Date(lessonTime.getTime() + booking.lessonLength * 60000);
          
          return (
            <div key={`${booking.id}-${booking.date}-${booking.time}`} 
                 className="card bg-base-100 shadow p-4"
            >
              <h3 className="font-semibold">{booking.subject}</h3>
              <p>Pasniedzējs: {booking.teacherName}</p>
              <p>
                {lessonTime.toLocaleString('lv-LV', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {' - '}
                {endTime.toLocaleTimeString('lv-LV', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className={`mt-2 badge ${
                booking.status === 'accepted' ? 'badge-success' : 
                booking.status === 'rejected' ? 'badge-error' : 
                'badge-warning'
              }`}>
                {booking.status === 'accepted' ? 'Apstiprināts' :
                 booking.status === 'rejected' ? 'Noraidīts' :
                 'Gaida apstiprinājumu'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 