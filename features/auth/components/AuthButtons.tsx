"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { AuthMode } from '../types';
import Link from "next/link";

interface AuthButtonsProps {
  readonly mode?: AuthMode;
}

export function AuthButtons({ mode = 'signup' }: AuthButtonsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;
  if (isLoggedIn) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-7 pt-10 justify-center">
      <Link 
        href={`/auth?mode=${mode}&role=skolēns`}
        className="btn btn-accent w-full sm:w-auto"
      >
        👩‍🎓 {mode === 'login' ? 'Ieiet kā Skolēns' : 'Reģistrēties kā Skolēns'}
      </Link>
      <Link 
        href={`/auth?mode=${mode}&role=pasniedzējs`}
        className="btn btn-secondary w-full sm:w-auto"
      >
        👨‍🏫 {mode === 'login' ? 'Ieiet kā Pasniedzējs' : 'Reģistrēties kā Pasniedzējs'}
      </Link>
    </div>
  );
} 