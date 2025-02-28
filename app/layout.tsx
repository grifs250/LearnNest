import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./themeProvider";
import { ClerkProvider } from '@clerk/nextjs';
import { ToastContainer } from "@/features/shared/components/ui/ToastContainer";
import { ErrorBoundary } from "@/features/shared/components/ErrorBoundary";
import Navbar from "@/features/shared/components/Navbar";
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MāciesTe - Labākā tiešsaistes mācību platforma skolēniem un studentiem",
  description: "MāciesTe ir vadošā tiešsaistes mācīšanās platforma Latvijā, kur skolēni un studenti var atrast kvalificētus pasniedzējus. Saņem individuālas mācību stundas matemātikā, fizikā, ķīmijā, angļu valodā un citos priekšmetos, lai uzlabotu sekmes un sagatavotos eksāmeniem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="lv">
        <body className={inter.className}>
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
        </body>
      </html>
    </ClerkProvider>
  );
}
