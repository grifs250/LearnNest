'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function RedirectDebugPage() {
  const { getToken, userId } = useAuth();
  const [info, setInfo] = useState({
    token: null as string | null,
    redirectHistory: [] as string[],
    userId: null as string | null,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    // Track navigation history
    const prevPaths = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    const currentPath = window.location.pathname;
    
    if (!prevPaths.includes(currentPath)) {
      const updatedPaths = [...prevPaths, currentPath].slice(-5); // Keep last 5
      sessionStorage.setItem('navigationHistory', JSON.stringify(updatedPaths));
      setInfo(prev => ({
        ...prev,
        redirectHistory: updatedPaths
      }));
    } else {
      setInfo(prev => ({
        ...prev,
        redirectHistory: prevPaths
      }));
    }

    // Check token
    async function checkToken() {
      try {
        const token = await getToken({ template: 'supabase' });
        setInfo(prev => ({
          ...prev,
          token,
          userId: userId || null,
          loading: false
        }));
      } catch (error: any) {
        setInfo(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    }

    checkToken();
  }, [getToken, userId]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Redirect Debug Page</h1>
      
      {info.loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-base-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Navigation History</h2>
            <ul className="list-disc pl-6">
              {info.redirectHistory.map((path, i) => (
                <li key={i} className={window.location.pathname === path ? 'font-bold' : ''}>
                  {path} {window.location.pathname === path ? '(current)' : ''}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-base-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Auth Info</h2>
            <div className="space-y-2">
              <p><strong>User ID:</strong> {info.userId || 'Not authenticated'}</p>
              <p><strong>Token:</strong> {info.token ? 'Available' : 'Not available'}</p>
              {info.error && (
                <p className="text-error"><strong>Error:</strong> {info.error}</p>
              )}
            </div>
          </div>
          
          <div className="bg-base-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Action</h2>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/debug/jwt'}
            >
              Go to JWT Debug Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 