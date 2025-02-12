"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import SmoothScrollLink from "@/components/SmoothScrollLink";
import { Menu, X, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      try {
        if (u) {
          setUser(u);
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            const userData = snap.data();
            setIsTeacher(userData.isTeacher);
            setDisplayName(userData.displayName || '');
          } else {
            setIsTeacher(false);
            setDisplayName('');
          }
        } else {
          setUser(null);
          setIsTeacher(null);
          setDisplayName('');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsTeacher(false);
        setDisplayName('');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const profileButtonClass = isTeacher === null 
    ? "btn-neutral" 
    : isTeacher 
      ? "btn-secondary" 
      : "btn-accent";

  const navItems = [
    { label: "Kā tas strādā?", href: "#how-it-works" },
    { label: "Mācību priekšmeti", href: "#subjects" },
    { label: "Valodu kursi", href: "#languages" },
    { label: "IT kursi", href: "#it" },
    { label: "BUJ", href: "#buj" },
    { label: "Kontakti", href: "#contact" },
  ];

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/profile');
    } else {
      router.push('/auth?mode=login');
    }
  };

  return (
    <div>
      <nav className="navbar bg-primary text-primary-content">
        <div className="flex-1 mr-10">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            📚 LearnNest
          </Link>
        </div>

        <div className="md:hidden">
          <button
            className="btn btn-square btn-ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

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
          {!loading && (
            user ? (
              <Link 
                href="/profile" 
                onClick={handleProfileClick}
                className={`btn btn-sm flex items-center gap-1 ${profileButtonClass}`}
              >
                <UserIcon size={16} />
                {displayName || 'Profils'}
              </Link>
            ) : (
              <Link 
                href="/auth?mode=login" 
                className="btn btn-sm"
              >
                Pieslēgties
              </Link>
            )
          )}
        </div>
      </nav>

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
            {!loading && (
              user ? (
                <Link 
                  href="/profile" 
                  onClick={(e) => {
                    handleProfileClick(e);
                    setMobileOpen(false);
                  }}
                  className={`btn btn-sm flex items-center gap-1 ${profileButtonClass}`}
                >
                  <UserIcon size={16} />
                  {displayName || 'Profils'}
                </Link>
              ) : (
                <Link
                  href="/auth?mode=login"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-sm"
                >
                  Pieslēgties
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
