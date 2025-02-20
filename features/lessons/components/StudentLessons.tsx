"use client";

import { useRouter } from "next/navigation";
import { StudentLessonsProps, BookingStatus } from "../types";
import { useStudentLessons } from "../hooks/useStudentLessons";
import { toast } from "react-hot-toast";

function getStatusBadgeClass(status: BookingStatus): string {
  if (status === 'confirmed') return 'badge-success';
  if (status === 'cancelled') return 'badge-error';
  return 'badge-warning';
}

function getStatusText(status: BookingStatus): string {
  if (status === 'confirmed') return 'Apstiprināts';
  if (status === 'cancelled') return 'Atcelts';
  return 'Gaida apstiprinājumu';
}

export function StudentLessons({ studentId }: StudentLessonsProps) {
  const router = useRouter();
  const { lessons, loading, error, refreshLessons } = useStudentLessons(studentId);

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
  );
} 