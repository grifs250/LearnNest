"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Payment } from '../types';
import { supabase } from '@/lib/supabase/client';

export function usePayment() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (lessonId: string, timeSlot: string, userId: string, amount: number) => {
    setProcessing(true);
    setError(null);

    try {
      // Implement payment processing logic using Supabase
      const { data, error } = await supabase
        .from('payments')
        .insert({
          id: `${lessonId}_${timeSlot}`,
          lessonId,
          userId,
          amount,
          status: 'completed',
          createdAt: new Date()
        } as Payment);

      if (error) throw error;

      toast.success('Maksājums veiksmīgi apstrādāts');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Maksājuma kļūda');
      toast.error('Kļūda apstrādājot maksājumu');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  return { processPayment, processing, error };
}

export async function processPayment(paymentData: any) {
  try {
    // Implement payment processing logic using Supabase
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
} 