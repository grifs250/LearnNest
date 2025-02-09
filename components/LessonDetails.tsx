"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { Dialog } from "@/components/Dialog";
import { LessonData, TimeSlot } from "@/types/lesson";

interface Teacher {
  displayName: string;
  bio?: string;
  education?: string;
  experience?: string;
  workHours: {
    [key: string]: { // date in ISO format
      start: string; // HH:mm format
      end: string;   // HH:mm format
    }[];
  };
}

interface Lesson {
  id: string;
  subject: string;
  description: string;
  teacherId: string;
  teacherName: string;
  lessonLength: number;
  bookedTimes: { [key: string]: string }; // timeSlot -> studentId
}

function renderTimeSlotSection(
  isTeacher: boolean, 
  lesson: LessonData,
  availableSlots: TimeSlot[], 
  selectedSlot: TimeSlot | null, 
  onSelect: (date: string, time: string) => void, 
  onBook: (timeSlot: string) => void
) {
  if (isTeacher) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h3 className="font-bold">Pasniedzēji nevar rezervēt nodarbības!</h3>
          <div className="text-sm">Šī funkcionalitāte ir pieejama tikai skolēniem.</div>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return <p className="text-red-500">Šobrīd nav pieejamu laiku.</p>;
  }

  return (
    <>
      <TimeSlotPicker
        teacherId={lesson.teacherId}
        onTimeSelected={onSelect}
        excludedTimes={lesson.bookedTimes}
      />
      
      {selectedSlot && (
        <div className="mt-4">
          <p className="text-sm mb-2">
            Izvēlētais laiks: {new Date(`${selectedSlot.date}T${selectedSlot.start}`).toLocaleString('lv-LV', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <button 
            onClick={() => onBook(selectedSlot.date + 'T' + selectedSlot.start)}
            className="btn btn-primary"
          >
            Rezervēt šo laiku
          </button>
        </div>
      )}
    </>
  );
}

interface LessonDetailsProps {
  readonly lessonId: string;
}

export default function LessonDetails({ lessonId }: LessonDetailsProps) {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const docRef = doc(db, "lessons", lessonId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setLesson({ id: docSnap.id, ...docSnap.data() } as LessonData);
        } else {
          setError("Nodarbība nav atrasta");
        }
      } catch (err) {
        console.error("Error loading lesson:", err);
        setError("Neizdevās ielādēt nodarbību");
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  const handleBooking = async (date: string, time: string) => {
    if (!auth.currentUser || !lesson) return;
    
    setBookingInProgress(true);
    try {
      const timeSlot = `${date}T${time}`;
      await updateDoc(doc(db, "lessons", lessonId), {
        [`bookedTimes.${timeSlot}`]: {
          studentId: auth.currentUser.uid,
          status: 'pending'
        }
      });
      
      router.push('/profile');
    } catch (err) {
      console.error("Error booking lesson:", err);
      setError("Neizdevās pieteikties nodarbībai");
    } finally {
      setBookingInProgress(false);
      setShowBookingDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error">
          <span>{error || "Nodarbība nav atrasta"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">{lesson.subject}</h2>
          <p className="text-lg">{lesson.description}</p>
          
          <div className="divider"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Par pasniedzēju</h3>
              <p>{lesson.teacherName}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Cena</h3>
              <p>{lesson.price} €</p>
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              onClick={() => setShowBookingDialog(true)}
              className="btn btn-primary"
              disabled={bookingInProgress}
            >
              {bookingInProgress ? 'Apstrādā...' : 'Pieteikties nodarbībai'}
            </button>
          </div>
        </div>
      </div>

      <Dialog
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        title="Izvēlies nodarbības laiku"
        description="Izvēlies sev piemērotu laiku no pieejamajiem laikiem"
        actions={
          <button
            onClick={() => setShowBookingDialog(false)}
            className="btn btn-ghost"
          >
            Atcelt
          </button>
        }
      >
        <TimeSlotPicker
          teacherId={lesson.teacherId}
          onTimeSelected={(date, time) => handleBooking(date, time)}
          excludedTimes={lesson.bookedTimes}
        />
      </Dialog>
    </div>
  );
}
