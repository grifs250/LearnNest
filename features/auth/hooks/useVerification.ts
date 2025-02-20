import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/client';
import { sendEmailVerification } from 'firebase/auth';

export function useVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const sendVerification = async (redirectUrl?: string) => {
    if (!auth.currentUser || cooldown > 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await sendEmailVerification(auth.currentUser, {
        url: redirectUrl || `${window.location.origin}/auth/action`,
        handleCodeInApp: true,
      });
      setCooldown(60); // 1 minute cooldown
    } catch (err) {
      setError('Kļūda nosūtot verifikācijas e-pastu. Lūdzu mēģiniet vēlreiz.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { sendVerification, loading, error, cooldown };
} 