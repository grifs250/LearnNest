"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { BookingStatus, StudentBookingsProps } from "../types";
import { PaymentModal } from "@/features/payments/components";
import { UserInfoModal } from "@/shared/components";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from "react-hot-toast";
import { useStudentBookings } from '../hooks';
import { TimeSlotPicker } from '../components';

export function StudentBookings({ userId }: StudentBookingsProps) {
  const router = useRouter();
  const { bookings, loading, error, refreshBookings } = useStudentBookings(userId);
  const [showRejected, setShowRejected] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookedLesson | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // ... rest of the component code remains the same
  // Just update imports and use the new hook
} 