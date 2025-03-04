"use client";

import { useState, useEffect } from "react";
import { lessonService } from "../services/lessonService";
import { Lesson, TeacherData, DbLesson } from "../types";
import { toast } from "react-hot-toast";

// Convert any lesson data to Lesson
const convertToLesson = (lessonData: any): Lesson => {
  return {
    id: lessonData.id,
    title: lessonData.title,
    description: lessonData.description || null,
    price: lessonData.price,
    duration: lessonData.duration,
    subject_id: lessonData.subject_id,
    teacher_id: lessonData.teacher_id,
    image_url: null,
    video_url: null,
    is_active: lessonData.is_active ?? false,
    is_featured: false,
    is_online: false,
    max_students: lessonData.max_students ?? 1,
    created_at: lessonData.created_at || new Date().toISOString(),
    updated_at: lessonData.updated_at,
    location: null,
    difficulty_level: null,
    language: 'lv', // Default to Latvian
    tags: null
  };
};

export function useLessonDetails(
  category: string,
  subjectId: string,
  lessonId: string
) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const { lesson: lessonData, teacherData } = await lessonService.fetchLessonAndTeacher(lessonId);
        
        if (lessonData) {
          const convertedLesson = convertToLesson(lessonData);
          setLesson(convertedLesson);
        }
        
        setTeacher(teacherData);
      } catch (err) {
        console.error("Error fetching lesson details:", err);
        setError("Failed to load lesson details");
        toast.error("Neizdevās ielādēt nodarbības detaļas");
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) {
      fetchDetails();
    }
  }, [lessonId]);

  return { lesson, teacher, loading, error };
} 