"use client";

import { createContext, useEffect, useState, useContext, ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isThemeReady: boolean;
};

const ThemeContext = createContext<ThemeContextType>({ 
  theme: "light", 
  toggleTheme: () => {},
  isThemeReady: false
});

// Initial theme detection - gets theme from HTML attribute
function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    // Read from document attribute (which is set by our inline script)
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme === 'dark' || dataTheme === 'light') {
      return dataTheme as Theme;
    }
    
    // If no data-theme attribute, try to get from localStorage
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error('Error reading theme preference:', e);
    }
  }
  
  // Default for SSR
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Use null initial state to prevent hydration mismatch
  const [theme, setTheme] = useState<Theme | null>(null);
  const [isThemeReady, setIsThemeReady] = useState(false);
  
  // After mounting, update theme from DOM or storage - this avoids hydration mismatch
  useEffect(() => {
    // Get theme that was set by the inline script
    const currentTheme = getInitialTheme();
    setTheme(currentTheme);
    setIsThemeReady(true);
    
    // Ensure the DOM reflects the current theme
    document.documentElement.setAttribute("data-theme", currentTheme);
    
    // Listen for system preference changes
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if user hasn't explicitly chosen a theme
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          setTheme(newTheme);
          document.documentElement.setAttribute("data-theme", newTheme);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (e) {
      console.error('Error setting up theme listener:', e);
    }
  }, []);
  
  // Handle theme toggling
  const toggleTheme = () => {
    if (!theme) return; // Safety check
    
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Update state
    setTheme(newTheme);
    
    // Update DOM
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // Persist to storage
    try {
      // Set cookie (for server-side and fast access)
      document.cookie = `theme=${newTheme};path=/;max-age=${60*60*24*365}`;
      
      // Also set localStorage (for backup)
      localStorage.setItem("theme", newTheme);
    } catch (e) {
      console.error("Error saving theme preference:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: theme || 'light', // Fallback when theme is null
      toggleTheme, 
      isThemeReady 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
