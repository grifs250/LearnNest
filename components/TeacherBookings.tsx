"use client";
import { useEffect, useState } from 'react';
import { db } from "@/lib/firebaseClient";
import { 
  collection, 
  getDocs, 
  updateDoc,
  doc,
  writeBatch
} from "firebase/firestore";
import { useRouter } from 'next/navigation';
import UserInfoModal from './UserInfoModal';

type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'paid';

interface BookingRequest {
  id: string;
  lessonId: string;
  subject: string;
  userId: string;
  userName: string;
  studentId?: string;  // Add optional legacy fields
  studentName?: string;
  date: string;
  time: string;
  status: BookingStatus;
  bookedAt: string;
  price?: number;
  lessonLength?: number;
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

async function fetchTeacherBookings(teacherId: string) {
  if (!teacherId) return [];
  
  const teacherBookingsRef = collection(db, "users", teacherId, "bookings");
  const bookingsSnap = await getDocs(teacherBookingsRef);
  
  const bookings = bookingsSnap.docs.map(doc => {
    const data = doc.data();
    console.log("Booking data:", data); // Debug log
    
    // Handle both old and new data structures
    const studentId = data.userId || data.studentId;
    const studentName = data.userName || data.studentName;
    const [date, time] = (data.timeSlot || `${data.date}T${data.time}`).split('T');

    return {
      id: doc.id,
      lessonId: data.lessonId,
      subject: data.subject,
      userId: studentId,
      userName: studentName,
      date: date,
      time: time,
      status: data.status,
      bookedAt: data.bookedAt,
      price: data.price,
      lessonLength: data.lessonLength
    };
  });

  console.log("Processed bookings:", bookings); // Debug log
  return bookings;
}

export default function TeacherBookings({ teacherId }: TeacherBookingsProps) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'pending' | 'accepted' | 'paid'>('pending');
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError(null);
        const bookingsList = await fetchTeacherBookings(teacherId);
        setBookings(bookingsList);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
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
      if (!db) {
        console.error("Firebase db not initialized");
        return;
      }

      setError(null);
      console.log("Starting status update:", { lessonId, timeSlot, newStatus, teacherId });
      
      // Find the booking
      const booking = bookings.find(b => 
        b.lessonId === lessonId && 
        `${b.date}T${b.time}` === timeSlot
      );

      if (!booking) {
        console.error("Booking not found");
        return;
      }

      console.log("Found booking:", booking);

      try {
        // Create batch operation
        const batch = writeBatch(db);

        const teacherBookingRef = doc(db, "users", teacherId, "bookings", `${lessonId}_${timeSlot}`);
        const studentBookingRef = doc(db, "users", booking.userId, "bookings", `${lessonId}_${timeSlot}`);
        const lessonRef = doc(db, "lessons", lessonId);

        console.log("Updating documents:", {
          teacherPath: `users/${teacherId}/bookings/${lessonId}_${timeSlot}`,
          studentPath: `users/${booking.userId}/bookings/${lessonId}_${timeSlot}`,
          lessonPath: `lessons/${lessonId}`
        });

        // Set up batch operations
        batch.update(teacherBookingRef, { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        });

        batch.update(studentBookingRef, { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        });

        batch.update(lessonRef, {
          [`bookedTimes.${timeSlot}`]: {
            studentId: booking.userId,
            status: newStatus,
            updatedAt: new Date().toISOString()
          }
        });

        await batch.commit();
        console.log("Batch update successful");

        // Update local state
        setBookings(prev => prev.map(b => {
          if (b.lessonId === lessonId && `${b.date}T${b.time}` === timeSlot) {
            return { ...b, status: newStatus };
          }
          return b;
        }));

        // Show success message
        const message = newStatus === 'accepted' ? 
          "Nodarbība apstiprināta!" : 
          "Nodarbība noraidīta!";
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${newStatus === 'accepted' ? 'success' : 'error'} mb-4`;
        alertDiv.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${message}</span>
        `;

        const alertsContainer = document.querySelector('.booking-alerts');
        if (alertsContainer) {
          alertsContainer.appendChild(alertDiv);
          setTimeout(() => alertDiv.remove(), 3000);
        }

      } catch (error) {
        console.error("Batch operation failed:", error);
        throw error;
      }
    } catch (error) {
      console.error("Status update failed:", error);
      setError("Failed to update booking status");
    }
  }

  async function handleCancel(lessonId: string, timeSlot: string) {
    try {
      setError(null);
      
      if (!isValidTimeSlot(timeSlot)) {
        throw new Error("Invalid time slot format");
      }

      const batch = writeBatch(db);

      // Find the booking
      const booking = bookings.find(b => 
        b.lessonId === lessonId && 
        `${b.date}T${b.time}` === timeSlot
      );

      if (!booking) {
        console.error("Booking not found");
        return;
      }

      // Update lesson document
      const lessonRef = doc(db, "lessons", lessonId);
      batch.update(lessonRef, {
        [`bookedTimes.${timeSlot}.status`]: 'rejected'  // Only update the status field
      });

      // Update teacher's booking
      const teacherBookingRef = doc(db, "users", teacherId, "bookings", `${lessonId}_${timeSlot}`);
      batch.update(teacherBookingRef, { status: 'rejected' });

      // Update student's booking
      const studentBookingRef = doc(db, "users", booking.userId, "bookings", `${lessonId}_${timeSlot}`);
      batch.update(studentBookingRef, { status: 'rejected' });

      await batch.commit();

      // Update local state
      setBookings(prev => prev.map(b => {
        if (b.lessonId === lessonId && `${b.date}T${b.time}` === timeSlot) {
          return { ...b, status: 'rejected' };
        }
        return b;
      }));

      alert("Nodarbība atcelta!");
    } catch (error) {
      console.error("Error cancelling lesson:", error);
      setError("Neizdevās atcelt nodarbību. Lūdzu mēģiniet vēlreiz.");
    }
  }

  function getStatusBadgeClass(status: BookingStatus): string {
    switch (status) {
      case 'accepted': return 'badge-success';
      case 'rejected': return 'badge-error';
      case 'paid': return 'badge-success';
      default: return 'badge-warning';
    }
  }

  function getStatusText(status: BookingStatus): string {
    switch (status) {
      case 'accepted': return 'Apstiprināts';
      case 'rejected': return 'Noraidīts';
      case 'paid': return 'Apmaksāts';
      default: return 'Gaida apstiprinājumu';
    }
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
  const paidBookings = bookings.filter(b => b.status === 'paid');

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
        <button 
          className={`tab ${view === 'paid' ? 'tab-active' : ''}`}
          onClick={() => setView('paid')}
        >
          Apmaksātās ({paidBookings.length})
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
            pendingBookings.map((booking) => {
              const lessonTime = new Date(`${booking.date}T${booking.time}`);
              const endTime = new Date(lessonTime.getTime() + (booking.lessonLength ?? 60) * 60000);
              
              return (
                <div 
                  key={`${booking.lessonId}-${booking.date}-${booking.time}`}
                  className="card bg-base-100 shadow p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{booking.subject}</h3>
                      <p>
                        <span className="text-gray-600">Skolēns: </span>
                        <button 
                          className="hover:underline text-primary"
                          onClick={() => {
                            setSelectedUserId(booking.userId || booking.studentId || null);
                            setIsUserModalOpen(true);
                          }}
                        >
                          {booking.userName || booking.studentName || 'Nav norādīts'}
                        </button>
                      </p>
                      <p className="text-gray-600 my-2">
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
                      <div className="flex items-center gap-4 text-gray-600 my-2">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          €{booking.price?.toFixed(2) ?? '0.00'}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {booking.lessonLength} min
                        </div>
                      </div>
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

                    {booking.status === 'paid' && (
                      <button
                        onClick={() => router.push(`/lessons/meet/${booking.lessonId}`)}
                        className="btn btn-primary btn-sm"
                      >
                        Pievienoties nodarbībai
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : view === 'accepted' ? (
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
            acceptedBookings.map((booking) => {
              const lessonTime = new Date(`${booking.date}T${booking.time}`);
              const endTime = new Date(lessonTime.getTime() + (booking.lessonLength ?? 60) * 60000);
              
              return (
                <div 
                  key={`${booking.lessonId}-${booking.date}-${booking.time}`}
                  className="card bg-base-100 shadow p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{booking.subject}</h3>
                      <p>
                        <span className="text-gray-600">Skolēns: </span>
                        <button 
                          className="hover:underline text-primary"
                          onClick={() => {
                            setSelectedUserId(booking.userId || booking.studentId || null);
                            setIsUserModalOpen(true);
                          }}
                        >
                          {booking.userName || booking.studentName || 'Nav norādīts'}
                        </button>
                      </p>
                      <p className="text-gray-600 my-2">
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
                      <div className="flex items-center gap-4 text-gray-600 my-2">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          €{booking.price?.toFixed(2) ?? '0.00'}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {booking.lessonLength} min
                        </div>
                      </div>
                      <div className="badge badge-success mt-2">
                        {getStatusText(booking.status)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancel(booking.lessonId, `${booking.date}T${booking.time}`)}
                      className="btn btn-error btn-sm"
                    >
                      Atcelt
                    </button>

                    {booking.status === 'paid' && (
                      <button
                        onClick={() => router.push(`/lessons/meet/${booking.lessonId}`)}
                        className="btn btn-primary btn-sm"
                      >
                        Pievienoties nodarbībai
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paidBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Nav apmaksātu nodarbību</p>
              </div>
            </div>
          ) : (
            paidBookings.map((booking) => {
              const lessonTime = new Date(`${booking.date}T${booking.time}`);
              const endTime = new Date(lessonTime.getTime() + (booking.lessonLength ?? 60) * 60000);
              
              return (
                <div 
                  key={`${booking.lessonId}-${booking.date}-${booking.time}`}
                  className="card bg-base-100 shadow p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{booking.subject}</h3>
                      <p>
                        <span className="text-gray-600">Skolēns: </span>
                        <button 
                          className="hover:underline text-primary"
                          onClick={() => {
                            setSelectedUserId(booking.userId || booking.studentId || null);
                            setIsUserModalOpen(true);
                          }}
                        >
                          {booking.userName || booking.studentName || 'Nav norādīts'}
                        </button>
                      </p>
                      <p className="text-gray-600 my-2">
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
                      <div className="flex items-center gap-4 text-gray-600 my-2">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          €{booking.price?.toFixed(2) ?? '0.00'}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {booking.lessonLength} min
                        </div>
                      </div>
                      <div className="badge badge-success mt-2">
                        {getStatusText(booking.status)}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/lessons/meet/${booking.lessonId}`)}
                      className="btn btn-primary btn-sm"
                    >
                      Pievienoties nodarbībai
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedUserId && (
        <UserInfoModal
          userId={selectedUserId}
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
} 