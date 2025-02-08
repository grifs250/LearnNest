"use client";
import { useEffect, useState } from 'react';
import { db } from "@/lib/firebaseClient";
import { 
  collection, 
  query, 
  getDocs, 
  getDoc,
  where, 
  doc, 
  updateDoc 
} from "firebase/firestore";

interface BookingRequest {
  lessonId: string;
  subject: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface TeacherBookingsProps {
  readonly teacherId: string;
}

export default function TeacherBookings({ teacherId }: TeacherBookingsProps) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const lessonsQuery = query(
          collection(db, "lessons"),
          where("teacherId", "==", teacherId)
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        
        const bookingRequests: BookingRequest[] = [];
        
        for (const lessonDoc of lessonsSnap.docs) {
          const lessonData = lessonDoc.data();
          const bookedTimes = lessonData.bookedTimes || {};
          
          for (const [timeSlot, bookingData] of Object.entries(bookedTimes)) {
            const [date, time] = timeSlot.split('T');
            const booking = bookingData as { studentId: string; status: 'pending' | 'accepted' | 'rejected' };
            
            try {
              const studentSnap = await getDoc(doc(db, "users", booking.studentId));
              const studentName = studentSnap.exists() ? studentSnap.data().displayName : "Unknown Student";
              
              bookingRequests.push({
                lessonId: lessonDoc.id,
                subject: lessonData.subject,
                studentId: booking.studentId,
                studentName,
                date,
                time,
                status: booking.status || 'pending'
              });
            } catch (error) {
              console.error("Error fetching student data:", error);
            }
          }
        }

        // Sort by date and status (pending first)
        bookingRequests.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
        });

        setBookings(bookingRequests);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    }

    if (teacherId) {
      fetchBookings();
    }
  }, [teacherId]);

  async function handleStatusUpdate(
    lessonId: string,
    timeSlot: string,
    newStatus: 'accepted' | 'rejected'
  ) {
    try {
      await updateDoc(doc(db, "lessons", lessonId), {
        [`bookedTimes.${timeSlot}.status`]: newStatus
      });

      setBookings(prev => prev.map(booking => {
        if (booking.lessonId === lessonId && `${booking.date}T${booking.time}` === timeSlot) {
          return { ...booking, status: newStatus };
        }
        return booking;
      }));

      alert(newStatus === 'accepted' ? "Nodarbība apstiprināta!" : "Nodarbība noraidīta!");
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Kļūda atjaunojot statusu");
    }
  }

  if (loading) return <div className="text-center py-4">Ielādē...</div>;

  if (bookings.length === 0) {
    return <p className="text-center py-4">Nav neviena pieteikuma</p>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div 
          key={`${booking.lessonId}-${booking.date}-${booking.time}`}
          className="card bg-base-100 shadow p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{booking.subject}</h3>
              <p>Skolēns: {booking.studentName}</p>
              <p>
                {new Date(`${booking.date}T${booking.time}`).toLocaleString('lv-LV', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className={`badge mt-2 ${
                booking.status === 'accepted' ? 'badge-success' :
                booking.status === 'rejected' ? 'badge-error' :
                'badge-warning'
              }`}>
                {booking.status === 'accepted' ? 'Apstiprināts' :
                 booking.status === 'rejected' ? 'Noraidīts' :
                 'Gaida apstiprinājumu'}
              </div>
            </div>

            {booking.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(
                    booking.lessonId,
                    `${booking.date}T${booking.time}`,
                    'accepted'
                  )}
                  className="btn btn-success btn-sm"
                >
                  Apstiprināt
                </button>
                <button
                  onClick={() => handleStatusUpdate(
                    booking.lessonId,
                    `${booking.date}T${booking.time}`,
                    'rejected'
                  )}
                  className="btn btn-error btn-sm"
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