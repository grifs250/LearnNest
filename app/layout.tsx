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
        {/* Next.js manages the head element */}
        <body className={inter.className}>
          {/* Theme detection script - executed inline to prevent flash */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    // Attempt to get theme from cookie
                    const cookies = document.cookie.split(';');
                    let theme = null;
                    
                    // Parse cookies for theme
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
                    
                    // Apply theme or use system preference
                    if(theme === 'dark' || theme === 'light') {
                      document.documentElement.setAttribute('data-theme', theme);
                    } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.setAttribute('data-theme', 'dark');
                    } else {
                      document.documentElement.setAttribute('data-theme', 'light');
                    }
                  } catch(e) {
                    // Fallback to light theme
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                })();
              `
            }}
          />
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
