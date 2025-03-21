"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Book, Calendar, Home, LayoutDashboard, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Dashboard layout for student and teacher pages
 * Provides navigation and layout structure
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  // Profile completion check
  useEffect(() => {
    if (isLoaded && user) {
      // Check if profile requires setup
      const profileCompleted = user.unsafeMetadata?.profile_completed === true;
      const profileNeedsSetup = user.unsafeMetadata?.profile_needs_setup === true;
      
      if (profileNeedsSetup || !profileCompleted) {
        // Redirect to profile setup if not completed
        router.push('/profile/setup');
      } else {
        setIsCheckingProfile(false);
      }
    } else if (isLoaded) {
      setIsCheckingProfile(false);
    }
  }, [isLoaded, user, router]);
  
  // Extract user role from metadata
  const userRole = user?.unsafeMetadata?.role as string || "student";
  
  // Navigation links based on user role
  const navLinks = userRole === "teacher" ? [
    { name: "Panelis", href: "/teacher", icon: <LayoutDashboard size={18} /> },
    { name: "Nodarbības", href: "/teacher/lessons", icon: <Book size={18} /> },
    { name: "Grafiks", href: "/teacher/schedule", icon: <Calendar size={18} /> },
    { name: "Profils", href: "/profile", icon: <User size={18} /> },
    { name: "Iestatījumi", href: "/settings", icon: <Settings size={18} /> },
  ] : [
    { name: "Panelis", href: "/student", icon: <LayoutDashboard size={18} /> },
    { name: "Nodarbības", href: "/student/lessons", icon: <Book size={18} /> },
    { name: "Rezervācijas", href: "/student/bookings", icon: <Calendar size={18} /> },
    { name: "Profils", href: "/profile", icon: <User size={18} /> },
    { name: "Iestatījumi", href: "/settings", icon: <Settings size={18} /> },
  ];
  
  // Loading state while checking profile
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content">Pārbauda profila statusu...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="drawer lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content min-h-screen bg-base-200">
        {/* Page content */}
        <div className="flex flex-col">
          {/* Top navigation for mobile */}
          <div className="flex justify-between items-center py-2 px-4 bg-base-100 shadow-md lg:hidden">
            <div className="flex items-center gap-2">
              <label htmlFor="dashboard-drawer" className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </label>
              <Link href="/" className="font-bold text-lg">MāciesTe</Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/" className="btn btn-ghost btn-sm">
                <Home size={18} />
              </Link>
            </div>
          </div>
          
          {/* Main content area */}
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </div>
      
      <div className="drawer-side">
        <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        
        <div className="min-h-full w-64 bg-base-100 text-base-content flex flex-col">
          {/* Sidebar header with logo */}
          <div className="p-4 border-b border-base-300">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-primary">MāciesTe</span>
            </Link>
            <div className="text-sm opacity-60">
              {userRole === "teacher" ? "Pasniedzēja panelis" : "Skolēna panelis"}
            </div>
          </div>
          
          {/* User profile info */}
          {isLoaded && user && (
            <div className="p-4 border-b border-base-300 flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={user.imageUrl} alt={user.fullName || "User"} />
                </div>
              </div>
              <div>
                <div className="font-medium">{user.fullName || "User"}</div>
                <div className="text-xs opacity-60">{user.primaryEmailAddress?.emailAddress}</div>
              </div>
            </div>
          )}
          
          {/* Navigation links */}
          <ul className="menu p-4 w-full">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link 
                  href={link.href} 
                  className={pathname === link.href ? "active" : ""}
                >
                  {link.icon}
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Sidebar footer */}
          <div className="mt-auto p-4 border-t border-base-300">
            <Link href="/" className="btn btn-outline btn-sm btn-block">
              <Home size={16} className="mr-2" />
              Atpakaļ uz sākumlapu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 