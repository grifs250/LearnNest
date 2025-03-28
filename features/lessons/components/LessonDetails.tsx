"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useClerkSupabase } from "@/lib/hooks/useClerkSupabase";
import { useUser } from "@clerk/nextjs";
import { TimeSlotPicker } from "@/features/bookings/components";
import type { Lesson, TeacherProfile } from "@/features/lessons/types";
import { WorkHours, TimeRange } from "@/features/bookings/types";
import { toast } from "react-hot-toast";
import { createClient } from '@/lib/supabase/client';
import { formatClerkId } from "@/lib/utils";

interface LessonDetailsProps {
  readonly category: string;
  readonly subjectId: string;
  readonly lessonId: string;
}

interface ScheduleWithBookings {
  id: string;
  start_time: string;
  end_time: string;
  bookings?: Array<{
    student_id: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

interface ExtendedLesson extends Lesson {
  lesson_schedules?: ScheduleWithBookings[];
}

async function fetchLessonAndTeacher(lessonId: string): Promise<{lesson: ExtendedLesson; teacher: TeacherProfile}> {
  const supabase = createClient();
  
  // Fetch lesson with its schedules, bookings and teacher
  const { data: lessonData, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      *,
      teacher:profiles(*),
      lesson_schedules (
        *,
        bookings (*)
      )
    `)
    .eq('id', lessonId)
    .single();

  if (lessonError) throw lessonError;
  if (!lessonData) throw new Error('Lesson not found');

  return {
    lesson: lessonData as ExtendedLesson,
    teacher: lessonData.teacher as TeacherProfile
  };
}

export function LessonDetails({ category, subjectId, lessonId }: LessonDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oldTimeSlot = searchParams.get('oldTimeSlot');
  const { user } = useUser();
  const { supabase } = useClerkSupabase();
  const [lesson, setLesson] = useState<ExtendedLesson | null>(null);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { lesson, teacher } = await fetchLessonAndTeacher(lessonId);
        setLesson(lesson);
        setTeacher(teacher);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const handleTimeSelected = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const handleBook = async (scheduleId: string) => {
    if (!user || !lesson) return;

    setIsBooking(true);
    try {
      const formattedUserId = formatClerkId(user.id);
      const bookingData = {
        schedule_id: scheduleId,
        student_id: formattedUserId,
        status: 'pending',
        payment_status: 'pending',
      };
      
      if (!supabase) throw new Error('Supabase klienta inicializēšanas kļūda');

      // Create a lesson schedule first
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('lesson_schedules')
        .insert({
          lesson_id: lesson.id,
          start_time: selectedTimeSlot ? selectedTimeSlot : new Date().toISOString(),
          end_time: selectedTimeSlot 
            ? new Date(new Date(selectedTimeSlot).getTime() + (lesson.duration || 60) * 60000).toISOString()
            : new Date(new Date().getTime() + (lesson.duration || 60) * 60000).toISOString(),
          is_available: false
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;
      if (!scheduleData) throw new Error('Neizdevās izveidot nodarbības grafiku');

      // Create the booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData);

      if (bookingError) throw bookingError;
      
      toast.success(oldTimeSlot ? "Nodarbība pārplānota veiksmīgi!" : "Nodarbība rezervēta veiksmīgi!");
      router.push("/dashboard/student/bookings");
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || "Neizdevās rezervēt nodarbību");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center">{error}</div>;
  if (!lesson || !teacher) return <div className="p-8 text-center">Lesson not found</div>;

  // Extract teacher information from the profile with fallbacks
  const teacherBio = teacher.teacher_bio || teacher.page_description || '';
  const teacherEducation = teacher.teacher_education || [];
  const teacherExperience = teacher.teacher_experience_years || null;
  
  // Create a structured workHours object for the TimeSlotPicker
  const defaultTimeRange: TimeRange = { start: '09:00', end: '17:00' };
  const weekendTimeRange: TimeRange = { start: '10:00', end: '15:00' };
  
  const workHours: WorkHours = {
    monday: defaultTimeRange,
    tuesday: defaultTimeRange,
    wednesday: defaultTimeRange,
    thursday: defaultTimeRange,
    friday: defaultTimeRange,
    saturday: weekendTimeRange,
    sunday: weekendTimeRange
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-100 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-base-200 p-8">
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{lesson.description}</p>
          <div className="flex flex-wrap gap-4 items-center text-gray-600">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lesson.duration || 60} min
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${lesson.price || 0}
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center text-xl font-bold">
                {teacher.full_name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{teacher.full_name}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {teacher.email}
                </div>
              </div>
            </div>
            {teacherBio && (
              <p className="text-gray-600 mb-4">{teacherBio}</p>
            )}
            {teacherEducation && teacherEducation.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Education</h3>
                <ul className="text-gray-600 list-disc pl-5">
                  {teacherEducation.map((edu, index) => (
                    <li key={index}>{edu}</li>
                  ))}
                </ul>
              </div>
            )}
            {teacherExperience && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Experience</h3>
                <p className="text-gray-600">{teacherExperience} years</p>
              </div>
            )}
          </div>

          <div className="booking-section">
            <h3 className="text-xl font-semibold mb-6">Choose a Time</h3>
            <div className="booking-alerts mb-4">
              <input
                type="date"
                className="input input-bordered w-full"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <TimeSlotPicker
                teacherId={lesson.teacher_id}
                selectedDate={selectedDate}
                onTimeSelected={handleTimeSelected}
                workHours={workHours}
                slotDuration={lesson.duration || 60}
              />
              {selectedTimeSlot && (
                <button
                  onClick={() => handleBook(selectedTimeSlot)}
                  disabled={isBooking}
                  className="btn btn-primary mt-4"
                >
                  {isBooking ? 'Notiek rezervēšana...' : 'Rezervēt tagad'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
