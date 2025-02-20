// app/dashboard/page.tsx
"use client";

import { TeacherDashboard as TeacherDashboardComponent } from "@/features/dashboard/components";
import { StudentDashboard as StudentDashboardComponent } from "@/features/dashboard/components";
import { DashboardLoading } from "@/features/dashboard/components";
import { useDashboard } from "@/features/dashboard/hooks";

export default function DashboardPage() {
  const { loading, isTeacher } = useDashboard();

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <main className="p-8">
      {isTeacher ? <TeacherDashboardComponent /> : <StudentDashboardComponent />}
    </main>
  );
}

function TeacherDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skolotāja Vadības Panelis</h2>
      <p>Šeit var izveidot vakances, pārvaldīt grafiku, pieņemt rezervācijas.</p>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skolēna Vadības Panelis</h2>
      <p>Šeit var pieteikties uz nodarbībām, apskatīt rezervācijas, u.c.</p>
    </div>
  );
}
