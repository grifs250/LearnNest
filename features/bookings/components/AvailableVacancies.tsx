"use client";

import { useState, useEffect } from "react";
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { toast } from "react-hot-toast";

// Define the Vacancy type that's missing
export interface Vacancy {
  id: string;
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  lessons?: {
    title: string;
    description: string;
    price: number;
    teacher_id: string;
  };
}

export function AvailableVacancies() {
  const { supabase, isLoading } = useClerkSupabase();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVacancies = async () => {
      if (!supabase) {
        toast.error('Database connection not available');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('lesson_schedules')
          .select(`
            *,
            lessons:lesson_id (
              title,
              description,
              price,
              teacher_id
            )
          `)
          .eq('is_available', true)
          .order('start_time', { ascending: true });

        if (error) {
          throw error;
        }

        setVacancies(data as Vacancy[]);
      } catch (error) {
        console.error('Error fetching vacancies:', error);
        toast.error('Failed to load available vacancies');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchVacancies();
    }
  }, [supabase, isLoading]);

  if (isLoading || loading) {
    return <div>Loading available vacancies...</div>;
  }

  if (!supabase) {
    return <div>Unable to connect to the database. Please try again later.</div>;
  }

  if (vacancies.length === 0) {
    return <div>No available vacancies at the moment.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vacancies.map((vacancy) => (
        <div key={vacancy.id} className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">{vacancy.lessons?.title || 'Untitled Lesson'}</h3>
            <p className="text-sm">{vacancy.lessons?.description || 'No description available'}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="badge badge-primary">{new Date(vacancy.start_time).toLocaleString()}</span>
              <span className="font-semibold">{vacancy.lessons?.price || 0} €</span>
            </div>
            <div className="card-actions justify-end mt-2">
              <button className="btn btn-sm btn-primary">Book Now</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 