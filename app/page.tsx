import { Metadata } from "next";
import { fetchSubjects } from '@/features/lessons/services/subjectService';
import LandingPageComponent from '@/features/landing/components/LandingPage';

/**
 * SEO metadata for the landing page
 * Properly structured for search engines
 */
export const metadata: Metadata = {
  title: "MāciesTe - Mācību Platforma",
  description: "Mācību platforma, kas savieno studentus ar profesionāliem pasniedzējiem tiešsaistē. Elastīgs grafiks, individuāla pieeja un garantēta kvalitāte.",
  keywords: "mācības, pasniedzēji, studenti, tiešsaiste, izglītība, mācību platforma",
  authors: [{ name: "MāciesTe", url: "https://macieste.lv" }],
  openGraph: {
    title: "MāciesTe - Mācību Platforma",
    description: "Mācību platforma, kas savieno studentus ar profesionāliem pasniedzējiem tiešsaistē.",
    type: "website",
    url: "https://macieste.lv",
    siteName: "MāciesTe",
    locale: "lv_LV",
  },
  alternates: {
    canonical: "https://macieste.lv"
  }
};

// Use revalidation to avoid re-rendering on every request
export const revalidate = 3600; // Cache for 1 hour

/**
 * Main landing page with server-side rendering for SEO
 * Uses the optimized LandingPageComponent for better performance
 */
export default async function LandingPage() {
  // Pre-fetch subjects for SSR
  const subjects = await fetchSubjects();

  return <LandingPageComponent subjects={subjects} />;
}
