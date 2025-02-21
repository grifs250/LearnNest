"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/db';
import { StudentLesson, TeacherData, LessonData, BookedTimeData } from "../types";
import { Tables } from '@/types/supabase.types';
import { toast } from "react-hot-toast";

export function useStudentLessons(studentId: string) {
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLessons() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;

      const lessonsList: StudentLesson[] = [];
      
      for (const lesson of (data as Tables['lessons']['Row'][])) {
        const bookedTimes = lesson.bookedTimes ?? {} as Record<string, BookedTimeData>;
        
        for (const [timeSlot, booking] of Object.entries(bookedTimes)) {
          const bookingData = booking as BookedTimeData;
          if (bookingData.studentId === studentId) {
            const [date, time] = timeSlot.split('T');
            
            const { data: teacherData } = await supabase
              .from('users')
              .select('*')
              .eq('id', lesson.teacherId)
              .single();
            
            lessonsList.push({
              id: lesson.id,
              subject: lesson.subject,
              teacherName: lesson.teacherName,
              teacherId: lesson.teacherId,
              date,
              time,
              status: bookingData.status ?? 'pending',
              availableTimes: Object.keys(teacherData?.workHours ?? {}),
              category: lesson.category ?? 'subjects',
              subjectId: lesson.subjectId
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

export async function getStudentLessons(studentId: string): Promise<StudentLesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;
    return (data as Tables['lessons']['Row'][]).map(lesson => ({
      id: lesson.id,
      subject: lesson.subject,
      teacherName: lesson.teacherName,
      teacherId: lesson.teacherId,
      date: '',
      time: '',
      status: 'pending',
      category: lesson.category,
      subjectId: lesson.subjectId
    }));
  } catch (error) {
    console.error('Error fetching student lessons:', error);
    throw error;
  }
} 