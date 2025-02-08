"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type Subject = {
  id: string;
  name: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
  subjects: Subject[];
};

interface CourseSectionsProps {
  readonly categories: Category[];
}

export default function CourseSections({ categories }: CourseSectionsProps) {
  const [subjectsWithLessons, setSubjectsWithLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSubjectsWithLessons() {
      const lessonsSnap = await getDocs(collection(db, "lessons"));
      const subjectsWithLessonsSet = new Set(
        lessonsSnap.docs.map(doc => doc.data().subject)
      );
      setSubjectsWithLessons(subjectsWithLessonsSet);
    }
    fetchSubjectsWithLessons();
  }, []);

  return (
    <div className="py-16 px-8 space-y-16">
      {categories.map((category) => (
        <section key={category.id} id={category.id} className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">{category.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {category.subjects.map((subject) => (
              <Link 
                key={subject.id} 
                href={`/lessons/${category.id}/${subject.id}`} 
                className={`card p-6 transition-all ${
                  subjectsWithLessons.has(subject.id)
                    ? 'bg-base-100 shadow-lg hover:shadow-xl'
                    : 'bg-base-200 opacity-60'
                }`}
              >
                <h4 className="font-semibold text-lg">{subject.name}</h4>
                {subjectsWithLessons.has(subject.id) ? (
                  <span className="text-sm text-success mt-2">✓ Pieejamas nodarbības</span>
                ) : (
                  <span className="text-sm text-gray-500 mt-2">Nav pieejamu nodarbību</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
