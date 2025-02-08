"use client";
import { useEffect, useState } from 'react';
import { db } from "../lib/firebaseClient";
import { 
  collection, 
  query, 
  getDocs, 
  getDoc,
  where, 
  doc, 
  updateDoc 
} from "firebase/firestore";

type BookingStatus = 'pending' | 'accepted' | 'rejected';

interface BookingRequest {
  lessonId: string;
  subject: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: BookingStatus;
}

interface TeacherBookingsProps {
  readonly teacherId: string;
}

interface BookedTimeData {
  studentId: string;
  status: BookingStatus;
}

interface LessonData {
  subject: string;
  teacherId: string;
  bookedTimes: {
    [timeSlot: string]: BookedTimeData;
  };
}

export default function TeacherBookings({ teacherId }: TeacherBookingsProps) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'pending' | 'accepted'>('pending');

  useEffect(() => {
    async function fetchBookings() {
      if (!teacherId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch lessons
        const lessonsQuery = query(
          collection(db, "lessons"),
          where("teacherId", "==", teacherId)
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        
        // First, collect all unique student IDs
        const studentIds = new Set<string>();
        const bookingData: Array<{
          lessonId: string;
          subject: string;
          studentId: string;
          date: string;
          time: string;
          status: BookingStatus;
        }> = [];

        lessonsSnap.docs.forEach(lessonDoc => {
          const lessonData = lessonDoc.data();
          const bookedTimes = lessonData.bookedTimes || {};

          Object.entries(bookedTimes).forEach(([timeSlot, data]: [string, any]) => {
            // Skip null/undefined bookings
            if (!data || !data.studentId) return;

            const [date, time] = timeSlot.split('T');
            studentIds.add(data.studentId);
            
            bookingData.push({
              lessonId: lessonDoc.id,
              subject: lessonData.subject,
              studentId: data.studentId,
              date,
              time,
              status: data.status || 'pending'
            });
          });
        });

        // Fetch all student data in parallel
        const studentSnapshots = await Promise.all(
          Array.from(studentIds).map(id => getDoc(doc(db, "users", id)))
        );

        // Create a map of student IDs to names
        const studentNames = new Map(
          studentSnapshots.map(snap => [
            snap.id,
            snap.exists() ? snap.data().displayName : "Unknown Student"
          ])
        );

        // Combine booking data with student names
        const bookingRequests = bookingData.map(booking => ({
          ...booking,
          studentName: studentNames.get(booking.studentId) || "Unknown Student"
        }));

        // Sort bookings
        bookingRequests.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
        });

        setBookings(bookingRequests);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Neizdevās ielādēt pieteikumus. Lūdzu, mēģiniet vēlreiz.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [teacherId]);

  function isValidTimeSlot(timeSlot: string): boolean {
    const [date, time] = timeSlot.split('T');
    return Boolean(date && time && Date.parse(`${date}T${time}`));
  }

  async function handleStatusUpdate(
    lessonId: string,
    timeSlot: string,
    newStatus: 'accepted' | 'rejected'
  ) {
    try {
      setError(null);
      
      if (!isValidTimeSlot(timeSlot)) {
        throw new Error("Invalid time slot format");
      }

      await updateDoc(doc(db, "lessons", lessonId), {
        [`bookedTimes.${timeSlot}.status`]: newStatus
      });

      setBookings(prev => prev.map(booking => {
        if (booking.lessonId === lessonId && `${booking.date}T${booking.time}` === timeSlot) {
          return { ...booking, status: newStatus };
        }
        return booking;
      }));

      const message = newStatus === 'accepted' ? "Nodarbība apstiprināta!" : "Nodarbība noraidīta!";
      alert(message);
    } catch (error) {
      console.error("Error updating booking status:", error);
      setError("Kļūda atjaunojot statusu. Lūdzu, mēģiniet vēlreiz.");
    }
  }

  async function handleCancel(lessonId: string, timeSlot: string) {
    try {
      setError(null);
      
      if (!isValidTimeSlot(timeSlot)) {
        throw new Error("Invalid time slot format");
      }

      await updateDoc(doc(db, "lessons", lessonId), {
        [`bookedTimes.${timeSlot}`]: null
      });

      setBookings(prev => prev.filter(booking => 
        !(booking.lessonId === lessonId && `${booking.date}T${booking.time}` === timeSlot)
      ));

      alert("Lesson cancelled successfully");
    } catch (error) {
      console.error("Error cancelling lesson:", error);
      setError("Failed to cancel lesson. Please try again.");
    }
  }

  function getStatusBadgeClass(status: BookingStatus): string {
    if (status === 'accepted') return 'badge-success';
    if (status === 'rejected') return 'badge-error';
    return 'badge-warning';
  }

  function getStatusText(status: BookingStatus): string {
    if (status === 'accepted') return 'Apstiprināts';
    if (status === 'rejected') return 'Noraidīts';
    return 'Gaida apstiprinājumu';
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');

  return (
    <div className="space-y-4">
      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${view === 'pending' ? 'tab-active' : ''}`}
          onClick={() => setView('pending')}
        >
          Pending ({pendingBookings.length})
        </button>
        <button 
          className={`tab ${view === 'accepted' ? 'tab-active' : ''}`}
          onClick={() => setView('accepted')}
        >
          Accepted ({acceptedBookings.length})
        </button>
      </div>

      {view === 'pending' ? (
        <div className="space-y-4">
          {pendingBookings.length === 0 ? (
            <div className="alert alert-info">No pending bookings</div>
          ) : (
            pendingBookings.map((booking) => (
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
                    <div className={`badge mt-2 ${getStatusBadgeClass(booking.status)}`}>
                      {getStatusText(booking.status)}
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
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {acceptedBookings.length === 0 ? (
            <div className="alert alert-info">No accepted bookings</div>
          ) : (
            acceptedBookings.map((booking) => (
              <div 
                key={`${booking.lessonId}-${booking.date}-${booking.time}`}
                className="card bg-base-100 shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{booking.subject}</h3>
                    <p>Student: {booking.studentName}</p>
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
                    <div className="badge badge-success mt-2">
                      {getStatusText(booking.status)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancel(
                      booking.lessonId,
                      `${booking.date}T${booking.time}`
                    )}
                    className="btn btn-error btn-sm"
                  >
                    Cancel Lesson
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 