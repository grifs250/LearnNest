'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type JwtInfo = {
  token: string | null;
  claims: Record<string, any> | null;
  error: string | null;
};

/**
 * Utility hook to debug JWT tokens from Clerk for Supabase
 */
export function useSupabaseJwt() {
  const { getToken } = useAuth();
  const [jwtInfo, setJwtInfo] = useState<JwtInfo>({
    token: null,
    claims: null,
    error: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [getToken]);

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