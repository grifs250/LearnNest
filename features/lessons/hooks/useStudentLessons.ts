"use client";

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { StudentLesson, TeacherData, LessonData } from "../types";
import { toast } from "react-hot-toast";

export function useStudentLessons(studentId: string) {
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLessons() {
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

      setLessons(lessonsList);
      setError(null);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setError("Failed to load your lessons");
      toast.error("Neizdevās ielādēt nodarbības");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLessons();
  }, [studentId]);

  return {
    lessons,
    loading,
    error,
    refreshLessons: fetchLessons
  };
} 