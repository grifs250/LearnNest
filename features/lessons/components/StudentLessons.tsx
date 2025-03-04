"use client";

import { useRouter } from "next/navigation";
import { BookingStatus } from "@/types/database";
import { useStudentLessons } from "../hooks/useStudentLessons";
import { toast } from "react-hot-toast";

interface StudentLessonsProps {
  userId: string;
}

function getStatusBadgeClass(status: BookingStatus): string {
  if (status === 'confirmed') return 'badge-success';
  if (status === 'canceled') return 'badge-error';
  if (status === 'completed') return 'badge-info';
  return 'badge-warning'; // for pending
}

function getStatusText(status: BookingStatus): string {
  if (status === 'confirmed') return 'Apstiprināts';
  if (status === 'canceled') return 'Atcelts';
  if (status === 'completed') return 'Pabeigts';
  return 'Gaida apstiprinājumu'; // for pending
}

export function StudentLessons({ userId }: StudentLessonsProps) {
  const router = useRouter();
  const { lessons, loading, refetch } = useStudentLessons();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Nav aktīvu nodarbību</h2>
          <p>Jums pašlaik nav nevienas aktīvas nodarbības.</p>
          <div className="card-actions justify-end">
            <button onClick={() => router.push('/lessons')} className="btn btn-primary">
              Atrast nodarbības
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{lesson.subject}</h3>
                <p className="text-sm text-gray-500">
                  {lesson.date} • {lesson.time}
                </p>
                <div className="mt-2">
                  <span className={`badge ${getStatusBadgeClass(lesson.status)}`}>
                    {getStatusText(lesson.status)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{lesson.teacherName}</p>
              </div>
            </div>
            <div className="card-actions justify-end mt-4">
              <button 
                onClick={() => router.push(`/student/lessons/${lesson.id}`)}
                className="btn btn-primary btn-sm"
              >
                Detaļas
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 