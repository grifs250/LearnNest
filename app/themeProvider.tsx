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
      return dataTheme;
    }
  }
  
  // Default for SSR
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server-side default (will be updated on client)
  const [theme, setTheme] = useState<Theme>("light");
  const [isThemeReady, setIsThemeReady] = useState(false);
  
  // After mounting, update theme from DOM or storage - this avoids hydration mismatch
  useEffect(() => {
    // Get theme that was set by the inline script
    const currentTheme = getInitialTheme();
    setTheme(currentTheme);
    setIsThemeReady(true);
  }, []);
  
  // Handle theme toggling
  const toggleTheme = () => {
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
    <ThemeContext.Provider value={{ theme, toggleTheme, isThemeReady }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
