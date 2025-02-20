"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
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
      const vacancyRef = doc(db, "vacancies", vacancyId);
      
      await updateDoc(vacancyRef, { 
        bookedBy: null,
        canceledAt: new Date().toISOString()
      });

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