"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import SmoothScrollLink from "@/features/shared/components/ui/SmoothScrollLink";
import { Menu, X, Book, HelpCircle, Phone, Home, Info, Sun, Moon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/app/themeProvider";
import { isLoggedInFromCookie, getUserRoleFromCookie } from "@/lib/utils/cookies";

// Dynamically import Clerk components to reduce initial bundle size
const UserButton = dynamic(() => import('@clerk/nextjs').then(mod => mod.UserButton), {
  ssr: false,
  loading: () => (
    <button className="btn btn-sm btn-neutral px-3" disabled>
      <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
      <span className="sr-only">Ielādē...</span>
    </button>
  )
});

const SignInButton = dynamic(() => import('@clerk/nextjs').then(mod => mod.SignInButton), {
  ssr: false,
  loading: () => (
    <button className="btn btn-sm btn-neutral px-3" disabled>
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
  const { theme, toggleTheme, isThemeReady } = useTheme();

  // Quick auth state from cookie for instant UI decisions
  const [cookieAuthState, setCookieAuthState] = useState<boolean | null>(null);
  const [cookieUserRole, setCookieUserRole] = useState<'student' | 'teacher' | null>(null);

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Check cookies for fast initial rendering
    setCookieAuthState(isLoggedInFromCookie());
    setCookieUserRole(getUserRoleFromCookie());
  }, []);

  // Fast initial auth check before Clerk loads
  const getInitialAuthState = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // First check localStorage (fastest)
    const localAuth = localStorage.getItem('mt_auth_state') === 'true' || 
                     localStorage.getItem('hasSession') === 'true';
    if (localAuth) return true;
    
    // Then check cookies
    const cookieAuth = document.cookie.includes('mt_auth_state=true');
    return cookieAuth;
  };
  
  // Initial state from storage
  const [cachedAuthState] = useState<boolean>(getInitialAuthState());
  
  // Use the fast initial state until Clerk loads
  const isLoggedIn = isLoaded ? !!user : cachedAuthState;

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Check if the current page is the landing page
  const isLandingPage = pathname === "/";

  // Links for the navbar
  const links = [
    { name: "Sākums", href: "/", icon: <Home size={16} /> },
    { name: "Par mums", href: "/#about", icon: <Info size={16} /> },
    { name: "Priekšmeti", href: "/#subjects", icon: <Book size={16} /> },
    { name: "BUJ", href: "/#faq", icon: <HelpCircle size={16} /> },
    { name: "Kontakti", href: "/#kontakti", icon: <Phone size={16} /> },
  ];

  // Auth button component that's available instantly
  const AuthButton = () => {
    // Instead of conditionally rendering based on client-side state,
    // we'll render both versions but hide one with CSS
    // This ensures the button is clickable instantly 
    
    return (
      <div className="w-full md:w-auto">
        {/* Static version always visible during SSR */}
        <div className={`${isLoggedIn ? 'hidden' : ''}`}>
          <Link
            href="/login"
            className="btn btn-sm btn-primary"
            prefetch={true}
          >
            Ieiet
          </Link>
        </div>
        
        {/* User button only shown when logged in */}
        {isLoggedIn && <UserButton afterSignOutUrl="/" />}
      </div>
    );
  };

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
  if (user?.publicMetadata?.role === 'teacher') {
    dashboardItems = [{ 
      label: "Mana Klase", 
      shortLabel: "Klase",
      href: "/teacher", 
      icon: <Home size={16} className="mr-1" /> 
    }];
  } else if (user?.publicMetadata?.role === 'student') {
    dashboardItems = [{ 
      label: "Manas Stundas", 
      shortLabel: "Stundas",
      href: "/student", 
      icon: <Book size={16} className="mr-1" /> 
    }];
  }

  const navItems = user ? [...dashboardItems, ...publicNavItems] : publicNavItems;

  // Theme toggle button with improved server/client consistency
  const ThemeToggle = () => {
    const { theme, toggleTheme, isThemeReady } = useTheme();
    
    return (
      <button
        onClick={toggleTheme}
        className="btn btn-sm btn-ghost rounded-btn"
        aria-label="Toggle theme"
      >
        {/* Render placeholder until theme is ready */}
        {!isThemeReady ? (
          <div className="h-5 w-5">
            {/* Empty div placeholder during SSR and hydration */}
          </div>
        ) : (
          /* Show correct icon based on current theme */
          theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )
        )}
      </button>
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
          <ThemeToggle />
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
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}