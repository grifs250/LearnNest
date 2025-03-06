import { useState } from 'react';
import { verifyEmail, resendVerificationEmail } from '@/lib/clerk/verification';

/**
 * Custom hook for email verification functionality
 * 
 * @returns Object with verification functions and state
 */
export const useVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * Verify an email with the provided code
   * 
   * @param code - Verification code
   * @param email - Email to verify
   * @returns Success state
   */
  const verifyEmailWithCode = async (code: string, email: string) => {
    setIsVerifying(true);
    setError('');
    
    try {
      const result = await verifyEmail(code, email);
      
      if (result.success) {
        setSuccess(true);
        return true;
      } else {
        setError(result.message || 'Verifikācija neizdevās.');
        return false;
      }
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(err.message || 'Kļūda verificējot e-pastu.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Resend verification email
   * 
   * @param email - Email to send verification to
   * @returns Success state
   */
  const resendCode = async (email: string) => {
    setIsResending(true);
    setError('');
    
    try {
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        return true;
      } else {
        setError(result.message || 'Neizdevās nosūtīt kodu.');
        return false;
      }
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setError(err.message || 'Kļūda sūtot verifikācijas kodu.');
      return false;
    } finally {
      setIsResending(false);
    }
  };

  return {
    verifyEmailWithCode,
    resendCode,
    isVerifying,
    isResending,
    error,
    success,
    setError,
    setSuccess
  };
}; 