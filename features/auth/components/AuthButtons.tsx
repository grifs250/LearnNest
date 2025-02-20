"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthButtons() {
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
      <a className="btn btn-accent w-full sm:w-auto" href="/auth?role=skolēns">
        👩‍🎓 Reģistrēties kā Skolēns
      </a>
      <a className="btn btn-secondary w-full sm:w-auto" href="/auth?role=pasniedzējs">
        👨‍🏫 Reģistrēties kā Pasniedzējs
      </a>
    </div>
  );
} 