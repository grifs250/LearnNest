"use client";

import { useState, useEffect } from "react";
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { Vacancy } from "../types";
import { toast } from "react-hot-toast";

export function AvailableVacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase, isInitialized } = useClerkSupabase();

  useEffect(() => {
    const fetchVacancies = async () => {
      if (!supabase || !isInitialized) return;

      try {
        const { data, error } = await supabase
          .from('lesson_schedules')
          .select(`
            *,
            lesson:lessons (
              id,
              title,
              description,
              price,
              duration
            )
          `)
          .eq('is_available', true);

        if (error) throw error;
        setVacancies(data as Vacancy[]);
      } catch (error) {
        toast.error('Failed to load available slots');
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) {
      fetchVacancies();
    }
  }, [supabase, isInitialized]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      {vacancies.map((vacancy) => (
        <div key={vacancy.id} className="card bg-base-200 p-4">
          <h3 className="text-lg font-semibold">{vacancy.lesson?.title}</h3>
          <p>{vacancy.lesson?.description}</p>
          <div className="mt-2">
            <p className="text-sm">
              {new Date(vacancy.start_time).toLocaleString()} - 
              {new Date(vacancy.end_time).toLocaleString()}
            </p>
            <p className="font-semibold mt-1">
              Price: ${vacancy.lesson?.price}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 