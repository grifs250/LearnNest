import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./themeProvider";
import { ClerkProvider } from '@/lib/clerk';
import { ToastContainer } from "@/features/shared/components/ui/ToastContainer";
import { ErrorBoundary } from "@/features/shared/components/ErrorBoundary";
import Navbar from "@/features/shared/components/Navbar";
import { Toaster } from 'react-hot-toast';
import ClientInitializer from '@/features/shared/components/ClientInitializer';

const inter = Inter({ subsets: ["latin"] });

// This script will be included directly in the HTML head
// It must execute before anything else to prevent theme flashing
// Improved to properly persist theme across reloads
const themeScript = `
  (function() {
    try {
      // Function to set theme
      function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        // Set transition after theme is initially applied to avoid flash
        setTimeout(function() {
          document.documentElement.classList.add('theme-transition');
        }, 100);
      }

      // Attempt to get theme from cookie first (fastest)
      let theme = null;
      const cookies = document.cookie.split(';');
      for(let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if(cookie.startsWith('theme=')) {
          theme = cookie.substring('theme='.length);
          break;
        }
      }

      // If no cookie, try localStorage
      if(!theme && typeof localStorage !== 'undefined') {
        theme = localStorage.getItem('theme');
      }

      // If theme exists in storage, use it
      if(theme === 'dark' || theme === 'light') {
        setTheme(theme);
      } 
      // Otherwise use system preference
      else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    } catch(e) {
      // Fallback to light theme
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();
`;

export const metadata: Metadata = {
  title: "MāciesTe - Labākā tiešsaistes mācību platforma skolēniem un studentiem",
  description: "MāciesTe ir vadošā tiešsaistes mācīšanās platforma Latvijā, kur skolēni un studenti var atrast kvalificētus pasniedzējus. Saņem individuālas mācību stundas matemātikā, fizikā, ķīmijā, angļu valodā un citos priekšmetos, lai uzlabotu sekmes un sagatavotos eksāmeniem.",
  keywords: 'tiešsaistes mācības, izglītība, privātskolotāji, nodarbības, skolotāji, studenti',
  openGraph: {
    title: 'MāciesTe - Tiešsaistes mācību platforma',
    description: 'Atrodi kvalificētus pasniedzējus un rezervē nodarbības dažādos priekšmetos.',
    url: 'https://macieste.lv',
    siteName: 'MāciesTe',
    locale: 'lv_LV',
    type: 'website',
    images: [
      {
        url: 'https://macieste.lv/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MāciesTe - Tiešsaistes mācību platforma',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html 
        lang="lv" 
        suppressHydrationWarning
        className="js-focus-visible"
        data-js-focus-visible="true"
        style={{ 
          colorScheme: 'light dark',
        }}
      >
        <head>
          {/* Inline theme detection script - must run immediately */}
          <script
            dangerouslySetInnerHTML={{
              __html: themeScript
            }}
          />
          {/* Add CSS for smooth theme transitions after initial load */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .theme-transition,
                .theme-transition *,
                .theme-transition *:before,
                .theme-transition *:after {
                  transition: all 0.2s ease-in-out !important;
                  transition-property: background-color, color, border-color, fill, stroke !important;
                }
              `
            }}
          />
        </head>
        <body className={inter.className}>
          <ThemeProvider>
            <ErrorBoundary>
              <ClientInitializer />
              <Navbar />
              <main className="min-h-screen bg-base-100">
                {children}
              </main>
              <ToastContainer />
            </ErrorBoundary>
            <Toaster position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
