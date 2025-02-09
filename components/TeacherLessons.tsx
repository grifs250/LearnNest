"use client";
import { useState, useEffect } from 'react';
import { db } from "../lib/firebaseClient";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { format } from 'date-fns';
import { lv } from 'date-fns/locale';
import { LessonCreator } from './LessonCreator';
import { WorkHours } from './WorkHours';
import { LessonCalendar } from './LessonCalendar';
import { TeacherLesson } from '@/types/lesson';

interface Booking {
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function TeacherLessons({ teacherId }: { readonly teacherId: string }) {
  const [lessons, setLessons] = useState<TeacherLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('lessons');

  const loadLessons = async () => {
    if (!teacherId) return;
    
    setLoading(true);
    setError(null);

    try {
      const lessonsQuery = query(
        collection(db, "lessons"),
        where("teacherId", "==", teacherId)
      );
      const lessonsSnap = await getDocs(lessonsQuery);
      
      const lessonsList: TeacherLesson[] = [];
      
      for (const lessonDoc of lessonsSnap.docs) {
        const lessonData = lessonDoc.data();
        const bookedTimes = lessonData.bookedTimes || {};
        
        for (const [timeSlot, booking] of Object.entries(bookedTimes)) {
          const bookingData = booking as Booking;
          if (bookingData?.studentId) {
            const [date, time] = timeSlot.split('T');
            
            // Get student info
            const studentDoc = await getDoc(doc(db, "users", bookingData.studentId));
            const studentName = studentDoc.exists() ? studentDoc.data().displayName : "Unknown";
            
            lessonsList.push({
              id: lessonDoc.id,
              subject: lessonData.subject,
              studentName,
              studentId: bookingData.studentId,
              teacherId: lessonData.teacherId,
              date,
              time,
              status: bookingData.status || 'pending',
              price: lessonData.price || 0
            });
          }
        }
      }
      
      setLessons(lessonsList);
    } catch (err) {
      console.error("Error loading lessons:", err);
      setError("Neizdevās ielādēt stundas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [teacherId]);

  const getStatusBadgeClass = (status: string) => {
    if (status === 'accepted') return 'badge-success';
    if (status === 'rejected') return 'badge-error';
    return 'badge-warning';
  };

  const getStatusText = (status: string) => {
    if (status === 'accepted') return 'Apstiprināts';
    if (status === 'rejected') return 'Noraidīts';
    return 'Gaida apstiprinājumu';
  };

  const handleLessonCreated = () => {
    // Refresh lessons list
    loadLessons();
    setActiveTab('lessons');
  };

  if (loading) return <div className="flex justify-center">
    <span className="loading loading-spinner loading-md"></span>
  </div>;

  if (error) return <div className="text-error">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${activeTab === 'lessons' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          Stundas
        </button>
        <button 
          className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Izveidot Stundu
        </button>
        <button 
          className={`tab ${activeTab === 'workhours' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('workhours')}
        >
          Darba Laiks
        </button>
        <button 
          className={`tab ${activeTab === 'calendar' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Kalendārs
        </button>
      </div>

      {activeTab === 'lessons' && (
        <div className="space-y-4">
          {lessons.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Nav aktīvu stundu
            </div>
          ) : (
            lessons.map((lesson) => {
              const lessonDate = new Date(`${lesson.date}T${lesson.time}`);
              return (
                <div key={`${lesson.id}-${lesson.date}-${lesson.time}`} 
                     className="card bg-base-100 shadow p-4"
                >
                  <h3 className="font-semibold">{lesson.subject}</h3>
                  <p>Students: {lesson.studentName}</p>
                  <p>
                    {format(lessonDate, 'EEEE, d MMMM yyyy HH:mm', { locale: lv })}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <div className={`badge ${getStatusBadgeClass(lesson.status)}`}>
                      {getStatusText(lesson.status)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="card bg-base-100 shadow p-4">
          <LessonCreator teacherId={teacherId} onLessonCreated={handleLessonCreated} />
        </div>
      )}

      {activeTab === 'workhours' && (
        <div className="card bg-base-100 shadow p-4">
          <WorkHours teacherId={teacherId} />
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="card bg-base-100 shadow p-4">
          <LessonCalendar lessons={lessons} />
        </div>
      )}
    </div>
  );
} 