'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type JwtInfo = {
  token: string | null;
  claims: Record<string, any> | null;
  error: string | null;
};

/**
 * Debugs JWT claims for Supabase integration
 * Used for troubleshooting JWT token issues
 */
export function useJwtDebugger() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [jwtInfo, setJwtInfo] = useState<JwtInfo>({
    token: null,
    claims: null,
    error: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchToken = async () => {
      try {
        setIsLoading(true);
        
        // Get the token
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          setJwtInfo({
            token: null,
            claims: null,
            error: 'No token returned from Clerk'
          });
          return;
        }
        
        // Parse the token to get claims
        const parts = token.split('.');
        if (parts.length !== 3) {
          setJwtInfo({
            token: token,
            claims: null,
            error: 'Invalid JWT format (not 3 parts)'
          });
          return;
        }
        
        // Decode the claims part (second part)
        const claims = JSON.parse(atob(parts[1]));
        
        setJwtInfo({
          token,
          claims,
          error: null
        });
      } catch (error) {
        setJwtInfo({
          token: null,
          claims: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [isLoaded, getToken]);

  const validate = () => {
    // Validate required claims for Supabase
    if (!jwtInfo.claims) return { isValid: false, issues: ['No claims available'] };
    
    const issues: string[] = [];
    
    // Check for required claims for Supabase
    if (!jwtInfo.claims.sub) issues.push('Missing "sub" claim (user ID)');
    if (!jwtInfo.claims.role) issues.push('Missing "role" claim');
    if (!jwtInfo.claims.aud) issues.push('Missing "aud" claim');
    if (jwtInfo.claims.aud !== 'authenticated') issues.push('"aud" claim should be "authenticated"');
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

  return {
    jwtInfo,
    isLoading,
    validate
  };
}

/**
 * Debug component for JWT tokens
 * You can add this component to any page to debug JWT issues
 */
export function JwtDebugger() {
  const { jwtInfo, isLoading, validate } = useJwtDebugger();
  const validation = validate();
  
  if (isLoading) {
    return <div className="p-4 bg-base-200 rounded-lg">Loading JWT info...</div>;
  }
  
  if (jwtInfo.error) {
    return (
      <div className="p-4 bg-error/20 text-error rounded-lg">
        <h3 className="font-bold">JWT Error</h3>
        <p>{jwtInfo.error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-base-200 rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="font-bold">JWT Token Debugger</h3>
        <div className={`badge ${validation.isValid ? 'badge-success' : 'badge-error'}`}>
          {validation.isValid ? 'Valid' : 'Invalid'}
        </div>
      </div>
      
      {!validation.isValid && (
        <div className="bg-error/20 p-3 rounded text-sm text-error">
          <strong>Issues:</strong>
          <ul className="list-disc pl-4">
            {validation.issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="font-medium">JWT Claims:</h4>
        <pre className="bg-base-300 p-3 rounded-lg text-xs overflow-auto max-h-64">
          {JSON.stringify(jwtInfo.claims, null, 2)}
        </pre>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Token (for debugging):</h4>
        <div className="bg-base-300 p-3 rounded-lg text-xs overflow-auto max-h-32 break-all">
          {jwtInfo.token}
        </div>
      </div>
    </div>
  );
} 