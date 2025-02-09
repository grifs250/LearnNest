"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import SmoothScrollLink from "./SmoothScrollLink";
import { useNavbar } from '@/contexts/NavbarContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const pathname = usePathname();
  const { isNavbarVisible } = useNavbar();

  const navItems = [
    { label: "Kā tas strādā?", href: "#how-it-works" },
    { label: "Mācību priekšmeti", href: "#subjects" },
    { label: "Valodu kursi", href: "#languages" },
    { label: "IT kursi", href: "#it" },
    { label: "BUJ", href: "#buj" },
    { label: "Kontakti", href: "#contact" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsTeacher(!!userDoc.data().isTeacher);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="relative">
      {/* Navigation Bar */}
      <nav className={`
        fixed top-0 left-0 right-0 bg-primary text-primary-content
        transition-transform duration-300 z-40
        ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}
      `}>
        <div className="navbar py-2">
          {/* Left side: Logo */}
          <div className="flex-1 mr-10">
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
            
            {/* Profile dropdown */}
            {user ? (
              <div className="dropdown dropdown-end">
                <button 
                  tabIndex={0} 
                  className={`btn btn-sm ${
                    isTeacher ? "btn-secondary" : "btn-primary"
                  }`}
                >
                  <span className="hidden lg:inline">{user.email}</span>
                  <User className="w-4 h-4 lg:hidden" />
                </button>
                <button tabIndex={0} className="dropdown-content w-full text-left">
                  <ul className="mt-2 p-2 shadow-lg menu menu-compact bg-base-200 rounded-box w-52 z-50">
                    <li>
                      <Link
                        href="/profile"
                        className={`hover:bg-base-300 text-base font-medium ${
                          isTeacher ? "text-secondary" : "text-primary"
                        }`}
                        onClick={() => {
                          const elem = document.activeElement as HTMLElement;
                          elem?.blur();
                        }}
                      >
                        Mans Profils
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/profile/setup" 
                        className="hover:bg-base-300 text-base font-medium text-neutral"
                        onClick={() => {
                          const elem = document.activeElement as HTMLElement;
                          elem?.blur();
                        }}
                      >
                        Rediģēt Profilu
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          handleSignOut();
                          const elem = document.activeElement as HTMLElement;
                          elem?.blur();
                        }}
                        className="hover:bg-base-300 text-error text-base font-medium"
                      >
                        Iziet
                      </button>
                    </li>
                  </ul>
                </button>
              </div>
            ) : (
              <Link href="/auth?mode=login" className="btn btn-sm">
                Pieslēgties
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Inline) */}
      {mobileOpen && (
        <div className="fixed top-[72px] left-0 right-0 bg-primary text-primary-content p-4 flex flex-col gap-2 md:hidden z-30">
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
              <div className="w-auto">
                <div className="flex flex-col gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={`btn btn-sm ${
                      isTeacher ? "btn-secondary" : "btn-primary"
                    }`}
                  >
                    Mans Profils
                  </Link>
                  <Link
                    href="/profile/setup"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-sm btn-ghost"
                  >
                    Rediģēt Profilu
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setMobileOpen(false);
                    }}
                    className="btn btn-sm btn-error"
                  >
                    Iziet
                  </button>
                </div>
              </div>
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
