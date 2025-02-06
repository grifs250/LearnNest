"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import VacancyForm from "@/components/VacancyForm"; // Import vacancy form for teachers

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/auth/sign-in");
        return;
      }
      setUser(u);

      // Load user data from Firestore
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || "");
        setDescription(data.description || "");
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

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        description,
      });

      await updateProfile(user, { displayName });
      alert("Profils saglabāts!");
    } catch (err: any) {
      setError("Kļūda saglabājot datus.");
    }

    setSaving(false);
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
          onChange={(e) => setDisplayName(e.target.value)}
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

      <div className="form-control mb-4">
        <label className="label">Apraksts</label>
        <textarea
          className="textarea textarea-bordered"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Aprakstiet sevi..."
        />
      </div>

      <button onClick={handleSaveProfile} className="btn btn-primary mt-4" disabled={saving}>
        {saving ? "Saglabā..." : "Saglabāt"}
      </button>

      <button onClick={handleLogout} className="btn btn-error mt-4">
        Izrakstīties
      </button>

      {/* Show VacancyForm only for teachers */}
      {isTeacher && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Jūsu vakances</h2>
          <VacancyForm />
        </div>
      )}
    </div>
  );
}
