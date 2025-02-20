"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase/client";
import { writeBatch, doc } from "firebase/firestore";
import { TeacherBookingsProps, BookingStatus } from "../types";
import { useTeacherBookings } from "../hooks/useTeacherBookings";
import { UserInfoModal } from "@/shared/components";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from "react-hot-toast";

export function TeacherBookings({ teacherId }: TeacherBookingsProps) {
  const router = useRouter();
  const { bookings, loading, error, refreshBookings } = useTeacherBookings(teacherId);
  const [view, setView] = useState<'pending' | 'accepted' | 'paid'>('pending');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // ... rest of the component code remains the same
  // Just update imports and use the new hook
} 