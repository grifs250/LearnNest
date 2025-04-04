"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import supabase from '@/lib/supabase/client';
import { PaymentIntentInsert } from '@/lib/types/database.types';

export function usePayment() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (bookingId: string, amount: number) => {
    setProcessing(true);
    setError(null);

    try {
      // Generate a mock Stripe payment intent ID (would be replaced with actual Stripe integration)
      const mockStripeId = `pi_${Math.random().toString(36).substring(2, 15)}`;
      
      const paymentIntent: PaymentIntentInsert = {
        stripe_payment_intent_id: mockStripeId,
        booking_id: bookingId,
        amount: amount,
        currency: 'EUR',
        status: 'requires_payment_method'
      };

      // Insert into payment_intents table
      const { data, error } = await supabase
        .from('payment_intents')
        .insert(paymentIntent)
        .select()
        .single();

      if (error) throw error;

      toast.success('Maksājuma nodoms izveidots');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Maksājuma kļūda');
      toast.error('Kļūda veidojot maksājumu');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const confirmPayment = async (paymentIntentId: string) => {
    setProcessing(true);
    setError(null);

    try {
      // 1. Update payment intent status
      const { error: paymentError } = await supabase
        .from('payment_intents')
        .update({ status: 'succeeded' })
        .eq('id', paymentIntentId);

      if (paymentError) throw paymentError;

      // 2. Get the booking ID associated with this payment
      const { data: paymentData, error: fetchError } = await supabase
        .from('payment_intents')
        .select('booking_id')
        .eq('id', paymentIntentId)
        .single();

      if (fetchError) throw fetchError;
      if (!paymentData?.booking_id) throw new Error('No booking associated with this payment');

      // 3. Update booking payment status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', paymentData.booking_id);

      if (bookingError) throw bookingError;

      toast.success('Maksājums veiksmīgi apstiprināts');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Maksājuma kļūda');
      toast.error('Kļūda apstiprinot maksājumu');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const cancelPayment = async (paymentIntentId: string) => {
    setProcessing(true);
    setError(null);

    try {
      // 1. Update payment intent status
      const { error: paymentError } = await supabase
        .from('payment_intents')
        .update({ status: 'canceled' })
        .eq('id', paymentIntentId);

      if (paymentError) throw paymentError;

      // 2. Get the booking ID associated with this payment
      const { data: paymentData, error: fetchError } = await supabase
        .from('payment_intents')
        .select('booking_id')
        .eq('id', paymentIntentId)
        .single();

      if (fetchError) throw fetchError;
      if (!paymentData?.booking_id) throw new Error('No booking associated with this payment');

      // 3. Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ payment_status: 'failed', status: 'cancelled' })
        .eq('id', paymentData.booking_id);

      if (bookingError) throw bookingError;

      toast.success('Maksājums atcelts');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Maksājuma kļūda');
      toast.error('Kļūda atceļot maksājumu');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return { createPaymentIntent, confirmPayment, cancelPayment, processing, error };
}

export async function processPayment(paymentData: any) {
  try {
    // Check if this is for an existing booking
    if (paymentData.booking_id) {
      // Create a payment intent
      const mockStripeId = `pi_${Math.random().toString(36).substring(2, 15)}`;
      
      const paymentIntent: PaymentIntentInsert = {
        stripe_payment_intent_id: mockStripeId,
        booking_id: paymentData.booking_id,
        amount: paymentData.amount,
        currency: 'EUR',
        status: 'succeeded'
      };

      // Insert into payment_intents table
      const { data, error } = await supabase
        .from('payment_intents')
        .insert(paymentIntent)
        .select()
        .single();

      if (error) throw error;

      // Update booking payment status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', paymentData.booking_id);

      if (bookingError) throw bookingError;

      return data;
    } else {
      throw new Error('No booking ID provided for payment');
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
} 