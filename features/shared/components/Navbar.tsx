"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import SmoothScrollLink from "@/features/shared/components/ui/SmoothScrollLink";
import { Menu, X, Book, HelpCircle, Phone, Home, Info, Sun, Moon, User } from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useTheme } from "@/app/themeProvider";
import { isLoggedInFromCookie, getUserRoleFromCookie } from "@/lib/utils/cookies";
import { useRouter } from "next/navigation";

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

// Define interface for navigation items
interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  hash?: string;
  icon: React.ReactNode;
}

/**
 * Main navigation component
 * Responsive with mobile menu and properly handles authenticated state
 * All UI elements in Latvian
 */
export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme, isThemeReady } = useTheme();

  // Function to check if user is logged in from cookies
  // This provides instant auth state without waiting for Clerk to load
  const getInitialAuthState = (): boolean => {
    if (typeof document === 'undefined') return false;
    
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        if (cookie.trim().startsWith('__session=')) {
          return true;
        }
      }
    } catch (e) {
      console.error('Error checking auth cookie:', e);
    }
    
    return false;
  };
  
  // Quick auth state from cookie for instant UI decisions
  const isLoggedIn = isSignedIn ?? getInitialAuthState();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the mobile menu when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // User-specific navigation items
  const userNavItems: NavItem[] = isSignedIn ? [
    {
      label: "Mans profils",
      shortLabel: "Profils",
      href: user ? `/profile/${user.id}` : "/profile",
      icon: <User size={16} className="mr-1" />
    }
  ] : [];

  // Public navigation items available to all users
  const publicNavItems: NavItem[] = [
    // Reordered to put "How it works" first
    { 
      label: "Kā tas darbojas", 
      shortLabel: "Kā darbojas",
      href: "/", 
      hash: "#how-it-works",
      icon: <Info size={16} className="mr-1" /> 
    },
    { 
      label: "Mācību priekšmeti", 
      shortLabel: "Priekšmeti",
      href: "/", 
      hash: "#subjects",
      icon: <Book size={16} className="mr-1" /> 
    },
    {
      label: "Biežāk uzdotie jautājumi",
      shortLabel: "BUJ",
      href: "/",
      hash: "#buj",
      icon: <HelpCircle size={16} className="mr-1" />
    },
    {
      label: "Kontakti",
      shortLabel: "Kontakti",
      href: "/",
      hash: "#kontakti",
      icon: <Phone size={16} className="mr-1" />
    }
  ];

  const navItems = [...userNavItems, ...publicNavItems];

  // Auth button component with gray appearance
  const AuthButton = () => {
    // Instead of conditionally rendering based on client-side state,
    // we'll render both versions but hide one with CSS
    // This ensures the button is clickable instantly 
    
    // Function to handle navigation with proper root path
    const handleLogin = (e: React.MouseEvent) => {
      // If we're not on the homepage, we need to go to the login page directly
      if (pathname !== '/') {
        e.preventDefault();
        router.push('/login');
      }
    };
    
    return (
      <div className="w-full md:w-auto mt-4 md:mt-0 order-last md:order-none">
        {/* Static version always visible during SSR */}
        <div className={`${isLoggedIn ? 'hidden' : ''}`}>
          <Link
            href="/login"
            className="btn btn-sm btn-neutral bg-base-200 hover:bg-base-300 text-base-content border-base-300 shadow-sm w-full md:w-auto"
            prefetch={true}
            onClick={handleLogin}
          >
            <User size={16} className="mr-1" />
            Ieiet
          </Link>
        </div>
        
        {/* User button only shown when logged in */}
        {isLoggedIn && <UserButton afterSignOutUrl="/" />}
      </div>
    );
  };

  // Theme toggle button with improved server/client consistency
  const ThemeToggle = () => {
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

  // Function to handle navigation to sections on any page
  const navigateToSection = (href: string, hash?: string) => {
    if (!hash) return router.push(href);
    
    // Always close mobile menu when navigating
    setMobileOpen(false);
    
    if (pathname !== '/') {
      // If not on homepage, go to homepage with hash
      router.push(`${href}${hash}`);
    } else {
      // If on homepage, scroll to section
      const element = document.querySelector(hash);
      if (element) {
        // Smooth scroll with offset for the navbar
        element.scrollIntoView({ behavior: 'smooth' });
        // Add a small delay and scroll again with offset to ensure proper positioning
        setTimeout(() => {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 100,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  };

  return (
    <div className="sticky top-0 z-50">
      <nav className="navbar bg-primary text-primary-content shadow-md">
        <div className="flex-1 mr-2">
          <Link href="/" className="btn btn-ghost normal-case text-lg sm:text-xl">
            📚 <span>MāciesTe</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex md:flex-row md:gap-1 items-center">
          {/* Nav Links */}
          <div className="flex items-center">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigateToSection(item.href, item.hash)}
                className="btn btn-ghost btn-sm mx-1"
              >
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden">{item.shortLabel}</span>
              </button>
            ))}
          </div>
          
          {/* Login/User Button */}
          <AuthButton />
          
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-ghost btn-sm"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-base-100 shadow-md border-t border-base-300 px-4 py-3 flex flex-col gap-2">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigateToSection(item.href, item.hash)}
              className="btn btn-ghost btn-sm justify-start w-full"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          {/* Login button in mobile menu */}
          <AuthButton />
        </div>
      )}
    </div>
  );
}