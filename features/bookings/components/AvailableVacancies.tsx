"use client";

import { useState, useEffect } from "react";
import { getVacancies } from '@/lib/supabase/db';
import { Vacancy } from "@/features/bookings/types";
import { toast } from "react-hot-toast";

export function AvailableVacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available vacancies
  useEffect(() => {
    async function fetchVacancies() {
      try {
        setLoading(true);
        const availableVacancies = await getVacancies();
        setVacancies(availableVacancies);
        setError(null);
      } catch (err) {
        console.error('Error fetching vacancies:', err);
        setError('Failed to load available vacancies');
        toast.error('Failed to load available vacancies');
      } finally {
        setLoading(false);
      }
    }

    fetchVacancies();
  }, []);

  // Book a vacancy
  const handleBookVacancy = async (vacancyId: string) => {
    if (!user) {
      toast.error('Please login to book a vacancy');
      return;
    }

    try {
      // Update the vacancy in Supabase
      await updateVacancy(vacancyId, { bookedBy: user.id, bookedAt: new Date().toISOString() });
      // Update local state
      setVacancies(prevVacancies => prevVacancies.filter(v => v.id !== vacancyId));
    } catch (err) {
      console.error('Error booking vacancy:', err);
      toast.error('Failed to book vacancy');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-error text-center">
        <p>{error}</p>
      </div>
    );
  }

  if (vacancies.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No available vacancies at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {vacancies.map((vacancy) => (
        <div 
          key={vacancy.id} 
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title">{vacancy.subject}</h2>
            <p className="text-sm text-gray-600">
              Teacher: {vacancy.teacherName}
            </p>
            <p>{vacancy.description}</p>
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-sm">
                Date: {new Date(vacancy.date).toLocaleDateString()}
              </p>
              <p className="text-sm">
                Time: {vacancy.time}
              </p>
            </div>
            <div className="card-actions justify-end mt-4">
              <button 
                className="btn btn-primary"
                onClick={() => handleBookVacancy(vacancy.id)}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 