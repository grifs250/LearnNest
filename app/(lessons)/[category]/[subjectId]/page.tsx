"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase/db';

// First, let's ensure our Lesson type has the required fields
interface LessonCard {
  id: string;
  subject: string;
  description: string;
  teacherId: string;
  teacherName: string;
  lessonLength: number;
  price?: number;
}

export default function LessonsPage() {
  const params = useParams();
  const subject_id = params.subjectId as string;
  const category = params.category as string;
  const router = useRouter();
  const [lessons, setLessons] = useState<LessonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");

  useEffect(() => {
    if (!subject_id) {
      router.push('/404');
      return;
    }
    
    async function fetchData() {
      try {
        if (!subject_id) return;
        
        // First fetch the subject name
        const { data: subjectDoc, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', subject_id)
          .single();
        if (error) throw error;
        setSubjectName(subjectDoc.name);

        // Then fetch lessons
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject_id', subject_id);
        if (lessonsError) throw lessonsError;
        setLessons(lessons);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [subject_id, router]);

  if (loading) {
    return <div className="p-8 text-center">
      <div className="loading loading-spinner loading-lg"></div>
    </div>;
  }

  if (lessons.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg max-w-2xl mx-auto m-8 p-8">
        <div className="card-body text-center">
          <h2 className="card-title justify-center text-2xl mb-4">
            📚 Nav pieejamu nodarbību
          </h2>
          <p className="text-gray-600 mb-6">
            Šobrīd šajā priekšmetā nav pieejamu nodarbību. 
            Mēģiniet vēlāk vai izvēlieties citu priekšmetu.
          </p>
          <div className="card-actions justify-center">
            <button 
              onClick={() => router.push('/#subjects')} 
              className="btn btn-primary btn-lg"
            >
              <span className="mr-2">🔍</span>Skatīt citus priekšmetus
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {subjectName}
        </h1>
        <p className="text-gray-600">
          Izvēlieties sev piemērotāko nodarbību
        </p>
      </div>
      
      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson) => (
          <div 
            key={lesson.id} 
            className="card bg-base-100 shadow-xl hover:shadow-lg transition-shadow duration-300"
          >
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-t-2xl">
              <h2 className="card-title text-xl font-bold mb-4">
                {lesson.subject}
              </h2>
              
              {/* Teacher Info with Avatar */}
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-content inline-flex items-center justify-center">
                    <span className="text-base leading-none">
                      {lesson.teacherName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="font-medium">
                  {lesson.teacherName}
                </div>
              </div>
            </div>

            <div className="card-body pt-6">
              {/* Description */}
              <p className="text-gray-600 mb-6 line-clamp-3">
                {lesson.description || 'Nav apraksta'}
              </p>

              {/* Info Bar */}
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                {/* Duration */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{lesson.lessonLength || 60} min</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">€{lesson.price?.toFixed(2) || '0.00'}</span>
                </div>

                {/* Video Call Indicator */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Video zvans</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="card-actions justify-end">
                <button 
                  onClick={() => router.push(`/lessons/${category}/${subject_id}/${lesson.id}`)}
                  className="btn btn-primary btn-block"
                >
                  Skatīt vairāk
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 