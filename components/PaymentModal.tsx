"use client";
import { useState } from 'react';
import { doc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { auth } from '@/lib/firebaseClient';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  timeSlot: string;
  price: number;
  onPaymentComplete: () => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  lessonId, 
  timeSlot, 
  price,
  onPaymentComplete 
}: PaymentModalProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!auth.currentUser) {
      setError("Lūdzu piesakieties, lai veiktu maksājumu");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Starting payment process for:', {
        lessonId,
        timeSlot,
        userId: auth.currentUser.uid
      });

      // Get student's booking first
      const studentBookingRef = doc(
        db, 
        "users", 
        auth.currentUser.uid, 
        "bookings", 
        lessonId  // Use just lessonId as that's the document ID
      );
      
      const studentBookingDoc = await getDoc(studentBookingRef);
      console.log('Student booking exists:', studentBookingDoc.exists());
      
      if (!studentBookingDoc.exists()) {
        throw new Error("Rezervācija nav atrasta");
      }

      const bookingData = studentBookingDoc.data();
      console.log('Booking data:', bookingData);

      // Run all updates in a transaction to ensure consistency
      await runTransaction(db, async (transaction) => {
        // Update student's booking
        transaction.update(studentBookingRef, { status: 'paid' });

        // Update lesson status
        const lessonRef = doc(db, "lessons", bookingData.lessonId);
        transaction.update(lessonRef, {
          [`bookedTimes.${timeSlot}.status`]: 'paid'
        });

        // Update teacher's booking
        const teacherBookingRef = doc(
          db, 
          "users", 
          bookingData.teacherId, 
          "bookings", 
          lessonId  // Use just lessonId here too
        );
        transaction.update(teacherBookingRef, { status: 'paid' });
      });

      console.log('Payment completed successfully');
      onPaymentComplete();
      onClose();
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "Kļūda veicot maksājumu. Lūdzu mēģiniet vēlreiz.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Veikt maksājumu</h3>
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <p className="mb-4">Summa: €{price.toFixed(2)}</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={processing}>
            Atcelt
          </button>
          <button 
            className={`btn btn-primary ${processing ? 'loading' : ''}`}
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? 'Apstrādā...' : 'Veikt maksājumu'}
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