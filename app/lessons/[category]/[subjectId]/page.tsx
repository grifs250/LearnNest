"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Lesson } from "@/types/lesson";

export default function LessonsPage() {
  const { category, subjectId } = useParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      const q = query(
        collection(db, "lessons"),
        where("subject", "==", subjectId)
      );
      const querySnapshot = await getDocs(q);
      setLessons(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lesson)));
      setLoading(false);
    }
    fetchLessons();
  }, [subjectId]);

  if (loading) {
    return <div className="p-8 text-center">Ielādē...</div>;
  }

  if (lessons.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Nav pieejamu nodarbību</h1>
        <p>Šobrīd šajā priekšmetā nav pieejamu nodarbību. Lūdzu, mēģiniet vēlāk.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {decodeURIComponent(category as string)} - Pieejamās nodarbības
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="card bg-base-100 p-6 shadow">
            <h3 className="font-semibold">{lesson.subject}</h3>
            <p className="text-sm mt-2">{lesson.description}</p>
            <p className="text-sm mt-2">Pasniedzējs: {lesson.teacherName}</p>
            <p className="text-sm text-gray-500">Ilgums: {lesson.lessonLength} min</p>
            <a 
              href={`/lessons/${category}/${subjectId}/${lesson.id}`} 
              className="btn btn-primary mt-4"
            >
              Pieteikties
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 