"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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

export default function LessonDetails() {
  const params = useParams();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId || typeof lessonId !== 'string') return;
    
    async function fetchData() {
      try {
        const lessonSnap = await getDoc(doc(db, "lessons", lessonId));
        if (!lessonSnap.exists()) {
          router.push('/404');
          return;
        }

        const lessonData = lessonSnap.data() as Omit<Lesson, 'id'>;
        setLesson({ id: lessonSnap.id, ...lessonData });
        
        const teacherSnap = await getDoc(doc(db, "users", lessonData.teacherId));
        if (teacherSnap.exists()) {
          setTeacher(teacherSnap.data() as Teacher);
        }
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
                
                // Only add if slot is in the future and not booked
                const slotKey = `${date}T${timeSlot.start}`;
                if (new Date(slotKey) > new Date() && !lesson.bookedTimes?.[slotKey]) {
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
  }, [teacher, lesson]);

  async function handleBook() {
    if (!lessonId || typeof lessonId !== 'string') return;
    if (!selectedSlot) {
      alert("Lūdzu, izvēlieties laiku!");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Lūdzu, pieslēdzieties!");
      return;
    }

    try {
      const slotKey = `${selectedSlot.date}T${selectedSlot.start}`;
      await updateDoc(doc(db, "lessons", lessonId), {
        [`bookedTimes.${slotKey}`]: {
          studentId: user.uid,
          status: 'pending'
        }
      });

      alert("Nodarbība rezervēta! Gaidiet pasniedzēja apstiprinājumu.");
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

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Izvēlieties laiku:</h3>
        {availableSlots.length > 0 ? (
          <>
            <TimeSlotPicker
              availableSlots={availableSlots}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
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
                  onClick={handleBook}
                  className="btn btn-primary"
                >
                  Rezervēt šo laiku
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-red-500">Šobrīd nav pieejamu laiku.</p>
        )}
      </div>
    </div>
  );
}
