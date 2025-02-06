"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode"); // Check if coming from login link
  const initialRole = params.get("role") || "skolēns"; // Default role is Skolēns
  const [isSignUp, setIsSignUp] = useState(mode !== "login"); // Default to sign-up unless `mode=login`
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "login") {
      setIsSignUp(false); // Ensure we force login mode if coming from Navbar
    }
  }, [mode]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        displayName,
        email,
        isTeacher: role === "pasniedzējs",
      });

      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Background & Button Color Based on Role (Neutral in Login Mode)
  const bgColor = isSignUp ? (role === "pasniedzējs" ? "bg-orange-100" : "bg-green-100") : "bg-gray-100";
  const buttonColor = isSignUp ? (role === "pasniedzējs" ? "btn-secondary" : "btn-accent") : "btn-neutral";

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${bgColor}`}>
      <form
        onSubmit={isSignUp ? handleSignUp : handleSignIn}
        className="card bg-white shadow-xl p-6 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isSignUp ? "Reģistrēties" : "Pieslēgties"}
        </h1>

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

            {/* Role Selection Buttons */}
            <div className="form-control mb-4">
              <label className="label font-semibold">Loma</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn w-1/2 ${role === "skolēns" ? "btn-accent" : "btn-outline"}`}
                  onClick={() => setRole("skolēns")}
                >
                  Skolēns
                </button>
                <button
                  type="button"
                  className={`btn w-1/2 ${role === "pasniedzējs" ? "btn-secondary" : "btn-outline"}`}
                  onClick={() => setRole("pasniedzējs")}
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
          <button
            type="button"
            className="text-blue-500 underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Pieslēgties" : "Reģistrēties"}
          </button>
        </p>
      </form>
    </div>
  );
}
