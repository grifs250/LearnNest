"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import TimeSlotPicker from "@/components/TimeSlotPicker";

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

interface TimeSlot {
  date: string;
  start: string;
  end: string;
}

function renderTimeSlotSection(isTeacher: boolean, availableSlots: TimeSlot[], selectedSlot: TimeSlot | null, onSelect: (slot: TimeSlot | null) => void, onBook: (timeSlot: string) => void) {
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
        availableSlots={availableSlots}
        selectedSlot={selectedSlot}
        onSelect={onSelect}
        disabled={isTeacher}
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

export default function LessonDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const oldTimeSlot = searchParams.get('oldTimeSlot');
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTeacherLessons, setAllTeacherLessons] = useState<Lesson[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsTeacher(!!userDoc.data().isTeacher);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!lessonId || typeof lessonId !== 'string') return;
    
    async function fetchData() {
      try {
        // Fetch current lesson
        const lessonRef = doc(db, "lessons", lessonId as string);
        const lessonSnap = await getDoc(lessonRef);
        if (!lessonSnap.exists()) {
          router.push('/404');
          return;
        }

        const lessonData = lessonSnap.data() as Omit<Lesson, 'id'>;
        setLesson({ id: lessonSnap.id, ...lessonData });
        
        // Fetch teacher data
        const teacherSnap = await getDoc(doc(db, "users", lessonData.teacherId));
        if (teacherSnap.exists()) {
          setTeacher(teacherSnap.data() as Teacher);
        }

        // Fetch all lessons from this teacher
        const teacherLessonsQuery = query(
          collection(db, "lessons"),
          where("teacherId", "==", lessonData.teacherId)
        );
        const teacherLessonsSnap = await getDocs(teacherLessonsQuery);
        const teacherLessons = teacherLessonsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Lesson));
        setAllTeacherLessons(teacherLessons);

      } catch (error) {
        console.error("Error fetching lesson details:", error);
        alert("Kļūda ielādējot nodarbības datus");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [lessonId, router]);

  useEffect(() => {
    if (teacher?.workHours && lesson) {
      const slots: TimeSlot[] = [];
      Object.entries(teacher.workHours).forEach(([date, timeRanges]) => {
        // Only include future dates
        if (new Date(date) >= new Date()) {
          timeRanges.forEach(({ start, end }) => {
            const startTime = new Date(`${date}T${start}`);
            const endTime = new Date(`${date}T${end}`);
            
            while (startTime < endTime) {
              const slotEnd = new Date(startTime);
              slotEnd.setMinutes(slotEnd.getMinutes() + lesson.lessonLength);
              
              if (slotEnd <= endTime) {
                const timeSlot = {
                  date,
                  start: startTime.toTimeString().slice(0, 5),
                  end: slotEnd.toTimeString().slice(0, 5)
                };
                
                // Check if slot overlaps with any booked times across all teacher's lessons
                const slotKey = `${date}T${timeSlot.start}`;
                const isSlotAvailable = !allTeacherLessons.some(teacherLesson => {
                  // Check each lesson's booked times
                  const bookedTimes = teacherLesson.bookedTimes || {};
                  return Object.entries(bookedTimes).some(([bookedSlot, booking]) => {
                    if (!booking) return false;
                    
                    // Convert both times to Date objects for comparison
                    const bookedStart = new Date(bookedSlot);
                    const bookedEnd = new Date(bookedStart);
                    bookedEnd.setMinutes(bookedEnd.getMinutes() + lesson.lessonLength);
                    
                    const slotStart = new Date(slotKey);
                    const slotEndTime = new Date(slotStart);
                    slotEndTime.setMinutes(slotEndTime.getMinutes() + lesson.lessonLength);
                    
                    // Check for overlap
                    return (
                      (slotStart >= bookedStart && slotStart < bookedEnd) ||
                      (slotEndTime > bookedStart && slotEndTime <= bookedEnd) ||
                      (slotStart <= bookedStart && slotEndTime >= bookedEnd)
                    );
                  });
                });

                if (isSlotAvailable) {
                  slots.push(timeSlot);
                }
              }
              
              startTime.setMinutes(startTime.getMinutes() + lesson.lessonLength);
            }
          });
        }
      });
      
      setAvailableSlots(slots);
    }
  }, [teacher, lesson, allTeacherLessons]);

  async function handleBook(newTimeSlot: string) {
    if (!lessonId || typeof lessonId !== 'string') return;
    if (!selectedSlot) {
      alert("Lūdzu, izvēlieties laiku!");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      // Show inline warning instead of full page
      const warningDiv = document.createElement('div');
      warningDiv.className = 'alert alert-warning mt-4';
      warningDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <div>
          <h3 class="font-bold">Lūdzu, pieslēdzieties!</h3>
          <div class="text-sm">Lai rezervētu nodarbību, vispirms ir jāpieslēdzas.</div>
        </div>
        <a href="/auth?mode=login" class="btn btn-sm">Pieslēgties</a>
      `;
      document.querySelector('.booking-alerts')?.appendChild(warningDiv);
      return;
    }

    try {
      const slotKey = `${selectedSlot.date}T${selectedSlot.start}`;
      const lessonRef = doc(db, "lessons", lessonId);

      // If this is a reschedule
      if (oldTimeSlot) {
        // First book the new time
        await updateDoc(lessonRef, {
          [`bookedTimes.${slotKey}`]: {
            studentId: user.uid,
            status: 'pending'
          }
        });

        // Then cancel the old booking
        await updateDoc(lessonRef, {
          [`bookedTimes.${oldTimeSlot}`]: null
        });

        alert("Nodarbība pārplānota! Gaidiet pasniedzēja apstiprinājumu.");
      } else {
        // Normal booking process
        await updateDoc(lessonRef, {
          [`bookedTimes.${slotKey}`]: {
            studentId: user.uid,
            status: 'pending'
          }
        });
        alert("Nodarbība rezervēta! Gaidiet pasniedzēja apstiprinājumu.");
      }

      router.push("/profile");
    } catch (error) {
      console.error("Kļūda rezervējot nodarbību:", error);
      alert("Neizdevās rezervēt nodarbību.");
    }
  }

  if (loading) return <div className="p-8 text-center">Ielādē...</div>;
  if (!lesson || !teacher) return <div className="p-8 text-center">Nodarbība nav atrasta</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{lesson.subject}</h1>
      <p className="mb-4">{lesson.description}</p>
      
      <div className="bg-base-200 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Par pasniedzēju</h2>
        <p className="mb-2">Pasniedzējs: {lesson.teacherName}</p>
        {teacher.bio && <p className="mb-2">Bio: {teacher.bio}</p>}
        {teacher.education && <p className="mb-2">Izglītība: {teacher.education}</p>}
        {teacher.experience && <p className="mb-2">Pieredze: {teacher.experience}</p>}
      </div>

      <p className="mb-4">Nodarbības ilgums: {lesson.lessonLength} minūtes</p>

      <div className="booking-alerts"></div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Izvēlieties laiku:</h3>
        {renderTimeSlotSection(isTeacher, availableSlots, selectedSlot, setSelectedSlot, handleBook)}
      </div>
    </div>
  );
}
