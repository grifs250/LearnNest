"use client";

import { db } from "@/lib/firebaseClient";
import { doc, updateDoc } from "firebase/firestore";

export default function CancelBooking({ vacancyId }: { vacancyId: string }) {
  async function handleCancel() {
    const vacancyRef = doc(db, "vacancies", vacancyId);
    await updateDoc(vacancyRef, { bookedBy: null });
    alert("Booking canceled.");
  }

  return (
    <button onClick={handleCancel} className="btn btn-error mt-2">
      Atcelt rezervāciju
    </button>
  );
}
