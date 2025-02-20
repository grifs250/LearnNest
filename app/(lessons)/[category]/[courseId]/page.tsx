"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { Lesson } from "@/features/lessons/types";
import { toast } from "react-hot-toast";

export default function LessonPage() {
  const { category, courseId } = useParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "lessons"), 
          where("courseId", "==", courseId)
        );
        const querySnapshot = await getDocs(q);
        
        setLessons(querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Lesson)));
        
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError("Failed to load lessons");
        toast.error("Neizdevās ielādēt nodarbības");
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-error">
        <p>{error}</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {decodeURIComponent(category as string)} - Nav pieejamu nodarbību
        </h2>
        <p className="text-gray-600">
          Šajā kategorijā pagaidām nav pieejamas nodarbības.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {decodeURIComponent(category as string)} - Pieejamās nodarbības
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <Link 
            key={lesson.id} 
            href={`/lesson/${lesson.id}`} 
            className="card bg-white p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-bold">{lesson.subject}</h3>
            <p className="text-gray-600 line-clamp-3">{lesson.description}</p>
            <p className="text-sm mt-2">Pasniedzējs: {lesson.teacherName}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 