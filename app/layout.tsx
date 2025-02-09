import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ProfileGuard from "@/components/ProfileGuard";
import { NavbarProvider } from '@/contexts/NavbarContext';

export const metadata: Metadata = {
  title: "LearnNest",
  description: "Tavs ceļš uz tiešsaistes mācībām",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <NavbarProvider>
          <Navbar />
          <ProfileGuard>
            {children}
          </ProfileGuard>
        </NavbarProvider>
      </body>
    </html>
  );
}
