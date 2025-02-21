"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/db";
import { TimeSlotPicker } from "@/features/bookings/components";
import { Lesson, Teacher, WorkHours, BookingData, TimeRange, BookedTimeData } from "@/types/lesson";

interface TeacherData {
  displayName: string;
  email: string;
  description?: string;
  education?: string;
  experience?: string;
  workHours: WorkHours;
}

interface RawWorkHours {
  [key: string]: {
    timeSlots: TimeRange | TimeRange[];
  };
}

interface RawDayData {
  timeSlots: TimeRange | TimeRange[];
}

interface LessonDetailsProps {
  readonly category: string;
  readonly subjectId: string;
  readonly lessonId: string;
}

async function fetchLessonAndTeacher(lessonId: string): Promise<{lesson: Lesson; teacherData: TeacherData}> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) throw error;

  const teacherRef = supabase
    .from('users')
    .select('*')
    .eq('id', data.teacherId)
    .single();

  const teacherData = await teacherRef;

  const rawWorkHours = Object.entries(teacherData?.data?.workHours ?? {}).reduce((acc, [key, value]: [string, any]) => ({
    ...acc,
    [key]: { timeSlots: value.timeSlots }
  }), {} as { [key: string]: { timeSlots: TimeRange | TimeRange[] } });
  
  // Ensure work hours are in correct format
  const formattedWorkHours: WorkHours = {};
  
  // Convert raw work hours to standardized format
  (Object.entries(rawWorkHours) as [string, { timeSlots: TimeRange | TimeRange[] }][]).forEach(([day, dayData]) => {
    const numericDay = parseInt(day);
    if (isNaN(numericDay) || numericDay < 0 || numericDay > 6) return;
    
    formattedWorkHours[numericDay] = {
      enabled: true,
      timeSlots: Array.isArray(dayData.timeSlots) ? dayData.timeSlots : [dayData.timeSlots]
    };
  });

  return {
    lesson: {
      id: data.id,
      subject: data.subject,
      subjectId: data.subjectId,
      description: data.description,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      lessonLength: data.lessonLength,
      bookedTimes: data.bookedTimes ?? {},
      availableTimes: data.availableTimes ?? [],
      category: data.category,
      price: data.price ?? 0
    } as Lesson,
    teacherData: {
      ...teacherData.data,
      workHours: formattedWorkHours
    }
  };
}

async function createBooking(
  lesson: Lesson, 
  timeSlot: string, 
  userData: { displayName?: string } | undefined, 
  oldTimeSlot: string | null = null
): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  if (error || !user) throw new Error("No authenticated user");

  const bookingData: BookingData = {
    lessonId: lesson.id,
    subject: lesson.subject,
    teacherId: lesson.teacherId,
    teacherName: lesson.teacherName,
    studentId: user.id,
    studentName: userData?.displayName ?? 'Unknown Student',
    timeSlot,
    status: 'pending',
    bookedAt: new Date().toISOString(),
    lessonLength: lesson.lessonLength,
    price: lesson.price,
    category: lesson.category,
    subjectId: lesson.subjectId,
    id: '',
    date: '',
    time: ''
  };

  const { data: bookingInsertData, error: bookingInsertError } = await supabase
    .from('bookings')
    .insert([bookingData])
    .eq('lessonId', lesson.id)
    .eq('timeSlot', timeSlot);

  if (bookingInsertError) throw bookingInsertError;
}

function isTimeSlotAvailable(
  timeSlot: string, 
  workHours: WorkHours, 
  bookedTimes: Record<string, BookedTimeData | null>
): boolean {
  const bookingDate = new Date(timeSlot);
  const dayOfWeek = bookingDate.getDay();
  const bookingTime = bookingDate.toTimeString().slice(0, 5);
  
  // Check work hours
  const daySchedule = workHours[dayOfWeek];
  if (!daySchedule?.enabled) return false;
  
  const withinWorkHours = daySchedule.timeSlots.some((timeRange: TimeRange) => 
    bookingTime >= timeRange.start && bookingTime <= timeRange.end
  );
  if (!withinWorkHours) return false;

  // Check existing bookings
  const isBooked = bookedTimes[timeSlot]?.status !== 'rejected';
  return !isBooked;
}

function getLessonId(params: any): string | null {
  if (typeof params?.lessonId === 'string') return params.lessonId;
  if (Array.isArray(params?.lessonId)) return params.lessonId[0];
  return null;
}

export function LessonDetails({ category, subjectId, lessonId }: Readonly<LessonDetailsProps>) {
  const params = useParams();
  const searchParams = useSearchParams();
  const oldTimeSlot = searchParams.get('oldTimeSlot');
  const lessonIdProp = lessonId;
  
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        const { lesson, teacherData } = await fetchLessonAndTeacher(lessonId);
        console.log('Teacher work hours:', teacherData.workHours); // Debug log
        setLesson(lesson);
        setTeacher({
          displayName: teacherData.displayName ?? '',
          email: teacherData.email ?? '',
          description: teacherData.description ?? '',
          education: teacherData.education ?? '',
          experience: teacherData.experience ?? '',
          workHours: teacherData.workHours ?? {}
        });
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson');
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, router]);

  useEffect(() => {
    if (teacher) {
      console.log('Teacher data in LessonDetails:', teacher);
      console.log('Teacher work hours:', teacher.workHours);
    }
  }, [teacher]);

  const handleTimeSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleBook = async (timeSlot: string) => {
    setIsBooking(true);
    try {
      if (!supabase.auth.user()) {
        alert("Lūdzu piesakieties, lai rezervētu nodarbību");
        return;
      }

      if (!lesson || !teacher) {
        alert("Kļūda ielādējot datus. Lūdzu mēģiniet vēlreiz.");
        return;
      }

      await createBooking(lesson, timeSlot, {}, oldTimeSlot);
      
      if (oldTimeSlot) {
        alert("Nodarbība veiksmīgi pārplānota!");
      } else {
        alert("Nodarbība veiksmīgi rezervēta! Gaidiet pasniedzēja apstiprinājumu.");
      }
      router.push("/profile");
    } catch (error: any) {
      let errorMessage = "Kļūda rezervējot nodarbību.";
      if (error.message.includes("outside teacher's work hours")) {
        errorMessage = "Izvēlētais laiks ir ārpus pasniedzēja darba laika.";
      } else if (error.message.includes("no longer available")) {
        errorMessage = "Diemžēl šis laiks vairs nav pieejams.";
      }
      alert(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Ielādē...</div>;
  if (error) return <div className="p-8 text-center">{error}</div>;
  if (!lesson || !teacher) return <div className="p-8 text-center">Nodarbība nav atrasta</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-base-100 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-base-200 p-8">
          <h1 className="text-3xl font-bold mb-4">{lesson.subject}</h1>
          <p className="text-lg text-gray-600 mb-4">{lesson.description}</p>
          <div className="flex flex-wrap gap-4 items-center text-gray-600">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lesson.lessonLength} min
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              €{lesson.price.toFixed(2)}
            </div>
            {teacher.education && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                {teacher.education}
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center text-xl font-bold">
                {teacher.displayName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{teacher.displayName}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {teacher.email}
                </div>
              </div>
            </div>

            {teacher.description && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Par pasniedzēju</h3>
                <p className="text-gray-600 whitespace-pre-line">{teacher.description}</p>
              </div>
            )}
          </div>

          <div className="divider my-8"></div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Izvēlieties laiku</h3>
            <div className="booking-alerts mb-4"></div>
            {isTeacher ? (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold">Pasniedzēji nevar rezervēt nodarbības!</h3>
                  <div className="text-sm">Šī funkcionalitāte ir pieejama tikai skolēniem.</div>
                </div>
              </div>
            ) : (
              <div>
                <TimeSlotPicker
                  workHours={teacher.workHours}
                  lessonLength={lesson.lessonLength}
                  onTimeSlotSelect={handleTimeSelect}
                  selectedTimeSlot={selectedTimeSlot}
                  mode="booking"
                  bookedTimes={lesson.bookedTimes}
                  teacherId={lesson.teacherId}
                />
                
                {selectedTimeSlot && (
                  <div className="mt-4">
                    <p className="text-sm mb-2">
                      Izvēlētais laiks: {new Date(selectedTimeSlot).toLocaleString('lv-LV', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <button 
                      onClick={() => handleBook(selectedTimeSlot)}
                      className={`btn btn-primary ${isBooking ? 'loading' : ''}`}
                      disabled={isBooking}
                    >
                      {isBooking ? 'Rezervē...' : 'Rezervēt šo laiku'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
