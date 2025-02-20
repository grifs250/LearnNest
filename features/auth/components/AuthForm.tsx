"use client";

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useApiCall } from '@/features/shared/hooks/useApiCall';
import { signIn, signUp } from '@/lib/api/auth';
import { signInSchema, signUpSchema } from '../validations';
import { AuthMode, SignInCredentials, SignUpCredentials } from '../types';
import { LoadingSpinner } from '@/features/shared/components';
import { errorTracker } from '@/features/monitoring/utils/error-tracking';

interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    execute: handleAuth,
    isLoading
  } = useApiCall();

  const validateForm = () => {
    const schema = mode === 'signIn' ? signInSchema : signUpSchema;
    const data = mode === 'signIn'
      ? { email, password }
      : { email, password, fullName, role };

    const result = schema.safeParse(data);

    if (!result.success) {
      const formErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        formErrors[error.path[0]] = error.message;
      });
      setErrors(formErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!validateForm()) return;

    try {
      if (mode === 'signIn') {
        const credentials: SignInCredentials = { email, password };
        await handleAuth(
          () => signIn(credentials),
          {
            successMessage: 'Signed in successfully',
            errorMessage: 'Failed to sign in'
          }
        );
      } else {
        const credentials: SignUpCredentials = { email, password, fullName, role };
        await handleAuth(
          () => signUp(credentials),
          {
            successMessage: 'Account created successfully',
            errorMessage: 'Failed to create account'
          }
        );
      }

      onSuccess?.();
    } catch (error) {
      errorTracker.captureError(error as Error, {
        action: mode === 'signIn' ? 'sign_in' : 'sign_up',
        metadata: { email }
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {mode === 'signUp' && (
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {mode === 'signUp' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            I want to
          </label>
          <div className="mt-1 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="student"
                checked={role === 'student'}
                onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                className="form-radio text-primary focus:ring-primary"
              />
              <span className="ml-2">Learn</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="teacher"
                checked={role === 'teacher'}
                onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                className="form-radio text-primary focus:ring-primary"
              />
              <span className="ml-2">Teach</span>
            </label>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : mode === 'signIn' ? (
          'Sign In'
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}
