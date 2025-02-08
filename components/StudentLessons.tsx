"use client";
import { useState, useEffect } from 'react';
import { db } from "../lib/firebaseClient";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
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

export default function StudentLessons({ studentId }: StudentLessonsProps) {
  const router = useRouter();
  const [myLessons, setMyLessons] = useState<StudentLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyLessons();
  }, [studentId]);

  async function fetchMyLessons() {
    setLoading(true);
    setError(null);
    try {
      const lessonsQuery = query(
        collection(db, "lessons"),
        where("bookedTimes", "!=", null)
      );
      const lessonsSnap = await getDocs(lessonsQuery);
      
      const lessonsList: StudentLesson[] = [];
      
      for (const docSnap of lessonsSnap.docs) {
        const data = docSnap.data() as LessonData;
        const bookedTimes = data.bookedTimes ?? {};
        
        for (const [timeSlot, booking] of Object.entries(bookedTimes)) {
          if (booking?.studentId === studentId) {
            const [date, time] = timeSlot.split('T');
            
            // Fetch teacher data
            const teacherDoc = await getDoc(doc(db, "users", data.teacherId));
            const teacherData = teacherDoc.data() as TeacherData;
            
            lessonsList.push({
              id: docSnap.id,
              subject: data.subject,
              teacherName: data.teacherName,
              teacherId: data.teacherId,
              date,
              time,
              status: booking.status ?? 'pending',
              availableTimes: Object.keys(teacherData?.workHours ?? {}),
              category: data.category ?? 'subjects',
              subjectId: data.subjectId
            });
          }
        }
      }

      setMyLessons(lessonsList);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setError("Failed to load your lessons");
    } finally {
      setLoading(false);
    }
  }

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
      setMyLessons(prev => prev.filter(lesson => 
        !(lesson.id === lessonId && `${lesson.date}T${lesson.time}` === timeSlot)
      ));

      alert("Lesson cancelled successfully");
    } catch (error) {
      console.error("Error cancelling lesson:", error);
      setError("Failed to cancel lesson");
    }
  }

  async function handleReschedule(lesson: StudentLesson, timeSlot: string) {
    try {
      // Use the full path structure
      router.push(`/lessons/${lesson.category || 'all'}/${lesson.subject}/${lesson.id}?oldTimeSlot=${timeSlot}`);
    } catch (error) {
      console.error("Error preparing reschedule:", error);
      setError("Failed to prepare reschedule");
    }
  }

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (myLessons.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg p-8 text-center">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">
            🎓 Nav rezervētu nodarbību
          </h2>
          <p className="text-gray-600 mb-6">
            Jums pašlaik nav nevienas rezervētas nodarbības. 
            Izvēlieties mācību priekšmetu un sāciet mācīties!
          </p>
          <div className="card-actions justify-center">
            <button 
              onClick={() => router.push('/#subjects')} 
              className="btn btn-primary btn-lg"
            >
              <span className="mr-2">📚</span>
              Atrast Nodarbību
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myLessons.map(lesson => (
        <div key={`${lesson.id}-${lesson.date}-${lesson.time}`} className="card bg-base-100 shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{lesson.subject}</h3>
              <p>Pasniedzējs: {lesson.teacherName}</p>
              <p>
                {new Date(`${lesson.date}T${lesson.time}`).toLocaleString('lv-LV', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className={`badge mt-2 ${getStatusBadgeClass(lesson.status)}`}>
                {getStatusText(lesson.status)}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReschedule(
                  lesson,
                  `${lesson.date}T${lesson.time}`
                )}
                className="btn btn-primary btn-sm"
              >
                Rezervēt jaunu laiku
              </button>
              <button
                onClick={() => handleCancel(lesson.id, `${lesson.date}T${lesson.time}`)}
                className="btn btn-error btn-sm"
              >
                Atcelt
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 