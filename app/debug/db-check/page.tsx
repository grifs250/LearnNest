'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

export default function DbCheckPage() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [adminResult, setAdminResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [jwtResult, setJwtResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [loading, setLoading] = useState({ admin: false, jwt: false });

  // Test admin connection (using service role)
  const testAdminConnection = async () => {
    setLoading(prev => ({ ...prev, admin: true }));
    try {
      // Fetch from an endpoint that uses the service role
      const response = await fetch('/api/debug/admin-check');
      const result = await response.json();
      
      if (result.error) {
        setAdminResult({
          success: false,
          message: `Error fetching data with service role: ${result.error}`
        });
      } else {
        setAdminResult({
          success: true,
          message: `Successfully fetched ${result.data?.length || 0} profiles with service role`,
          data: result.data
        });
      }
    } catch (error) {
      setAdminResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(prev => ({ ...prev, admin: false }));
    }
  };

  // Test JWT connection (using Clerk token)
  const testJwtConnection = async () => {
    if (!user) {
      setJwtResult({
        success: false,
        message: 'You must be logged in to test JWT connection'
      });
      return;
    }
    
    setLoading(prev => ({ ...prev, jwt: true }));
    try {
      // Get JWT token from Clerk
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        setJwtResult({
          success: false,
          message: 'No JWT token returned from Clerk'
        });
        return;
      }
      
      // Create Supabase client with JWT token
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
      );
      
      // Try to fetch profiles (will be restricted by RLS)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, user_id')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        setJwtResult({
          success: false,
          message: `Error fetching data with JWT: ${error.message} (Code: ${error.code})`
        });
        console.error('JWT Query Error:', error);
      } else {
        setJwtResult({
          success: true,
          message: `Successfully fetched ${data.length} profiles with JWT`,
          data
        });
      }
    } catch (error) {
      setJwtResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
      console.error('JWT Connection Error:', error);
    } finally {
      setLoading(prev => ({ ...prev, jwt: false }));
    }
  };

  // Run tests on page load
  useEffect(() => {
    if (isLoaded) {
      testAdminConnection();
      if (user) {
        testJwtConnection();
      }
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="p-8">
        <div className="loading loading-spinner loading-lg"></div>
        <p>Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Check</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Admin Connection Panel */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title">
              Admin Connection
              {adminResult?.success && <span className="badge badge-success ml-2">OK</span>}
              {adminResult?.success === false && <span className="badge badge-error ml-2">Failed</span>}
            </h2>
            
            <p className="text-sm mb-4">
              Tests database connection using the service role (bypasses RLS).
            </p>
            
            <button 
              className="btn btn-primary btn-sm mb-4" 
              onClick={testAdminConnection}
              disabled={loading.admin}
            >
              {loading.admin ? 'Testing...' : 'Test Admin Connection'}
            </button>
            
            {adminResult && (
              <div className={`alert ${adminResult.success ? 'alert-success' : 'alert-error'} text-xs`}>
                {adminResult.message}
              </div>
            )}
            
            {adminResult?.data && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Result Data</h3>
                <pre className="bg-base-300 p-2 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(adminResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
        
        {/* JWT Connection Panel */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title">
              JWT Connection
              {jwtResult?.success && <span className="badge badge-success ml-2">OK</span>}
              {jwtResult?.success === false && <span className="badge badge-error ml-2">Failed</span>}
            </h2>
            
            <p className="text-sm mb-4">
              Tests database connection using your JWT token (RLS applies).
            </p>
            
            <button 
              className="btn btn-secondary btn-sm mb-4" 
              onClick={testJwtConnection}
              disabled={loading.jwt || !user}
            >
              {loading.jwt ? 'Testing...' : 'Test JWT Connection'}
            </button>
            
            {!user && (
              <div className="alert alert-warning text-xs">
                You must be logged in to test JWT connection
              </div>
            )}
            
            {jwtResult && (
              <div className={`alert ${jwtResult.success ? 'alert-success' : 'alert-error'} text-xs`}>
                {jwtResult.message}
              </div>
            )}
            
            {jwtResult?.data && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Result Data</h3>
                <pre className="bg-base-300 p-2 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(jwtResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body">
          <h2 className="card-title">Troubleshooting Database Connection</h2>
          
          <div className="divider">Admin Connection Issues</div>
          
          <div className="space-y-2">
            <p className="font-semibold">If Admin connection fails:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Verify your <code>SUPABASE_SERVICE_ROLE_KEY</code> in .env.local</li>
              <li>Check that your service role key has access to the database</li>
              <li>Ensure your API endpoint is correctly using the admin client</li>
            </ul>
          </div>
          
          <div className="divider">JWT Connection Issues</div>
          
          <div className="space-y-2">
            <p className="font-semibold">If JWT connection fails:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Check your Clerk JWT template includes required claims (sub, aud, role)</li>
              <li>Verify Supabase JWT settings are configured to use Clerk's JWKS URL</li>
              <li>Ensure RLS policies are correctly written to use JWT claims</li>
              <li>Check for typos in RLS policy conditions</li>
            </ul>
            
            <p className="text-sm mt-4">
              Example RLS policy for profiles:
            </p>
            <pre className="bg-base-300 p-2 rounded-md overflow-x-auto text-xs">
{`-- Allow users to view their own profiles
CREATE POLICY "User can view own profile" ON profiles
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

-- Allow users to update their own profiles  
CREATE POLICY "User can update own profile" ON profiles
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 