"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CalendarEvent {
  id: string;
  subject: string;
  subjectId: string;
  category: string;
  date: string;
  time: string;
  studentName?: string;
  teacherName?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface BookingData {
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface CalendarProps {
  teacherId: string;
}

export default function Calendar({ teacherId }: CalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  async function loadEvents() {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const lessonsQuery = query(
        collection(db, "lessons"),
        where("bookedTimes", "!=", null)
      );

      const lessonsSnap = await getDocs(lessonsQuery);
      const monthEvents: CalendarEvent[] = [];

      for (const doc of lessonsSnap.docs) {
        const lessonData = doc.data();
        const bookedTimes = lessonData.bookedTimes || {};

        for (const [timeSlot, booking] of Object.entries(bookedTimes)) {
          if (!booking || typeof booking !== 'object') continue;
          const bookingData = booking as BookingData;

          const [date, time] = timeSlot.split('T');
          const eventDate = new Date(date);

          if (eventDate >= startOfMonth && eventDate <= endOfMonth) {
            monthEvents.push({
              id: doc.id,
              subject: lessonData.subject,
              subjectId: lessonData.subjectId,
              category: lessonData.category || 'subjects',
              date,
              time,
              studentName: bookingData.studentId,
              teacherName: lessonData.teacherName,
              status: bookingData.status
            });
          }
        }
      }

      setEvents(monthEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setLoading(false);
  }

  function handleEventClick(event: CalendarEvent) {
    router.push(`/lessons/${event.category}/${event.subjectId}/${event.id}`);
  }

  function getDaysInMonth(date: Date) {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }

  function getMonthName(date: Date) {
    return date.toLocaleString('lv-LV', { month: 'long', year: 'numeric' });
  }

  function getEventsForDay(day: number) {
    if (!day) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  }

  function navigateMonth(direction: 'prev' | 'next') {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  }

  const weekDays = [
    { key: 'mon', label: 'P' },
    { key: 'tue', label: 'O' },
    { key: 'wed', label: 'T' },
    { key: 'thu', label: 'C' },
    { key: 'fri', label: 'P' },
    { key: 'sat', label: 'S' },
    { key: 'sun', label: 'Sv' }
  ];
  const days = getDaysInMonth(currentDate);

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => navigateMonth('prev')}
            className="btn btn-ghost btn-sm"
          >
            <ChevronLeft />
          </button>
          <h2 className="text-xl font-semibold">
            {getMonthName(currentDate)}
          </h2>
          <button 
            onClick={() => navigateMonth('next')}
            className="btn btn-ghost btn-sm"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day.key} className="p-2 text-center font-semibold">
              {day.label}
            </div>
          ))}

          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day && 
              new Date().toDateString() === 
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div 
                key={`day-${index}`}
                className={`min-h-[100px] p-2 border ${
                  day ? 'bg-base-100' : 'bg-base-200'
                } ${isToday ? 'border-primary' : 'border-base-200'}`}
              >
                {day && (
                  <>
                    <div className={`text-right ${isToday ? 'text-primary font-bold' : ''}`}>
                      {day}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.map((event, eventIndex) => (
                        <button 
                          key={`${event.id}-${eventIndex}`}
                          onClick={() => handleEventClick(event)}
                          className={`w-full text-left text-xs p-1 rounded hover:opacity-80 transition-opacity ${
                            event.status === 'accepted' ? 'bg-success/20' :
                            event.status === 'rejected' ? 'bg-error/20' :
                            'bg-warning/20'
                          }`}
                        >
                          <div className="font-semibold truncate">
                            {event.subject}
                          </div>
                          <div className="truncate">
                            {event.time.substring(0, 5)}
                          </div>
                          <div className="truncate text-xs">
                            {auth.currentUser?.uid === event.studentName ? 
                              `👨‍🏫 ${event.teacherName}` : 
                              `👨‍🎓 ${event.studentName}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 