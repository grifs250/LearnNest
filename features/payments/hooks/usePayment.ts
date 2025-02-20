"use client";

import { useState } from 'react';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { toast } from 'react-hot-toast';
import { Payment } from '../types';

export function usePayment() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (lessonId: string, timeSlot: string, userId: string, amount: number) => {
    setProcessing(true);
    setError(null);

    try {
      await runTransaction(db, async (transaction) => {
        // Get student's booking
        const studentBookingRef = doc(db, "users", userId, "bookings", `${lessonId}_${timeSlot}`);
        const studentBookingDoc = await transaction.get(studentBookingRef);
        
        if (!studentBookingDoc.exists()) {
          throw new Error("Rezervācija nav atrasta");
        }

        const bookingData = studentBookingDoc.data();

        // Create payment record
        const paymentRef = doc(db, "payments", `${lessonId}_${timeSlot}`);
        transaction.set(paymentRef, {
          id: `${lessonId}_${timeSlot}`,
          lessonId,
          userId,
          amount,
          status: 'completed',
          createdAt: new Date()
        } as Payment);

        // Update bookings
        transaction.update(studentBookingRef, { status: 'paid' });
        transaction.update(doc(db, "lessons", lessonId), {
          [`bookedTimes.${timeSlot}.status`]: 'paid'
        });
        transaction.update(
          doc(db, "users", bookingData.teacherId, "bookings", `${lessonId}_${timeSlot}`),
          { status: 'paid' }
        );
      });

      toast.success('Maksājums veiksmīgi apstrādāts');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Maksājuma kļūda');
      toast.error('Kļūda apstrādājot maksājumu');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return { processPayment, processing, error };
} 