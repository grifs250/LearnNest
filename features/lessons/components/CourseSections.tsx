"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Subject } from '@/lib/types';
import { dbService } from '@/lib/supabase/db';
import { Lesson, LessonWithProfile } from '@/lib/types';

interface CourseSectionsProps {
  subject?: Subject | null;
  limit?: number;
}

export default function CourseSections({ subject, limit = 6 }: CourseSectionsProps) {
  const [lessons, setLessons] = useState<LessonWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true);
        if (subject) {
          const lessonsData = await dbService.getLessonsWithProfiles({
            subject_id: subject.id,
            is_active: true
          });
          setLessons(lessonsData.slice(0, limit));
        } else {
          setLessons([]);
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLessons();
  }, [subject, limit]);
  
  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-base-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-base-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (lessons.length === 0) {
    return (
      <div className="w-full p-4">
        <p className="text-center text-base-content/70">
          Nav atrasta neviena nodarbība šim priekšmetam.
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full p-4">
      <h3 className="text-xl font-bold mb-4">
        {subject ? `${subject.name} nodarbības` : 'Populārākās nodarbības'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-all">
            <div className="card-body p-4">
              <h4 className="card-title text-lg">{lesson.title}</h4>
              
              {lesson.description && (
                <p className="text-sm text-base-content/70 line-clamp-2">{lesson.description}</p>
              )}
              
              {lesson.teacher && (
                <div className="flex items-center mt-2">
                  {lesson.teacher.avatar_url ? (
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img src={lesson.teacher.avatar_url} alt={lesson.teacher.full_name} />
                      </div>
                    </div>
                  ) : (
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-8">
                        <span>{lesson.teacher.full_name.charAt(0)}</span>
                      </div>
                    </div>
                  )}
                  <span className="ml-2 text-sm">{lesson.teacher.full_name}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-primary font-semibold">
                  €{lesson.price ? lesson.price.toFixed(2) : '0.00'}
                </div>
                
                <Link
                  href={`/lessons/${lesson.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Skatīt
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {subject && lessons.length >= limit && (
        <div className="mt-6 text-center">
          <Link 
            href={`/${subject.category?.name?.toLowerCase() || 'subjects'}/${subject.id}`} 
            className="btn btn-outline"
          >
            Skatīt visas nodarbības
          </Link>
        </div>
      )}
    </div>
  );
} 