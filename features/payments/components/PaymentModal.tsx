"use client";
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PaymentModalProps } from '../types';
import { usePayment } from '../hooks';
import { toast } from 'react-hot-toast';

export function PaymentModal({ 
  isOpen, 
  onClose, 
  lessonId, 
  timeSlot, 
  price,
  onPaymentComplete 
}: Readonly<PaymentModalProps>) {
  const { processPayment, processing, error: paymentError } = usePayment();
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!isLoaded) {
      return; // Wait for user data to load
    }
    
    if (!user) {
      setError("Lūdzu piesakieties, lai veiktu maksājumu");
      return;
    }

    try {
      const success = await processPayment(lessonId, timeSlot, user.id, price);
      if (success) {
        onPaymentComplete();
        onClose();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "Kļūda veicot maksājumu. Lūdzu mēģiniet vēlreiz.");
    }
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Veikt maksājumu</h3>
        {(error || paymentError) && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error || paymentError}</span>
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