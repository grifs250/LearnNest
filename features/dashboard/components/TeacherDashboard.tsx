"use client";

import { StudentBookings } from "@/features/bookings/components";
import { TeacherWorkHours } from "@/features/schedule/components";
import { auth } from "@/lib/firebase/client";

export function TeacherDashboard() {
  const userId = auth.currentUser?.uid;

  if (!userId) return null;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Skolotāja Vadības Panelis</h2>
      
      <section>
        <h3 className="text-xl font-semibold mb-4">Darba laiki</h3>
        <TeacherWorkHours teacherId={userId} />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Rezervācijas</h3>
        <StudentBookings userId={userId} />
      </section>
    </div>
  );
} 