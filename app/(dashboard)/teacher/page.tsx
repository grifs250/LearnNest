"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/login");
      } else {
        // Check if user is a teacher
        const userRole = user.publicMetadata.role as string;
        if (userRole !== "teacher") {
          router.push("/");
        }
        setLoading(false);
      }
    }
  }, [user, isLoaded, router]);
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pasniedzēja Panelis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick stats */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Laipni lūgti, {user?.firstName || 'Teacher'}!</h2>
            <p>Šeit būs jūsu pasniedzēja panelis un pārskats par nodarbībām.</p>
          </div>
        </div>
        
        {/* Upcoming lessons */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Gaidāmās nodarbības</h2>
            <p className="text-base-content/70">Jums pagaidām nav nevienas ieplānotas nodarbības.</p>
            <div className="card-actions justify-end">
              <button className="btn btn-secondary btn-sm">Pievienot nodarbību</button>
            </div>
          </div>
        </div>
        
        {/* Teaching stats */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Mācību statistika</h2>
            <p className="text-base-content/70">Šeit būs informācija par jūsu mācību statistiku un atsauksmēm.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 