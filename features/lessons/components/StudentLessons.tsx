"use client";

import { useRouter } from "next/navigation";
import { StudentLessonsProps, BookingStatus } from "../types";
import { useStudentLessons } from "../hooks/useStudentLessons";
import { toast } from "react-hot-toast";

function getStatusBadgeClass(status: BookingStatus): string {
  if (status === 'accepted') return 'badge-success';
  if (status === 'rejected') return 'badge-error';
  return 'badge-warning';
}

function getStatusText(status: BookingStatus): string {
  if (status === 'accepted') return 'Apstiprināts';
  if (status === 'rejected') return 'Noraidīts';
  return 'Gaida apstiprinājumu';
}

export function StudentLessons({ studentId }: StudentLessonsProps) {
  const router = useRouter();
  const { lessons, loading, error, refreshLessons } = useStudentLessons(studentId);

  // ... rest of the component code remains the same
  // Just update imports and use the new hook
} 