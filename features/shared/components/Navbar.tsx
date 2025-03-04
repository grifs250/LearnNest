"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SmoothScrollLink from "@/features/shared/components/ui/SmoothScrollLink";
import { Menu, X } from "lucide-react";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isTeacher = user?.publicMetadata?.role === 'teacher';
  const isStudent = user?.publicMetadata?.role === 'student';

  const publicNavItems = [
    { label: "Kā tas strādā?", href: "#how-it-works" },
    { label: "Mācību priekšmeti", href: "#mācību priekšmeti" },
    { label: "Valodu kursi", href: "#valodu kursi" },
    { label: "IT kursi", href: "#it kursi" },
    { label: "BUJ", href: "#buj" },
    { label: "Kontakti", href: "#contact" },
  ];

  let dashboardItems: Array<{ label: string; href: string }> = [];
  if (isTeacher) {
    dashboardItems = [{ label: "Mana Klase", href: "/teacher" }];
  } else if (isStudent) {
    dashboardItems = [{ label: "Manas Stundas", href: "/student" }];
  }

  const navItems = user ? [...dashboardItems, ...publicNavItems] : publicNavItems;

  // Auth button component that handles loading state
  const AuthButton = () => {
    if (!mounted) return null;
    
    if (!isLoaded) {
      return (
        <button className="btn btn-sm btn-neutral px-4" disabled>
          <span className="loading loading-spinner loading-xs mr-1" aria-hidden="true"></span>
          Ielādē...
        </button>
      );
    }

    return user ? (
      <UserButton afterSignOutUrl="/" />
    ) : (
      <SignInButton mode="modal">
        <button className="btn btn-sm btn-neutral px-4">
          🔑 Pieslēgties
        </button>
      </SignInButton>
    );
  };

  return (
    <div>
      <nav className="navbar bg-primary text-primary-content">
        <div className="flex-1 mr-10">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            📚 MāciesTe
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
            item.href.startsWith('#') && pathname === '/' ? (
              <SmoothScrollLink
                key={item.href}
                href={item.href}
                className="hover:underline"
              >
                {item.label}
              </SmoothScrollLink>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="hover:underline"
              >
                {item.label}
              </Link>
            )
          ))}
          <AuthButton />
        </div>
      </nav>

      {mobileOpen && (
        <div className="bg-primary text-primary-content p-4 flex flex-col gap-2 md:hidden">
          {navItems.map((item) => (
            item.href.startsWith('#') && pathname === '/' ? (
              <SmoothScrollLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="hover:underline text-center"
              >
                {item.label}
              </SmoothScrollLink>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="hover:underline text-center"
              >
                {item.label}
              </Link>
            )
          ))}
          <div className="flex justify-center">
            <AuthButton />
          </div>
        </div>
      )}
    </div>
  );
}