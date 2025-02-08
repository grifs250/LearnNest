"use client";
import { useEffect, useState } from 'react';
import { db } from "@/lib/firebaseClient";
import { collection, query, getDocs, where } from "firebase/firestore";

interface BookedLesson {
  id: string;
  subject: string;
  teacherName: string;
  date: string;
  time: string;
  lessonLength: number;
  status?: 'pending' | 'accepted' | 'rejected';
}

export default function StudentBookings({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<BookedLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      const lessons = collection(db, "lessons");
      const lessonsSnap = await getDocs(lessons);
      
      const bookedLessons: BookedLesson[] = [];
      
      lessonsSnap.docs.forEach(doc => {
        const lessonData = doc.data();
        Object.entries(lessonData.bookedTimes || {}).forEach(([timeSlot, studentId]) => {
          if (studentId === userId) {
            const [date, time] = timeSlot.split('T');
            bookedLessons.push({
              id: doc.id,
              subject: lessonData.subject,
              teacherName: lessonData.teacherName,
              date,
              time,
              lessonLength: lessonData.lessonLength
            });
          }
        });
      });

      // Sort by date and time
      bookedLessons.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      setBookings(bookedLessons);
      setLoading(false);
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