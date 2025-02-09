"use client";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Dialog } from "./Dialog";

interface PaymentStatusProps {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  onStatusChange?: (newStatus: string) => void;
  isEditable?: boolean;
}

export default function PaymentStatus({ 
  paymentId, 
  status, 
  amount, 
  onStatusChange,
  isEditable = false 
}: PaymentStatusProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: 'completed' | 'failed') => {
    if (!isEditable) return;
    
    setUpdating(true);
    try {
      await updateDoc(doc(db, "payments", paymentId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      onStatusChange?.(newStatus);
      setShowDialog(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div 
        className={`
          badge cursor-pointer
          ${status === 'completed' ? 'badge-success' :
            status === 'failed' ? 'badge-error' :
            'badge-warning'}
        `}
        onClick={() => isEditable && setShowDialog(true)}
      >
        {status === 'completed' ? 'Pabeigts' :
         status === 'failed' ? 'Neizdevās' :
         'Gaida'}
        {isEditable && ` • €${amount.toFixed(2)}`}
      </div>

      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Atjaunot maksājuma statusu"
        description={`Maksājuma summa: €${amount.toFixed(2)}`}
        actions={
          <>
            <button
              onClick={() => handleStatusUpdate('completed')}
              className="btn btn-success"
              disabled={updating}
            >
              Apstiprināt
            </button>
            <button
              onClick={() => handleStatusUpdate('failed')}
              className="btn btn-error"
              disabled={updating}
            >
              Noraidīt
            </button>
            <button
              onClick={() => setShowDialog(false)}
              className="btn btn-ghost"
            >
              Atcelt
            </button>
          </>
        }
      />
    </>
  );
} 