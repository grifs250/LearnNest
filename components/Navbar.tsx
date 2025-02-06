"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import SmoothScrollLink from "@/components/SmoothScrollLink";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null); // Use `null` for initial state

  // Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            setIsTeacher(snap.data().isTeacher);
          } else {
            setIsTeacher(false); // Default to student if no Firestore data
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsTeacher(false); // Fallback to student
        }
      } else {
        setUser(null);
        setIsTeacher(null); // Reset state when logged out
      }
    });

    return () => unsubscribe();
  }, []);

  // Determine profile button color (only apply if role is known)
  const profileButtonClass =
    isTeacher === null ? "btn-neutral" : isTeacher ? "btn-secondary" : "btn-accent";

  const navItems = [
    { label: "Kā tas strādā?", href: "#how-it-works" },
    { label: "Mācību priekšmeti", href: "#subjects" },
    { label: "Valodu kursi", href: "#languages" },
    { label: "IT kursi", href: "#it" },
    { label: "BUJ", href: "#buj" },
    { label: "Kontakti", href: "#contact" },
  ];

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar bg-primary text-primary-content">
        {/* Left side: Logo */}
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            📚 LearnNest
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="btn btn-square btn-ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 mr-4 items-center">
          {navItems.map((item) => (
            <SmoothScrollLink
              key={item.href}
              href={pathname === "/" ? item.href : `/${item.href}`}
              className="hover:underline"
            >
              {item.label}
            </SmoothScrollLink>
          ))}
          {user ? (
            <Link href="/profile" className={`btn btn-sm flex items-center gap-1 ${profileButtonClass}`}>
              <User size={16} />
              {user.email}
            </Link>
          ) : (
            <Link href="/auth?mode=login" className="btn btn-sm">
              Pieslēgties
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu (Inline) */}
      {mobileOpen && (
        <div className="bg-primary text-primary-content p-4 flex flex-col gap-2 md:hidden">
          {navItems.map((item) => (
            <SmoothScrollLink
              key={item.href}
              href={pathname === "/" ? item.href : `/${item.href}`}
              onClick={() => setMobileOpen(false)}
              className="hover:underline text-center"
            >
              {item.label}
            </SmoothScrollLink>
          ))}
          <div className="flex justify-center">
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className={`btn btn-sm flex items-center gap-1 ${profileButtonClass}`}
              >
                <User size={16} />
                {user.email}
              </Link>
            ) : (
              <Link
                href="/auth?mode=login"
                onClick={() => setMobileOpen(false)}
                className="btn btn-sm"
              >
                Pieslēgties
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
