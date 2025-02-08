"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { Lesson } from "@/types/lesson";

export default function LessonPage() {
  const { category, courseId } = useParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    async function fetchLessons() {
      const q = query(collection(db, "lessons"), where("courseId", "==", courseId));
      const querySnapshot = await getDocs(q);
      setLessons(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lesson)));
    }
    fetchLessons();
  }, [courseId]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {decodeURIComponent(category as string)} - Pieejamās nodarbības
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <Link key={lesson.id} href={`/lesson/${lesson.id}`} className="card bg-white p-4 shadow-md">
            <h3 className="text-lg font-bold">{lesson.subject}</h3>
            <p>{lesson.description}</p>
            <p className="text-sm">Pasniedzējs: {lesson.teacherName}</p>
            <p>{lesson.date} {lesson.time}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
