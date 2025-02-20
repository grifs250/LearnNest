"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

export default function LessonMeetPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<any>(null);

  useEffect(() => {
    async function fetchLessonData() {
      if (!lessonId || !auth.currentUser) return;

      try {
        const lessonDoc = await getDoc(doc(db, "lessons", lessonId));
        if (!lessonDoc.exists()) {
          setError("Nodarbība nav atrasta");
          return;
        }

        setLessonData(lessonDoc.data());
      } catch (err) {
        console.error("Error fetching lesson:", err);
        setError("Kļūda ielādējot nodarbību");
      } finally {
        setLoading(false);
      }
    }

    fetchLessonData();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl mb-4">{lessonData?.subject}</h1>
          <p className="text-lg text-gray-600 mb-4">{lessonData?.description}</p>

          {/* Teacher info */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center text-xl font-bold">
                {lessonData?.teacherName?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{lessonData?.teacherName}</h2>
                {lessonData?.teacherEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {lessonData.teacherEmail}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video meeting section */}
          <div className="bg-base-200 p-8 rounded-lg text-center mb-8">
            <h2 className="text-xl mb-4">Nodarbības telpa</h2>
            <p className="mb-4">Šeit būs video zvana saskarne</p>
            
            <div className="flex justify-center gap-4">
              <button className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Ieslēgt kameru
              </button>
              <button className="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Ieslēgt mikrofonu
              </button>
            </div>
          </div>

          {/* Lesson details */}
          <div className="bg-base-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Nodarbības informācija</h3>
            <div className="flex flex-wrap gap-4 items-center text-gray-600">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {lessonData?.lessonLength} min
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                €{lessonData?.price?.toFixed(2) ?? '0.00'}
              </div>
              {lessonData?.education && (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  {lessonData.education}
                </div>
              )}
            </div>

            {lessonData?.description && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Apraksts</h4>
                <p className="text-gray-600 whitespace-pre-line">{lessonData.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 