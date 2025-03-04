"use client";

import { useBookings } from '../hooks/useBookings';
import { useState } from "react";
import { toast } from "react-hot-toast";

interface CancelBookingProps {
  bookingId: string;
  onCancel?: () => void;
}

export function CancelBooking({ bookingId, onCancel }: CancelBookingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { cancelBooking } = useBookings();

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      onCancel?.();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isLoading}
      className="btn btn-error btn-sm"
    >
      {isLoading ? 'Cancelling...' : 'Cancel Booking'}
    </button>
  );
} 