"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

export default function ProfileResetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isForceCreating, setIsForceCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  
  // Function to reset the profile
  const resetProfile = async () => {
    if (!userId || !user) {
      setError("Jums ir jāautentificējas, lai atiestatītu profilu");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      // Step 1: Update Clerk metadata client-side
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          profile_completed: false,
          profile_needs_setup: true
        }
      });
      
      // Step 2: Call our API to delete the Supabase profile
      const response = await fetch("/api/profile/reset-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Kļūda atiestatot profilu");
      }
      
      setMessage(data.message || "Profils veiksmīgi atiestatīts. Jūs tiksiet novirzīts uz profila iestatīšanas lapu.");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/profile/setup");
      }, 2000);
    } catch (error) {
      console.error("Error resetting profile:", error);
      setError(error instanceof Error ? error.message : "Kļūda atiestatot profilu");
      setIsLoading(false);
    }
  };
  
  // Function to force create a minimal profile
  const forceCreateProfile = async () => {
    if (!userId || !user) {
      setError("Jums ir jāautentificējas, lai izveidotu profilu");
      return;
    }
    
    setIsForceCreating(true);
    setError("");
    setMessage("");
    
    try {
      // Call our admin API endpoint to create a minimal profile
      const response = await fetch("/api/profile/force-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Kļūda izveidojot profilu");
      }
      
      setMessage(data.message || "Profils veiksmīgi izveidots. Jūs tiksiet novirzīts uz jūsu profila lapu.");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(data.role === 'teacher' ? "/teacher" : "/student");
      }, 2000);
    } catch (error) {
      console.error("Error force creating profile:", error);
      setError(error instanceof Error ? error.message : "Kļūda izveidojot profilu");
    } finally {
      setIsForceCreating(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="max-w-md w-full bg-base-100 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Profila atiestatīšana</h1>
        
        <div className="space-y-4">
          <p className="text-center">
            Šī darbība atiestatīs jūsu profila iestatīšanas statusu un ļaus jums atkārtoti iziet iestatīšanas procesu.
          </p>
          
          <div className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Uzmanību: Esošie profila dati var tikt dzēsti</span>
          </div>
          
          {message && (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{message}</span>
            </div>
          )}
          
          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex flex-col gap-4 mt-6">
            <button 
              className="btn btn-primary px-8"
              onClick={resetProfile}
              disabled={isLoading || isForceCreating}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Atiestatīšana...
                </>
              ) : (
                "Atiestatīt profilu"
              )}
            </button>
            
            <div className="divider my-2">VAI</div>
            
            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Avārijas risinājums</h3>
              <p className="text-sm mb-4">
                Ja profila iestatīšana neizdodas, izmantojiet šo pogu, lai izveidotu minimālu profilu, apejot parasto iestatīšanas procesu.
              </p>
              
              <button 
                className="btn btn-accent btn-sm w-full"
                onClick={forceCreateProfile}
                disabled={isLoading || isForceCreating}
              >
                {isForceCreating ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Izveido...
                  </>
                ) : (
                  "Izveidot minimālu profilu"
                )}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => router.back()}
              disabled={isLoading || isForceCreating}
            >
              Atpakaļ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 