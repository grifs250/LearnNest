"use client";

import { useRouter } from "next/navigation";
import { BookingStatus } from "@/features/bookings/types";
import { useStudentLessons } from "../hooks/useStudentLessons";
import { toast } from "react-hot-toast";

interface StudentLessonsProps {
  userId: string;
}

function getStatusBadgeClass(status: BookingStatus): string {
  if (status === 'accepted') return 'badge-success';
  if (status === 'cancelled') return 'badge-error';
  if (status === 'rejected') return 'badge-error';
  if (status === 'paid') return 'badge-success';
  return 'badge-warning'; // for pending
}

function getStatusText(status: BookingStatus): string {
  if (status === 'accepted') return 'Apstiprināts';
  if (status === 'cancelled') return 'Atcelts';
  if (status === 'rejected') return 'Atcelts';
  if (status === 'paid') return 'Apmaksāts';
  return 'Gaida apstiprinājumu';
}

export function StudentLessons({ userId }: StudentLessonsProps) {
  const router = useRouter();
  const { lessons, loading, error, refreshLessons } = useStudentLessons(userId);

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!lessons.length) {
    return (
      <div className="text-center py-8">
        <p>Nav aktīvu nodarbību</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manas nodarbības</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">{lesson.subject}</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="badge badge-outline">{lesson.date}</span>
                <span className="badge badge-outline">{lesson.time}</span>
                <span className={`badge ${getStatusBadgeClass(lesson.status)}`}>
                  {getStatusText(lesson.status)}
                </span>
              </div>
              <p>Pasniedzējs: {lesson.teacherName}</p>
              <div className="card-actions justify-end">
                <button 
                  onClick={() => router.push(`/lessons/meet/${lesson.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  Pievienoties nodarbībai
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 