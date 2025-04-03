'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export default function DbCheck() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true);
        
        // Get JWT token from Clerk
        const token = await getToken({ template: 'supabase' });
        
        // Create Supabase client with token
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        );
        
        // Query profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(10);
        
        if (error) throw error;
        
        setProfiles(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profiles');
        console.error('Error fetching profiles:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfiles();
  }, [getToken]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Database Check</h1>
      
      {loading ? (
        <div>Loading profiles...</div>
      ) : error ? (
        <div className="bg-error/20 p-4 rounded-lg text-error">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-2">Found {profiles.length} profiles</h2>
          <div className="overflow-auto">
            <pre className="bg-base-200 p-4 rounded-lg">
              {JSON.stringify(profiles, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 