import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
