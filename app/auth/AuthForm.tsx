"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile,
  AuthError
} from "firebase/auth";
import { FirebaseError } from 'firebase/app';
import { doc, setDoc, getDoc } from "firebase/firestore";

interface AuthFormProps {
  initialMode: string;
  initialRole: string;
  updateRole: (role: string) => void;
  updateMode: (mode: string) => void;
}

export default function AuthForm({ initialMode, initialRole, updateRole, updateMode }: AuthFormProps) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(initialMode !== "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(initialRole);
    setIsSignUp(initialMode !== "login");
  }, [initialRole, initialMode]);

  // Add check for verified parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setError("E-pasts veiksmīgi apstiprināts! Lūdzu piesakieties.");
    }
  }, []);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      // Set language for Firebase Auth
      auth.languageCode = 'lv';
      
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with pending status
      await setDoc(doc(db, "users", userCred.user.uid), {
        displayName,
        email,
        isTeacher: role === "pasniedzējs",
        emailVerified: false,
        status: 'pending',
        createdAt: new Date()
      });

      // Send verification email
      await sendEmailVerification(userCred.user, {
        url: `${window.location.origin}/auth/action?redirect=profile`,
        handleCodeInApp: true
      });

      router.push("/verify-email");
    } catch (err) {
      // Don't log to console in production
      if ((err as FirebaseError).code) {
        const errorMessage = {
          'auth/email-already-in-use': 'Šis e-pasts jau ir reģistrēts',
          'auth/invalid-email': 'Nederīga e-pasta adrese',
          'auth/weak-password': 'Parole ir pārāk vāja',
          'auth/network-request-failed': 'Savienojuma kļūda. Pārbaudiet interneta pieslēgumu',
        }[(err as FirebaseError).code] || 'Kļūda reģistrējoties. Lūdzu, mēģiniet vēlreiz';
        setError(errorMessage);
      } else {
        setError('Kļūda reģistrējoties. Lūdzu, mēģiniet vēlreiz');
      }
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCred.user.emailVerified) {
        await sendEmailVerification(userCred.user, {
          url: `${window.location.origin}/auth/action`,
        });
        router.push("/verify-email");
        return;
      }
      
      router.push("/profile");
    } catch (err) {
      // Don't log to console in production
      if ((err as FirebaseError).code) {
        const errorMessage = {
          'auth/invalid-credential': 'Nepareizs e-pasts vai parole',
          'auth/user-not-found': 'Nepareizs e-pasts vai parole',
          'auth/wrong-password': 'Nepareizs e-pasts vai parole',
          'auth/invalid-email': 'Nederīga e-pasta adrese',
          'auth/user-disabled': 'Šis konts ir bloķēts',
          'auth/too-many-requests': 'Pārāk daudz mēģinājumu. Lūdzu, uzgaidiet brīdi',
          'auth/network-request-failed': 'Savienojuma kļūda. Pārbaudiet interneta pieslēgumu',
        }[(err as FirebaseError).code] || 'Kļūda pieslēdzoties. Lūdzu, mēģiniet vēlreiz';
        setError(errorMessage);
      } else {
        setError('Kļūda pieslēdzoties. Lūdzu, mēģiniet vēlreiz');
      }
    }
  }

  // Function to toggle login/signup mode
  function toggleMode() {
    const newMode = isSignUp ? "login" : "signup";
    setIsSignUp(!isSignUp);
    updateMode(newMode);
  }

  // Function to handle role change
  function handleRoleChange(newRole: string) {
    setRole(newRole);
    updateRole(newRole);
  }

  // Dynamic Background & Button Colors
  const bgColor = isSignUp ? (role === "pasniedzējs" ? "bg-orange-200" : "bg-green-200") : "bg-gray-100";
  const buttonColor = isSignUp ? (role === "pasniedzējs" ? "btn-secondary" : "btn-accent") : "btn-neutral";

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${bgColor}`}>
      <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="card bg-white shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">{isSignUp ? "Reģistrēties" : "Pieslēgties"}</h1>

        {error && <p className="text-red-500">{error}</p>}

        {isSignUp && (
          <>
            <div className="form-control mb-4">
              <label className="label font-semibold">Vārds</label>
              <input
                type="text"
                className="input input-bordered"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            {/* Role Selection */}
            <div className="form-control mb-4">
              <label className="label font-semibold">Loma</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn w-1/2 ${role === "skolēns" ? "btn-accent" : "btn-outline"}`}
                  onClick={() => handleRoleChange("skolēns")}
                >
                  Skolēns
                </button>
                <button
                  type="button"
                  className={`btn w-1/2 ${role === "pasniedzējs" ? "btn-secondary" : "btn-outline"}`}
                  onClick={() => handleRoleChange("pasniedzējs")}
                >
                  Pasniedzējs
                </button>
              </div>
            </div>
          </>
        )}

        <div className="form-control mb-4">
          <label className="label font-semibold">E-pasts</label>
          <input
            type="email"
            className="input input-bordered"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-control mb-4">
          <label className="label font-semibold">Parole</label>
          <input
            type="password"
            className="input input-bordered"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={`btn w-full ${buttonColor}`}>
          {isSignUp ? "Reģistrēties" : "Pieslēgties"}
        </button>

        <p className="mt-4 text-center">
          {isSignUp ? "Jau ir konts?" : "Nav konta?"}{" "}
          <button type="button" className="text-blue-500 underline" onClick={toggleMode}>
            {isSignUp ? "Pieslēgties" : "Reģistrēties"}
          </button>
        </p>
      </form>
    </div>
  );
}
