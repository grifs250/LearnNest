"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Subject } from '@/types/database';
import { dbService } from '@/lib/supabase/db';

interface CourseSectionsProps {
  readonly subjects: Subject[];
}

/**
 * Custom hook to determine which subjects have available lessons
 */
function useAvailableLessons() {
  const [availableSubjects, setAvailableSubjects] = useState(new Set<string>());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveLessons() {
      try {
        // Fetch lessons with active status directly from database service
        const lessons = await dbService.getLessons({ is_active: true });
        
        // Extract unique subject IDs
        const subjectIds = new Set(
          lessons.map(lesson => lesson.subject_id)
        );
        
        setAvailableSubjects(subjectIds);
      } catch (error) {
        console.error('Error fetching available lessons:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActiveLessons();
  }, []);

  return {
    availableSubjects,
    isLoading
  };
}

const CATEGORY_NAMES: Record<string, string> = {
  languages: "Valodas",
  sciences: "Zinātnes",
  arts: "Māksla",
  music: "Mūzika",
  sports: "Sports",
  other: "Citi priekšmeti"
};

export function CourseSections({ subjects }: CourseSectionsProps) {
  const { availableSubjects, isLoading } = useAvailableLessons();

  if (isLoading) {
    return (
      <div className="py-16 px-8 flex justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!subjects?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nav pieejamu kategoriju</p>
      </div>
    );
  }

  return (
    <div className="py-16 px-8 space-y-16">
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Pieejamie priekšmeti
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            availableSubjects.has(subject.id) ? (
              <Link 
                key={subject.id} 
                href={`/lessons/${subject.category_id}/${subject.id}`}
                className="card bg-base-100 shadow-lg hover:shadow-xl p-6 transition-all"
              >
                <div className="card-body p-0">
                  <h4 className="font-semibold text-lg mb-2">{subject.name}</h4>
                  <div className="flex items-center text-success">
                    <span className="mr-2">✓</span>
                    <span>Pieejamas nodarbības</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div 
                key={subject.id}
                className="card bg-base-200 p-6 cursor-not-allowed border border-gray-200"
              >
                <div className="card-body p-0">
                  <h4 className="font-semibold text-lg mb-2 text-gray-500">{subject.name}</h4>
                  <div className="flex items-center text-gray-400">
                    <span className="mr-2">ℹ️</span>
                    <span>Nav pieejamu nodarbību</span>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </section>
    </div>
  );
} 