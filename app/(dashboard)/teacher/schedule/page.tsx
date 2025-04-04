"use client";

import { useUser } from "@clerk/nextjs";
import { TeacherAvailability } from "@/features/schedule/components";

export default function TeacherSchedulePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Darba laiku pārvaldība</h1>
      
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title">Kā tas darbojas?</h2>
          <p>
            Iestatiet savu pieejamības laiku, lai studenti zinātu, kad jūs esat pieejams privātajām 
            stundām. Studenti varēs rezervēt stundas, tikai kad jūs esat atzīmējis pieejamību.
          </p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Pieejamības iestatījumi</h2>
          <TeacherAvailability teacherId={user.id} />
        </div>
      </div>
    </div>
  );
} 