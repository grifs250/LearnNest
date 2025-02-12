"use client";
import { useEffect, useState } from 'react';
import { db } from "@/lib/firebaseClient";
import { collection, getDocs,  updateDoc, doc, deleteDoc, getDoc, writeBatch } from "firebase/firestore";
import { BookingStatus } from "@/types/lesson";
import PaymentModal from "@/components/PaymentModal";
import { useRouter } from 'next/navigation';
import { auth } from "@/lib/firebaseClient";
import UserInfoModal from './UserInfoModal';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BookedLesson {
  id: string;
  lessonId: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  status: BookingStatus;
  lessonLength: number;
  bookedAt: string;
  paid?: boolean;
  price?: number;
  category?: string;
  subjectId?: string;
}

interface StudentBookingsProps {
  readonly userId: string;
}

export default function StudentBookings({ userId }: StudentBookingsProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookedLesson[]>([]);
  const [showRejected, setShowRejected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookedLesson | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBookLesson() {
    if (!auth.currentUser?.emailVerified) {
      alert("Lūdzu apstipriniet savu e-pastu pirms nodarbību rezervēšanas.");
      return;
    }
    
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (!userDoc.exists() || userDoc.data().status !== 'active') {
      alert("Jūsu konts nav aktīvs. Lūdzu apstipriniet savu e-pastu.");
      return;
    }

    // ... rest of booking logic
  }

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

      console.log('Fetched bookings:', bookingsList);
      setBookings(bookingsList);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  async function handleCancel(lessonId: string, timeSlot: string) {
    try {
      setError(null);
      
      if (!timeSlot) {
        throw new Error("Invalid time slot");
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
      const teacherBookingRef = doc(db, "users", booking.teacherId, "bookings", `${lessonId}_${timeSlot}`);
      batch.update(teacherBookingRef, { status: 'rejected' });

      // Update student's booking
      const studentBookingRef = doc(db, "users", userId, "bookings", `${lessonId}_${timeSlot}`);
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

  const handleReschedule = (booking: BookedLesson) => {
    router.push(`/lessons/${booking.category}/${booking.subjectId}/${booking.lessonId}?oldTimeSlot=${booking.date}T${booking.time}`);
  };

  function getStatusBadgeClass(status: BookingStatus): string {
    if (status === 'paid') return 'badge-success';
    if (status === 'accepted') return 'badge-warning';
    if (status === 'rejected') return 'badge-error';
    return 'badge-ghost';
  }

  function getStatusText(status: BookingStatus): string {
    if (status === 'paid') return 'Apmaksāts';
    if (status === 'accepted') return 'Gaida apmaksu';
    if (status === 'rejected') return 'Noraidīts';
    return 'Gaida apstiprinājumu';
  }

  // Filter bookings by status
  const activeBookings = bookings.filter(booking => booking.status !== 'rejected');
  const rejectedBookings = bookings.filter(booking => booking.status === 'rejected');

  if (loading) return <div>Ielādē...</div>;

  if (bookings.length === 0) {
    return <p>Nav rezervētu nodarbību</p>;
  }

  return (
    <div className="space-y-6">
      {/* Active Bookings Section */}
      <div className="space-y-4">
        {activeBookings.length > 0 ? (
          activeBookings.map((booking) => {
            const lessonTime = new Date(`${booking.date}T${booking.time}`);
            const endTime = new Date(lessonTime.getTime() + booking.lessonLength * 60000);
            
            // Calculate if the lesson is within 24 hours AND accepted/paid
            const now = new Date();
            const hoursUntilLesson = (lessonTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            const isWithin24Hours = hoursUntilLesson <= 24;
            const canModify = !(isWithin24Hours && (booking.status === 'accepted' || booking.status === 'paid'));

            return (
              <div key={booking.id} className="card bg-base-100 shadow p-4 w-full">
                <h3 className="font-semibold">{booking.subject}</h3>
                <p>
                  <span className="text-gray-600">Pasniedzējs: </span>
                  <button 
                    className="hover:underline text-primary"
                    onClick={() => {
                      setSelectedTeacherId(booking.teacherId);
                      setIsUserModalOpen(true);
                    }}
                  >
                    {booking.teacherName}
                  </button>
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

                {/* Status and Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {/* Status Badge */}
                  <div className={`badge ${getStatusBadgeClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-auto">
                    {/* Show Cancel button if not paid */}
                    {booking.status !== 'paid' && (
                      <button 
                        onClick={() => handleCancel(booking.lessonId, `${booking.date}T${booking.time}`)}
                        className={`btn btn-sm ${canModify ? 'btn-error' : 'btn-disabled'}`}
                        disabled={!canModify}
                        title={!canModify ? 'Nevar atcelt apstiprinātu nodarbību mazāk kā 24h pirms tās' : ''}
                      >
                        Atcelt
                      </button>
                    )}

                    {/* Show Reschedule button for all statuses except paid */}
                    {booking.status !== 'paid' && (
                      <button 
                        onClick={() => handleReschedule(booking)}
                        className={`btn btn-sm ${canModify ? 'btn-info' : 'btn-disabled'}`}
                        disabled={!canModify}
                        title={!canModify ? 'Nevar pārplānot apstiprinātu nodarbību mazāk kā 24h pirms tās' : ''}
                      >
                        Pārplānot
                      </button>
                    )}

                    {/* Show Pay button only when accepted */}
                    {booking.status === 'accepted' && !booking.paid && (
                      <button 
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowPaymentModal(true);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Apmaksāt
                      </button>
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
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">Nav aktīvu nodarbību</p>
        )}
      </div>

      {/* Rejected Bookings Section (Collapsible) */}
      {rejectedBookings.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowRejected(!showRejected)}
            className="flex items-center gap-2 text-lg font-semibold text-gray-600 hover:text-gray-800"
          >
            <span>Noraidītās nodarbības</span>
            {showRejected ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showRejected && (
            <div className="mt-4 space-y-2">
              {rejectedBookings.map((booking) => (
                <div key={booking.id} className="card bg-base-200 shadow p-3 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{booking.subject}</h3>
                        <span className="badge badge-error badge-sm">Noraidīts</span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <button 
                          className="hover:underline text-primary"
                          onClick={() => {
                            setSelectedTeacherId(booking.teacherId);
                            setIsUserModalOpen(true);
                          }}
                        >
                          {booking.teacherName}
                        </button>
                        <span>
                          {new Date(`${booking.date}T${booking.time}`).toLocaleString('lv-LV', {
                            day: 'numeric',
                            month: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>{booking.lessonLength} min</span>
                        {booking.price && <span>€{booking.price.toFixed(2)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReschedule(booking)}
                        className="btn btn-xs btn-info"
                      >
                        Rezervēt vēlreiz
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {selectedBooking && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          lessonId={selectedBooking.id}
          timeSlot={`${selectedBooking.date}T${selectedBooking.time}`}
          price={selectedBooking.price ?? 0}
          onPaymentComplete={() => {
            setShowPaymentModal(false);
            fetchBookings();
          }}
        />
      )}

      {/* Teacher Info Modal */}
      {selectedTeacherId && (
        <UserInfoModal
          userId={selectedTeacherId}
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedTeacherId(null);
          }}
        />
      )}
    </div>
  );
} 