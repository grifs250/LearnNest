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
  bookedAt: string;
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
        // Get teacher's bookings subcollection
        const teacherBookingsRef = collection(db, "users", teacherId, "bookings");
        const bookingsSnap = await getDocs(teacherBookingsRef);
        
        const bookingsList = bookingsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            lessonId: data.lessonId,
            subject: data.subject,
            studentId: data.studentId,
            studentName: data.studentName,
            date: data.timeSlot.split('T')[0],
            time: data.timeSlot.split('T')[1],
            status: data.status,
            bookedAt: data.bookedAt
          };
        });
        
        setBookings(bookingsList);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings");
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
    newStatus: BookingStatus
  ) {
    try {
      setError(null);
      
      // Update lesson document
      const lessonRef = doc(db, "lessons", lessonId);
      await updateDoc(lessonRef, {
        [`bookedTimes.${timeSlot}.status`]: newStatus
      });

      // Update teacher's booking
      const teacherBookingRef = doc(db, "users", teacherId, "bookings", `${lessonId}_${timeSlot}`);
      await updateDoc(teacherBookingRef, { status: newStatus });

      // Find and update student's booking
      const booking = bookings.find(b => b.lessonId === lessonId && `${b.date}T${b.time}` === timeSlot);
      if (booking) {
        const studentBookingRef = doc(db, "users", booking.studentId, "bookings", `${lessonId}_${timeSlot}`);
        await updateDoc(studentBookingRef, { status: newStatus });
      }

      // Update local state
      setBookings(prev => prev.map(b => {
        if (b.lessonId === lessonId && `${b.date}T${b.time}` === timeSlot) {
          return { ...b, status: newStatus };
        }
        return b;
      }));

      // Show success message without reloading
      const message = newStatus === 'accepted' ? 
        "Nodarbība apstiprināta!" : 
        "Nodarbība noraidīta!";
      
      // Use a toast or alert component instead of window.alert
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${newStatus === 'accepted' ? 'success' : 'error'} mb-4`;
      alertDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>${message}</span>
      `;

      // Add alert to the page
      const alertsContainer = document.querySelector('.booking-alerts');
      if (alertsContainer) {
        alertsContainer.appendChild(alertDiv);
        // Remove alert after 3 seconds
        setTimeout(() => alertDiv.remove(), 3000);
      }

    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update booking status");
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
      <div className="booking-alerts"></div>

      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${view === 'pending' ? 'tab-active' : ''}`}
          onClick={() => setView('pending')}
        >
          Gaida apstiprinājumu ({pendingBookings.length})
        </button>
        <button 
          className={`tab ${view === 'accepted' ? 'tab-active' : ''}`}
          onClick={() => setView('accepted')}
        >
          Apstiprinātās ({acceptedBookings.length})
        </button>
      </div>

      {view === 'pending' ? (
        <div className="space-y-4">
          {pendingBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Nav neapstiprinātu nodarbību</p>
              </div>
            </div>
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
            <div className="text-center py-8">
              <div className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Nav apstiprinātu nodarbību</p>
              </div>
            </div>
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