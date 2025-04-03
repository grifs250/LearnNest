'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { decodeJwt, logJwtContents, getJwtDebugHelp } from '@/lib/clerk/jwt-debug';

export default function JwtDebugPage() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<{ header: any; payload: any } | null>(null);
  const [debugHelp, setDebugHelp] = useState<string>('');
  const [supabaseResult, setSupabaseResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchToken = async () => {
    try {
      setLoading(true);
      const jwt = await getToken({ template: 'supabase' });
      
      if (!jwt) {
        setDebugHelp('❌ No JWT token returned from Clerk');
        return;
      }
      
      setToken(jwt);
      
      // Decode and log token
      const decodedToken = decodeJwt(jwt);
      setDecoded(decodedToken);
      
      // Get debug help
      setDebugHelp(getJwtDebugHelp(jwt));
      
      // Also log to console for more detailed inspection
      console.log('JWT Debug Information:');
      logJwtContents(jwt);
    } catch (error) {
      console.error('Error fetching JWT:', error);
      setDebugHelp(`❌ Error fetching JWT: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const testSupabase = async () => {
    if (!token) {
      setSupabaseResult({ 
        success: false, 
        message: 'No JWT token available. Fetch a token first.' 
      });
      return;
    }
    
    try {
      setLoading(true);
      // Create Supabase client with the JWT token
      const supabase = createClient(
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
      
      // Attempt to perform a simple query that requires authentication
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(1);
      
      if (error) {
        setSupabaseResult({
          success: false,
          message: `Error executing Supabase query: ${error.message} (Code: ${error.code})`
        });
        console.error('Supabase query error:', error);
      } else {
        setSupabaseResult({
          success: true,
          message: `Successfully queried Supabase! Received ${data.length} profiles.`
        });
        console.log('Supabase query result:', data);
      }
    } catch (error) {
      setSupabaseResult({
        success: false,
        message: `Error connecting to Supabase: ${error instanceof Error ? error.message : String(error)}`
      });
      console.error('Supabase connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchToken();
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

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">JWT Debugging</h1>
        <div className="alert alert-warning">
          <p>You must be logged in to use this debugging tool.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">JWT Debugging</h1>
      
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body">
          <h2 className="card-title">Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              className="btn btn-primary" 
              onClick={fetchToken} 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch JWT Token'}
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={testSupabase} 
              disabled={loading || !token}
            >
              {loading ? 'Testing...' : 'Test Supabase Connection'}
            </button>
          </div>
        </div>
      </div>
      
      {token && (
        <div className="card bg-base-200 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title">JWT Token</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Raw Token</span>
              </label>
              <textarea 
                className="textarea textarea-bordered font-mono text-xs" 
                value={token} 
                readOnly 
                rows={3}
              />
            </div>
          </div>
        </div>
      )}
      
      {decoded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Header</h2>
              <pre className="bg-base-300 p-4 rounded-md overflow-x-auto text-xs">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Payload</h2>
              <pre className="bg-base-300 p-4 rounded-md overflow-x-auto text-xs">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
      
      {debugHelp && (
        <div className="card bg-base-200 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title">Validation Results</h2>
            <pre className="whitespace-pre-wrap bg-base-300 p-4 rounded-md">
              {debugHelp}
            </pre>
          </div>
        </div>
      )}
      
      {supabaseResult && (
        <div className={`alert ${supabaseResult.success ? 'alert-success' : 'alert-error'} mb-6`}>
          <div>
            <h3 className="font-bold">{supabaseResult.success ? 'Success!' : 'Error'}</h3>
            <div className="text-xs">{supabaseResult.message}</div>
          </div>
        </div>
      )}
      
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body">
          <h2 className="card-title">Troubleshooting Tips</h2>
          <div className="space-y-2">
            <p><strong>1. Check Clerk JWT Template</strong></p>
            <p className="text-sm">
              Ensure your JWT template for Supabase in Clerk has the required claims:
            </p>
            <pre className="bg-base-300 p-4 rounded-md text-xs">
{`{
  "aud": "authenticated",
  "role": "authenticated",
  "sub": "{{user.id}}"
}`}
            </pre>
            
            <p><strong>2. Verify Supabase JWT Configuration</strong></p>
            <p className="text-sm">
              Check that Supabase is configured to use Clerk's JWKS URL:
            </p>
            <ul className="list-disc list-inside text-sm">
              <li>Go to Supabase Dashboard → Project Settings → API</li>
              <li>Under JWT Settings, set JWT Key Type to JWKS</li>
              <li>Get JWKS URL from Clerk Dashboard (API → JWT Templates)</li>
            </ul>
            
            <p><strong>3. Check RLS Policies</strong></p>
            <p className="text-sm">
              Ensure your Row Level Security policies use the correct JWT claims:
            </p>
            <pre className="bg-base-300 p-4 rounded-md text-xs">
{`-- Example policy for profiles
CREATE POLICY "User can view own profile" ON profiles
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 