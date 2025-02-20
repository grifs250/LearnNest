"use client";

import { useState, useEffect } from "react";
import { lessonService } from "../services/lessonService";
import { Lesson, TeacherData } from "../types";
import { toast } from "react-hot-toast";

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
        const { lesson, teacherData } = await lessonService.fetchLessonAndTeacher(lessonId);
        setLesson(lesson);
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