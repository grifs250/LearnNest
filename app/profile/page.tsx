"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/auth/sign-in");
        return;
      }
      setUser(u);

      // Ielādējam lietotāja datus no Firestore
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || "");
        setIsTeacher(!!data.isTeacher);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  if (loading) {
    return <div className="p-6 text-center">Ielādē...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-base-100 shadow">
      <h1 className="text-2xl font-bold mb-4">Profils</h1>
      
      {error && <p className="text-red-500">{error}</p>}

      <div className="form-control mb-4">
        <label className="label">Vārds</label>
        <input
          type="text"
          className="input input-bordered"
          value={displayName}
          disabled
        />
      </div>

      <div className="form-control mb-4">
        <label className="label">Loma</label>
        <input
          type="text"
          className="input input-bordered"
          value={isTeacher ? "Pasniedzējs" : "Skolēns"}
          disabled
        />
      </div>

      <button onClick={handleLogout} className="btn btn-error mt-4">
        Izrakstīties
      </button>
    </div>
  );
}
