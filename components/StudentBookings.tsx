"use client";
import { useEffect, useState } from 'react';
import { db } from "@/lib/firebaseClient";
import { collection, getDocs,  updateDoc, doc, deleteDoc } from "firebase/firestore";
import { BookingStatus } from "@/types/lesson";
import PaymentModal from "@/components/PaymentModal";
import { useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookedLesson | null>(null);

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

  const handleCancel = async (lessonId: string, timeSlot: string) => {
    if (!window.confirm('Vai tiešām vēlaties atcelt šo nodarbību?')) return;

    try {
      await updateDoc(doc(db, "lessons", lessonId), {
        [`bookedTimes.${timeSlot}`]: null
      });

      const booking = bookings.find(b => b.lessonId === lessonId);
      if (booking) {
        await deleteDoc(doc(db, "users", booking.teacherId, "bookings", `${lessonId}_${timeSlot}`));
      }

      await deleteDoc(doc(db, "users", userId, "bookings", `${lessonId}_${timeSlot}`));

      fetchBookings();
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert('Kļūda atceļot nodarbību. Lūdzu mēģiniet vēlreiz.');
    }
  };

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

  if (loading) return <div>Ielādē...</div>;

  if (bookings.length === 0) {
    return <p>Nav rezervētu nodarbību</p>;
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {bookings.map((booking) => {
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
              <p>Pasniedzējs: {booking.teacherName}</p>
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
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
    </div>
  );
} 