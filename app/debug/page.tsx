'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DebugHomePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [info, setInfo] = useState<any>({
    loading: true,
    error: null,
    auth: null,
    system: null
  });

  useEffect(() => {
    async function loadDebugInfo() {
      try {
        // Basic auth info
        const authInfo = {
          isLoaded,
          isSignedIn: !!user,
          userId: user?.id || null,
          hasToken: false
        };

        // Check if token is available
        if (user) {
          try {
            const token = await getToken({ template: 'supabase' });
            authInfo.hasToken = !!token;
          } catch (error) {
            console.error('Failed to get token:', error);
          }
        }

        // System info
        const systemInfo = {
          nodeEnv: process.env.NODE_ENV,
          nextPublicClerkPublishableKey: 
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 8) + '...',
          nextPublicSupabaseUrl:
            process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15) + '...'
        };

        setInfo({
          loading: false,
          error: null,
          auth: authInfo,
          system: systemInfo
        });
      } catch (error: any) {
        setInfo({
          loading: false,
          error: error.message || 'Unknown error',
          auth: null,
          system: null
        });
      }
    }

    loadDebugInfo();
  }, [isLoaded, user, getToken]);

  const debugTools = [
    {
      title: 'JWT Debugger',
      description: 'Inspect JWT tokens from Clerk',
      path: '/debug/jwt',
      icon: '🔑'
    },
    {
      title: 'Database Check',
      description: 'Query and inspect database tables',
      path: '/debug/db',
      icon: '🗃️'
    },
    {
      title: 'Redirect Checker',
      description: 'Debug navigation and redirect issues',
      path: '/debug/redirect',
      icon: '↩️'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>
        <p className="mb-6">Use these tools to diagnose and troubleshoot issues in the application.</p>
      </div>

      {info.loading ? (
        <div className="py-8 text-center">
          <div className="loading loading-spinner loading-lg mb-2"></div>
          <p>Loading debug information...</p>
        </div>
      ) : info.error ? (
        <div className="alert alert-error">
          <p>{info.error}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Authentication Status</h2>
              <div className="space-y-2 mt-4">
                <p>
                  <span className="font-medium">Signed In:</span>{' '}
                  <span className={info.auth.isSignedIn ? 'text-success' : 'text-error'}>
                    {info.auth.isSignedIn ? 'Yes' : 'No'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">User ID:</span>{' '}
                  {info.auth.userId || 'Not signed in'}
                </p>
                <p>
                  <span className="font-medium">JWT Token:</span>{' '}
                  <span className={info.auth.hasToken ? 'text-success' : 'text-error'}>
                    {info.auth.hasToken ? 'Available' : 'Not available'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Environment</h2>
              <div className="space-y-2 mt-4">
                <p>
                  <span className="font-medium">Node Env:</span>{' '}
                  <span className="font-mono">
                    {info.system.nodeEnv}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Clerk Key:</span>{' '}
                  <span className="font-mono">
                    {info.system.nextPublicClerkPublishableKey}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Supabase URL:</span>{' '}
                  <span className="font-mono">
                    {info.system.nextPublicSupabaseUrl}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Available Debug Tools</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {debugTools.map((tool) => (
            <Link 
              key={tool.path} 
              href={tool.path}
              className="card bg-base-200 hover:bg-base-300 transition-colors"
            >
              <div className="card-body">
                <div className="card-title">
                  <span className="text-2xl mr-2">{tool.icon}</span>
                  {tool.title}
                </div>
                <p className="text-sm text-base-content/70">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 