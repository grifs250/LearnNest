"use client";

import { StudentBookings } from "@/features/bookings/components";
import { TeacherWorkHours } from "@/features/schedule/components";
import { useUser } from "@clerk/nextjs";

export function TeacherDashboard() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Skolotāja Vadības Panelis</h2>
      
      <section>
        <h3 className="text-xl font-semibold mb-4">Darba laiki</h3>
        <TeacherWorkHours teacherId={user.id} />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Rezervācijas</h3>
        <StudentBookings userId={user.id} />
      </section>
    </div>
  );
} 