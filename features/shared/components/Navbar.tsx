"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import SmoothScrollLink from "@/features/shared/components/ui/SmoothScrollLink";
import { Menu, X, Book, HelpCircle, Phone, Home, Info, Sun, Moon, User, LogOut, Settings } from "lucide-react";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { useTheme } from "@/app/themeProvider";
import { isLoggedInFromCookie, getUserRoleFromCookie } from "@/lib/utils/cookies";
import { useRouter } from "next/navigation";

// Dynamically import Clerk components to reduce initial bundle size
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
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme, isThemeReady } = useTheme();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close the mobile menu when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Public navigation items available to all users
  const navItems: NavItem[] = [
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

  // Custom user button with dropdown
  const CustomUserButton = () => {
    const toggleMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsMenuOpen(!isMenuOpen);
    };
    
    // Handle outside clicks using useEffect instead of refs on initial render
    useEffect(() => {
      if (!mounted) return;
      
      // Only add click handlers after component is mounted
      const handleClickOutside = (event: MouseEvent) => {
        if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      };
      
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [mounted, isMenuOpen]);
    
    // No ref during server rendering - will be attached after hydration by React
    return (
      <div className="relative" {...(mounted ? { ref: profileDropdownRef } : {})}>
        <button
          className="btn btn-circle btn-ghost overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          {user?.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt={user.fullName || 'Lietotājs'} 
              className="w-8 h-8 rounded-full object-cover" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
              {user?.fullName?.[0] || user?.username?.[0] || 'U'}
            </div>
          )}
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-base-100 border border-base-300 z-[100]">
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-base-content border-b border-base-200 mb-1">
                {user?.fullName || user?.username || 'Lietotājs'}
              </div>
              <Link 
                href={`/profile/${user?.id}`} 
                className="block px-4 py-2 text-sm text-base-content hover:bg-base-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span>Mans profils</span>
                </div>
              </Link>
              {user?.publicMetadata?.role === 'teacher' && (
                <Link 
                  href="/teacher" 
                  className="block px-4 py-2 text-sm text-base-content hover:bg-base-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Book size={16} className="mr-2" />
                    <span>Pasniedzēja panelis</span>
                  </div>
                </Link>
              )}
              {user?.publicMetadata?.role === 'student' && (
                <Link 
                  href="/student" 
                  className="block px-4 py-2 text-sm text-base-content hover:bg-base-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Book size={16} className="mr-2" />
                    <span>Skolēna panelis</span>
                  </div>
                </Link>
              )}
              <div className="border-t border-base-200 mt-1">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }} 
                  className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-base-200"
                >
                  <div className="flex items-center">
                    <LogOut size={16} className="mr-2" />
                    <span>Iziet</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
      <div className="order-last order-none">
        {/* Login button - initially hidden for all users until client-side hydration */}
        <div className="hidden" data-auth-login>
          <Link
            href="/login"
            className="btn btn-sm btn-neutral bg-base-200 hover:bg-base-300 text-base-content border-base-300 shadow-sm"
            prefetch={true}
            onClick={handleLogin}
          >
            <User size={16} className="mr-1" />
            Ieiet
          </Link>
        </div>
        
        {/* User button - initially hidden for all users until client-side hydration */}
        <div className="hidden" data-auth-user>
          {isLoggedIn && <CustomUserButton />}
        </div>

        {/* Apply correct visibility after hydration */}
        {mounted && (
          <style jsx global>{`
            [data-auth-login] {
              display: ${isLoggedIn ? 'none' : 'block'};
            }
            [data-auth-user] {
              display: ${isLoggedIn ? 'block' : 'none'};
            }
          `}</style>
        )}
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
      <nav className="navbar bg-primary text-primary-content shadow-md px-2 sm:px-4">
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
        </div>

        {/* Always visible auth and theme controls */}
        <div className="flex items-center gap-2 pr-1 sm:pr-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Auth Button - always visible */}
          <AuthButton />
          
          {/* Mobile menu button - only on small screens */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden btn btn-ghost btn-sm"
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
        </div>
      )}
    </div>
  );
}