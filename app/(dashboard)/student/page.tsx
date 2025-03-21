"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/login");
      } else {
        // Check if user is a student
        const userRole = user.publicMetadata.role as string;
        if (userRole !== "student") {
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
      <h1 className="text-3xl font-bold mb-6">Skolēna Panelis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick stats */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Laipni lūgti, {user?.firstName || 'Student'}!</h2>
            <p>Šeit būs jūsu mācību panelis un jaunākā informācija par nodarbībām.</p>
          </div>
        </div>
        
        {/* Upcoming lessons */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Gaidāmās nodarbības</h2>
            <p className="text-base-content/70">Jums pagaidām nav nevienas nodarbības.</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary btn-sm">Meklēt nodarbības</button>
            </div>
          </div>
        </div>
        
        {/* Learning progress */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Mācību progress</h2>
            <p className="text-base-content/70">Šeit būs informācija par jūsu mācību progresu.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 