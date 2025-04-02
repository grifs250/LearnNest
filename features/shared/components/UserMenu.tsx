"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { User, Book, LogOut } from "lucide-react";

export default function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative">
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
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-base-100 border border-base-300 z-[100]" ref={dropdownRef}>
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
} 