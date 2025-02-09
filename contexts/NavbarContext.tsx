"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import Link from "next/link";

interface NavbarContextType {
  isNavbarVisible: boolean;
}

const NavbarContext = createContext<NavbarContextType>({ isNavbarVisible: true });

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when:
      // 1. Scrolling up
      // 2. At the top of the page
      if (currentScrollY < lastScrollY || currentScrollY < 64) {
        setIsNavbarVisible(true);
      } 
      // Hide navbar when scrolling down and not at top
      else if (currentScrollY > 64) {
        setIsNavbarVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <NavbarContext.Provider value={{ isNavbarVisible }}>
      <nav>
        <Link href="/profile">Mans Profils</Link>
      </nav>
      {children}
    </NavbarContext.Provider>
  );
}

export const useNavbar = () => useContext(NavbarContext); 