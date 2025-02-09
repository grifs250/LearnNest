"use client";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Dialog } from "./Dialog";

interface PaymentFormProps {
  lessonId: string;
  lessonTitle: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  amount: number;
  onPaymentCreated?: () => void;
}

export default function PaymentForm({
  lessonId,
  lessonTitle,
  teacherId,
  teacherName,
  studentId,
  studentName,
  amount,
  onPaymentCreated
}: PaymentFormProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      await addDoc(collection(db, "payments"), {
        lessonId,
        lessonTitle,
        teacherId,
        teacherName,
        studentId,
        studentName,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentMethod: 'card' // Default payment method
      });

      onPaymentCreated?.();
      setShowDialog(false);
    } catch (err) {
      console.error("Error creating payment:", err);
      setError("Neizdevās izveidot maksājumu. Lūdzu, mēģiniet vēlreiz.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="btn btn-primary btn-sm"
      >
        Veikt maksājumu
      </button>

      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Veikt maksājumu"
        description={`
          Nodarbība: ${lessonTitle}
          Pasniedzējs: ${teacherName}
          Summa: €${amount.toFixed(2)}
        `}
        actions={
          <>
            {error && (
              <p className="text-error text-sm mb-4">{error}</p>
            )}
            <button
              onClick={handleCreatePayment}
              className="btn btn-primary"
              disabled={processing}
            >
              {processing ? "Apstrādā..." : "Maksāt"}
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