'use client';

import { useSearchParams } from 'next/navigation';
import { SignUpForm } from "@/features/auth/components";

export default function ClientRegisterPage() {
  // Use client-side search params hook instead
  const searchParams = useSearchParams();
  const roleParam = searchParams?.get('role');
  
  // Simple validation on the client side
  const role = roleParam === 'teacher' || roleParam === 'student' 
    ? roleParam 
    : undefined;

  return (
    <div className="container mx-auto py-10">
      <SignUpForm role={role} />
    </div>
  );
} 