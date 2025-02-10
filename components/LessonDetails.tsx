"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc, query, collection, where, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { BookingStatus } from "@/types/lesson";

interface WorkHours {
  [date: string]: {
    start: string;
    end: string;
  }[];
}

interface Teacher {
  displayName: string;
  email: string;
  description?: string;
  education?: string;
  experience?: string;
  workHours: WorkHours;
}

interface Lesson {
  id: string;
  subject: string;
  description: string;
  teacherId: string;
  teacherName: string;
  lessonLength: number;
  bookedTimes: {
    [timeSlot: string]: {
      studentId: string;
      studentName: string;
      status: BookingStatus;
      bookedAt: string;
    } | null;
  };
}

interface TimeSlot {
  date: string;
  start: string;
  end: string;
}

function renderTimeSlotSection(isTeacher: boolean, workHours: WorkHours, lessonLength: number, selectedTimeSlot: string | undefined, onTimeSelect: (timeSlot: string) => void, onBook: (timeSlot: string) => void) {
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

  return (
    <div>
      <TimeSlotPicker
        workHours={workHours}
        lessonLength={lessonLength}
        onTimeSlotSelect={(slot) => {
          console.log("Selected time slot:", slot);
          onTimeSelect(slot);
        }}
        selectedTimeSlot={selectedTimeSlot}
        mode="booking"
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
            onClick={() => {
              console.log("Booking slot:", selectedTimeSlot);
              onBook(selectedTimeSlot);
            }}
            className="btn btn-primary"
          >
            Rezervēt šo laiku
          </button>
        </div>
      )}
    </div>
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTeacherLessons, setAllTeacherLessons] = useState<Lesson[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setIsTeacher(userData?.isTeacher === true);
        setCurrentUser(user);
      } else {
        setIsTeacher(false);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!lessonId || typeof lessonId !== 'string') return;
    
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch lesson data
        const lessonRef = doc(db, "lessons", lessonId);
        const lessonSnap = await getDoc(lessonRef);
        
        if (!lessonSnap.exists()) {
          console.log("Lesson not found");
          router.push('/404');
          return;
        }

        const lessonData = lessonSnap.data();
        console.log("Fetched lesson data:", lessonData);
        
        setLesson({
          id: lessonSnap.id,
          ...lessonData
        } as Lesson);

        // Fetch teacher data
        const teacherRef = doc(db, "users", lessonData.teacherId);
        const teacherSnap = await getDoc(teacherRef);
        
        if (!teacherSnap.exists()) {
          console.error("Teacher not found");
          return;
        }

        const teacherData = teacherSnap.data();
        setTeacher({
          id: teacherSnap.id,
          ...teacherData
        } as Teacher);

      } catch (error) {
        console.error("Error fetching data:", error);
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
                  const bookedTimes = teacherLesson.bookedTimes || {};
                  return Object.entries(bookedTimes).some(([bookedSlot, booking]) => {
                    // Only consider pending and accepted bookings
                    if (!booking || booking.status === 'rejected') return false;
                    
                    const bookedStart = new Date(bookedSlot);
                    const bookedEnd = new Date(bookedStart);
                    bookedEnd.setMinutes(bookedEnd.getMinutes() + teacherLesson.lessonLength);
                    
                    const slotStart = new Date(slotKey);
                    const slotEnd = new Date(slotStart);
                    slotEnd.setMinutes(slotEnd.getMinutes() + lesson.lessonLength);
                    
                    return (
                      (slotStart >= bookedStart && slotStart < bookedEnd) ||
                      (slotEnd > bookedStart && slotEnd <= bookedEnd) ||
                      (slotStart <= bookedStart && slotEnd >= bookedEnd)
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

  async function handleBook(timeSlot: string) {
    if (!auth.currentUser) {
      alert("Lūdzu piesakieties, lai rezervētu nodarbību");
      return;
    }

    if (!lesson || !teacher) {
      alert("Kļūda ielādējot datus. Lūdzu mēģiniet vēlreiz.");
      return;
    }

    try {
      // Get current user's name
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();

      const bookingData = {
        lessonId: lesson.id,
        subject: lesson.subject,
        teacherId: lesson.teacherId,
        teacherName: lesson.teacherName,
        studentId: auth.currentUser.uid,
        studentName: userData?.displayName || 'Unknown Student',
        timeSlot: timeSlot,
        status: 'pending' as BookingStatus,
        bookedAt: new Date().toISOString(),
        lessonLength: lesson.lessonLength,
        category: params.category as string,
        subjectId: params.subjectId as string
      };

      // If this is a reschedule, first cancel the old booking
      if (oldTimeSlot) {
        // Remove old booking from lesson
        await updateDoc(doc(db, "lessons", lesson.id), {
          [`bookedTimes.${oldTimeSlot}`]: null
        });

        // Remove old booking from teacher's bookings
        await deleteDoc(
          doc(db, "users", lesson.teacherId, "bookings", `${lesson.id}_${oldTimeSlot}`)
        );

        // Remove old booking from student's bookings
        await deleteDoc(
          doc(db, "users", auth.currentUser.uid, "bookings", `${lesson.id}_${oldTimeSlot}`)
        );
      }

      // Create new booking
      // Update lesson document
      const lessonRef = doc(db, "lessons", lesson.id);
      await updateDoc(lessonRef, {
        [`bookedTimes.${timeSlot}`]: {
          studentId: auth.currentUser.uid,
          studentName: userData?.displayName || 'Unknown Student',
          status: 'pending',
          bookedAt: new Date().toISOString()
        }
      });

      // Add to teacher's bookings
      await setDoc(
        doc(db, "users", lesson.teacherId, "bookings", `${lesson.id}_${timeSlot}`),
        bookingData
      );

      // Add to student's bookings
      await setDoc(
        doc(db, "users", auth.currentUser.uid, "bookings", `${lesson.id}_${timeSlot}`),
        bookingData
      );

      alert(oldTimeSlot ? "Nodarbība veiksmīgi pārplānota!" : "Nodarbība veiksmīgi rezervēta!");
      router.push("/profile");
    } catch (error) {
      console.error("Error booking lesson:", error);
      alert("Kļūda " + (oldTimeSlot ? "pārplānojot" : "rezervējot") + " nodarbību. Lūdzu mēģiniet vēlreiz.");
    }
  }

  const handleTimeSelect = (timeSlot: string) => {
    console.log("Time slot selected:", timeSlot);
    setSelectedTimeSlot(timeSlot);
  };

  if (loading) return <div className="p-8 text-center">Ielādē...</div>;
  if (!lesson || !teacher) return <div className="p-8 text-center">Nodarbība nav atrasta</div>;

  if (isTeacher) {
    return (
      <div className="alert alert-error mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">Pasniedzēji nevar rezervēt nodarbības!</h3>
          <div className="text-sm">Šī funkcionalitāte ir pieejama tikai skolēniem.</div>
        </div>
      </div>
    );
  }

  console.log('Passing to TimeSlotPicker:', {
    workHours: teacher?.workHours,
    lessonLength: lesson?.lessonLength,
    bookedTimes: lesson?.bookedTimes
  });

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
            {teacher?.education && (
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
                {(teacher?.displayName || lesson.teacherName).charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {teacher?.displayName || lesson.teacherName}
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {teacher?.email}
                </div>
              </div>
            </div>

            {teacher?.description ? (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Par pasniedzēju</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {console.log("Description content:", teacher.description)}
                  {teacher.description}
                </p>
              </div>
            ) : (
              console.log("No description available")
            )}
          </div>

          <div className="divider my-8"></div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Izvēlieties laiku</h3>
            <div className="booking-alerts mb-4"></div>
            <TimeSlotPicker
              workHours={teacher?.workHours || {}}
              lessonLength={lesson?.lessonLength || 60}
              onTimeSlotSelect={handleTimeSelect}
              selectedTimeSlot={selectedTimeSlot}
              mode="booking"
              bookedTimes={lesson?.bookedTimes || {}}
            />
          </div>

          {selectedTimeSlot && !isTeacher && (
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
                className="btn btn-primary w-full"
              >
                Rezervēt šo laiku
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
