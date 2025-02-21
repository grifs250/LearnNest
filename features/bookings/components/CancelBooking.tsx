"use client";

import { useState } from "react";
import { updateVacancy } from '@/lib/supabase/db';
import { toast } from "react-hot-toast";

interface CancelBookingProps {
  vacancyId: string;
  onCancelSuccess?: () => void;
}

export function CancelBooking({ vacancyId, onCancelSuccess }: CancelBookingProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCancel() {
    try {
      setIsLoading(true);
      await updateVacancy(vacancyId, { bookedBy: null, canceledAt: new Date().toISOString() });

      toast.success("Rezervācija atcelta");
      onCancelSuccess?.();
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast.error("Neizdevās atcelt rezervāciju");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button 
      onClick={handleCancel} 
      className="btn btn-error mt-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        "Atcelt rezervāciju"
      )}
    </button>
  );
} 