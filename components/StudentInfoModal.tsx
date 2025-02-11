"use client";
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

interface StudentInfoModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly studentId: string;
}

interface StudentInfo {
  displayName: string;
  email: string;
  phoneNumber?: string;
  grade?: string;
  school?: string;
  about?: string;
}

export default function StudentInfoModal({ isOpen, onClose, studentId }: StudentInfoModalProps) {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudentInfo() {
      if (!studentId) return;
      
      try {
        setLoading(true);
        const studentDoc = await getDoc(doc(db, "users", studentId));
        if (studentDoc.exists()) {
          setStudentInfo(studentDoc.data() as StudentInfo);
        } else {
          setError("Skolēna informācija nav atrasta");
        }
      } catch (err) {
        console.error("Error fetching student info:", err);
        setError("Kļūda ielādējot skolēna informāciju");
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchStudentInfo();
    }
  }, [studentId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Skolēna informācija</h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : studentInfo && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center text-xl font-bold">
                {studentInfo.displayName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-semibold">{studentInfo.displayName}</h4>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {studentInfo.email}
                </div>
              </div>
            </div>

            {studentInfo.phoneNumber && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {studentInfo.phoneNumber}
              </div>
            )}

            {(studentInfo.grade || studentInfo.school) && (
              <div className="divider"></div>
            )}

            {studentInfo.grade && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span>Klase: {studentInfo.grade}</span>
              </div>
            )}

            {studentInfo.school && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Skola: {studentInfo.school}</span>
              </div>
            )}

            {studentInfo.about && (
              <>
                <div className="divider"></div>
                <div>
                  <h5 className="font-semibold mb-2">Par skolēnu</h5>
                  <p className="text-gray-600 whitespace-pre-line">{studentInfo.about}</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Aizvērt
          </button>
        </div>
      </div>
      <button 
        className="modal-backdrop" 
        onClick={onClose}
        aria-label="Close modal"
      >
        <span className="cursor-default w-full h-full" />
      </button>
    </div>
  );
} 