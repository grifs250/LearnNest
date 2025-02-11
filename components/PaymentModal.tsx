"use client";
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

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

  if (!isOpen) return null;

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Here you would integrate with your payment provider (e.g., Stripe)
      // For now, we'll simulate a successful payment
      const paymentId = `mock_payment_${Date.now()}`;
      
      // Update the booking status to paid
      const lessonRef = doc(db, "lessons", lessonId);
      await updateDoc(lessonRef, {
        [`bookedTimes.${timeSlot}.paid`]: true,
        [`bookedTimes.${timeSlot}.paymentId`]: paymentId,
        [`bookedTimes.${timeSlot}.status`]: 'paid'
      });

      onPaymentComplete();
      onClose();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Kļūda veicot maksājumu. Lūdzu mēģiniet vēlreiz.");
    }
    setProcessing(false);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Apmaksāt nodarbību</h3>
        
        <div className="mb-6">
          <p className="text-lg font-semibold mb-2">
            Summa: €{price.toFixed(2)}
          </p>
          <p className="text-gray-600">
            Pēc apmaksas jūs saņemsiet piekļuvi nodarbībai
          </p>
        </div>

        <div className="modal-action">
          <button 
            className="btn btn-ghost" 
            onClick={onClose}
            disabled={processing}
          >
            Atcelt
          </button>
          <button
            className={`btn btn-primary ${processing ? 'loading' : ''}`}
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? 'Apstrādā...' : 'Apmaksāt'}
          </button>
        </div>
      </div>
    </div>
  );
} 