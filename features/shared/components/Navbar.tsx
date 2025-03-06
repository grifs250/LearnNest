"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import SmoothScrollLink from "@/features/shared/components/ui/SmoothScrollLink";
import { Menu, X, Book, HelpCircle, Phone, Home, Info } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// Dynamically import Clerk components to reduce initial bundle size
const UserButton = dynamic(() => import('@clerk/nextjs').then(mod => mod.UserButton), {
  ssr: false,
  loading: () => (
    <button className="btn btn-sm btn-neutral px-3">
      <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
      <span className="sr-only">Ielādē...</span>
    </button>
  )
});

const SignInButton = dynamic(() => import('@clerk/nextjs').then(mod => mod.SignInButton), {
  ssr: false,
  loading: () => (
    <button className="btn btn-sm btn-neutral px-3">
      <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
      <span className="sr-only">Ielādē...</span>
    </button>
  )
});

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

  // Basic nav items with icons for better UX
  const publicNavItems = [
    { 
      label: "Mācību priekšmeti", 
      shortLabel: "Priekšmeti",
      href: "#subjects", 
      icon: <Book size={16} className="mr-1" /> 
    },
    {
      label: "Kā tas darbojas",
      shortLabel: "Kā tas strādā",
      href: "#how-it-works",
      icon: <Info size={16} className="mr-1" />
    },
    { 
      label: "BUJ", 
      shortLabel: "BUJ",
      href: "#faq", 
      icon: <HelpCircle size={16} className="mr-1" /> 
    },
    { 
      label: "Kontakti", 
      shortLabel: "Kontakti",
      href: "#kontakti", 
      icon: <Phone size={16} className="mr-1" /> 
    },
  ];

  let dashboardItems: Array<{ label: string; shortLabel: string; href: string; icon: React.ReactNode }> = [];
  if (isTeacher) {
    dashboardItems = [{ 
      label: "Mana Klase", 
      shortLabel: "Klase",
      href: "/teacher", 
      icon: <Home size={16} className="mr-1" /> 
    }];
  } else if (isStudent) {
    dashboardItems = [{ 
      label: "Manas Stundas", 
      shortLabel: "Stundas",
      href: "/student", 
      icon: <Book size={16} className="mr-1" /> 
    }];
  }

  const navItems = user ? [...dashboardItems, ...publicNavItems] : publicNavItems;

  // Auth button component that handles loading state
  const AuthButton = () => {
    if (!mounted) return null;
    
    if (!isLoaded) {
      return (
        <button className="btn btn-sm btn-neutral px-3" disabled>
          <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
          <span className="sr-only">Ielādē...</span>
        </button>
      );
    }

    return user ? (
      <UserButton afterSignOutUrl="/" />
    ) : (
      <SignInButton mode="modal">
        <button className="btn btn-sm btn-neutral px-3">
          <span className="hidden sm:inline">🔑 Pieslēgties</span>
          <span className="sm:hidden">🔑</span>
        </button>
      </SignInButton>
    );
  };

  return (
    <div className="sticky top-0 z-50">
      <nav className="navbar bg-primary text-primary-content shadow-md">
        <div className="flex-1 mr-2">
          <Link href="/" className="btn btn-ghost normal-case text-lg sm:text-xl">
            📚 <span>MāciesTe</span>
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

        <div className="hidden md:flex gap-1 lg:gap-4 mr-2 items-center">
          {navItems.map((item) => (
            item.href.startsWith('#') && pathname === '/' ? (
              <SmoothScrollLink
                key={item.href}
                href={item.href}
                className="btn btn-ghost btn-sm px-2 lg:px-3"
                offset={-80}
              >
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden">{item.shortLabel}</span>
              </SmoothScrollLink>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="btn btn-ghost btn-sm px-2 lg:px-3"
              >
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden">{item.shortLabel}</span>
              </Link>
            )
          ))}
          <AuthButton />
        </div>
      </nav>

      {mobileOpen && (
        <div className="bg-primary text-primary-content p-4 flex flex-col gap-2 md:hidden shadow-lg">
          {navItems.map((item) => (
            item.href.startsWith('#') && pathname === '/' ? (
              <SmoothScrollLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="btn btn-ghost justify-start"
                offset={-80}
              >
                {item.icon} {item.label}
              </SmoothScrollLink>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="btn btn-ghost justify-start"
              >
                {item.icon} {item.label}
              </Link>
            )
          ))}
          <div className="flex justify-center mt-2">
            <AuthButton />
          </div>
        </div>
      )}
    </div>
  );
}