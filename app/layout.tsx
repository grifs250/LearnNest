import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./themeProvider";
import SupabaseProvider from "@/lib/providers/SupabaseProvider";
import { ToastContainer } from "@/features/shared/components/ui/ToastContainer";
import { ErrorBoundary } from "@/features/shared/components/ErrorBoundary";
import Navbar from "@/features/shared/components/Navbar";
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from '@/lib/providers/SessionProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learn Nest - Online Learning Platform",
  description: "Connect with expert teachers for private lessons",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lv">
      <body className={inter.className}>
        <SupabaseProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <ToastContainer />
            </ErrorBoundary>
          </ThemeProvider>
          <Toaster position="top-center" />
        </SupabaseProvider>
      </body>
    </html>
  );
}
