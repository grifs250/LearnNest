"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import dbService from '@/lib/supabase/db';
import { Chat } from '@/features/chat/components/Chat';
import { Lesson } from '@/types/database';

interface MeetParams {
  lessonId: string;
}

export const ClientComponents = {
  MeetRoom: function({ params }: { params: MeetParams }) {
    const { lessonId } = params;
    const { isLoaded, user } = useUser();
    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
      async function fetchData() {
        try {
          if (!isLoaded || !user) {
            setLoading(false);
            return;
          }

          // Fetch lesson details using dbService
          const lessonData = await dbService.getLesson(lessonId);
          setLesson(lessonData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }

      if (lessonId) {
        fetchData();
      }
    }, [lessonId, isLoaded, user]);

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      );
    }

    if (!lesson) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="alert alert-error">
            <span>Nodarbība nav atrasta</span>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <div className="bg-base-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
            <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center text-white">
              Video komponente šeit
            </div>
            <div className="mt-4 flex gap-4 justify-center">
              <button className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Kamera
              </button>
              <button className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Mikrofons
              </button>
            </div>
          </div>

          {/* Chat Section */}
          {user && (
            <div className="h-full">
              <Chat lessonId={lessonId} userId={user.id} />
            </div>
          )}
        </div>
      </div>
    );
  }
};