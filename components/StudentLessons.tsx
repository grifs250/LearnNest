"use client";
import { useState, useEffect } from 'react';
import { db } from "../lib/firebaseClient";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import PaymentForm from "./PaymentForm";
import { useRouter } from "next/navigation";

type BookingStatus = 'pending' | 'accepted' | 'rejected';

interface StudentLesson {
  id: string;
  subject: string;
  teacherName: string;
  teacherId: string;
  date: string;
  time: string;
  status: BookingStatus;
  availableTimes?: string[];
  category?: string;
  subjectId?: string;
}

interface TeacherData {
  workHours?: {
    [date: string]: string[];
  };
}

interface BookedTimeData {
  studentId: string;
  status: BookingStatus;
}

interface LessonData {
  subject: string;
  teacherId: string;
  teacherName: string;
  category: string;
  subjectId: string;
  bookedTimes: {
    [timeSlot: string]: BookedTimeData;
  };
}

interface StudentLessonsProps {
  readonly studentId: string;
}

interface BookedLesson {
  id: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  lessonLength: number;
  status: 'pending' | 'accepted' | 'rejected';
  price: number;
}

interface Booking {
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

function isBooking(obj: any): obj is Booking {
  return obj 
    && typeof obj === 'object'
    && 'studentId' in obj 
    && 'status' in obj;
}

function getStatusBadgeClass(status: BookingStatus): string {
  if (status === 'accepted') return 'badge-success';
  if (status === 'rejected') return 'badge-error';
  return 'badge-warning';
}

function getStatusText(status: string): string {
  if (status === 'accepted') return 'Apstiprināts';
  if (status === 'rejected') return 'Noraidīts';
  return 'Gaida apstiprinājumu';
}

export default function StudentLessons({ studentId }: StudentLessonsProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      if (!studentId) return;
      
      setLoading(true);
      setError(null);

      try {
        const lessonsQuery = query(
          collection(db, "lessons"),
          where("bookedTimes", "!=", null)
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        
        const bookingsList: BookedLesson[] = [];
        
        for (const lessonDoc of lessonsSnap.docs) {
          const lessonData = lessonDoc.data();
          const bookedTimes = lessonData.bookedTimes || {};
          
          for (const [timeSlot, booking] of Object.entries(bookedTimes)) {
            if (isBooking(booking) && booking.studentId === studentId) {
              const [date, time] = timeSlot.split('T');
              
              // Get teacher info
              const teacherDoc = await getDoc(doc(db, "users", lessonData.teacherId));
              const teacherName = teacherDoc.exists() ? teacherDoc.data().displayName : "Unknown";
              
              bookingsList.push({
                id: lessonDoc.id,
                subject: lessonData.subject,
                teacherId: lessonData.teacherId,
                teacherName,
                date,
                time,
                lessonLength: lessonData.lessonLength || 60,
                status: booking.status || 'pending',
                price: lessonData.price || 0
              });
            }
          }
        }
        
        setBookings(bookingsList);
      } catch (err) {
        console.error("Error loading bookings:", err);
        setError("Neizdevās ielādēt rezervācijas");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [studentId]);

  async function handleCancel(lessonId: string, timeSlot: string) {
    try {
      setError(null);
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonDoc = await getDoc(lessonRef);
      const lessonData = lessonDoc.data();
      
      if (!lessonData) throw new Error("Lesson not found");

      // Update lesson to remove booking
      await updateDoc(lessonRef, {
        [`bookedTimes.${timeSlot}`]: null
      });

      // Update local state
      setBookings(prev => prev.filter(lesson => 
        !(lesson.id === lessonId && `${lesson.date}T${lesson.time}` === timeSlot)
      ));

      alert("Lesson cancelled successfully");
    } catch (error) {
      console.error("Error cancelling lesson:", error);
      setError("Failed to cancel lesson");
    }
  }

  async function handleReschedule(lesson: BookedLesson, timeSlot: string) {
    try {
      // Use userId instead of studentId if necessary
      router.push(`/profile/${studentId}`);
    } catch (error) {
      console.error("Error preparing reschedule:", error);
      setError("Failed to prepare reschedule");
    }
  }

  if (loading) return <div className="flex justify-center">
    <span className="loading loading-spinner loading-md"></span>
  </div>;

  if (error) return <div className="text-error">{error}</div>;

  if (bookings.length === 0) return <div className="text-center text-muted-foreground">
    Nav aktīvu rezervāciju
  </div>;

  return (
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
            <div className="flex justify-between items-center mt-2">
              <div className={`badge ${getStatusBadgeClass(booking.status)}`}>
                {getStatusText(booking.status)}
              </div>
              {booking.status === 'accepted' && (
                <PaymentForm
                  lessonId={booking.id}
                  lessonTitle={booking.subject}
                  teacherId={booking.teacherId}
                  teacherName={booking.teacherName}
                  studentId={studentId}
                  studentName=""  // Will be filled from auth context
                  amount={booking.price}
                  onPaymentCreated={() => {
                    // Optional: Refresh bookings or show success message
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 