"use client";

import { AvailableVacancies } from "@/features/bookings/components";
import { auth } from "@/lib/firebase/client";

export function StudentDashboard() {
  const userId = auth.currentUser?.uid;

  if (!userId) return null;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Skolēna Vadības Panelis</h2>
      
      <section>
        <h3 className="text-xl font-semibold mb-4">Pieejamās Nodarbības</h3>
        <AvailableVacancies />
      </section>
    </div>
  );
} 