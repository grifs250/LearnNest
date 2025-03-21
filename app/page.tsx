import { Metadata } from "next";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { fetchSubjectsWithLessonCounts } from '@/features/lessons/services/subjectService';
import { jsonLdScriptProps } from 'react-schemaorg';
import { Organization, WebSite, WithContext } from 'schema-dts';

// Import the static component directly
import { LandingHero } from '@/features/landing/components';

// Dynamic imports for non-critical sections
const HowItWorksSection = dynamic(() => import('@/features/landing/components/HowItWorksSection'), {
  ssr: true,
});

const SubjectsSection = dynamic(() => import('@/features/landing/components/SubjectsSection'), {
  ssr: true,
});

const BujSectionWrapper = dynamic(() => import('@/features/landing/components/BujSectionWrapper'), {
  ssr: true,
});

const ContactSection = dynamic(() => import('@/features/landing/components/ContactSection'), {
  ssr: true,
});

// Loading states for better user experience
const SectionSkeleton = () => (
  <div className="w-full py-12">
    <div className="container mx-auto px-4">
      <div className="h-10 w-1/3 bg-base-200 animate-pulse rounded-md mx-auto mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-base-200 animate-pulse rounded-md"></div>
        ))}
      </div>
    </div>
  </div>
);

// Comprehensive metadata for SEO
export const metadata: Metadata = {
  title: "MāciesTe - Labākā Tiešsaistes Mācību Platforma",
  description: "MāciesTe ir platforma, kas savieno studentus ar profesionāliem pasniedzējiem tiešsaistē. Elastīgs grafiks, individuāla pieeja un garantēta kvalitāte.",
  keywords: ["mācību platforma", "tiešsaistes mācības", "privātstundas", "pasniedzēji", "skolotāji", "students", "izglītība", "Latvija"],
  alternates: {
    canonical: "https://macieste.lv",
  },
  openGraph: {
    title: "MāciesTe - Tiešsaistes Mācību Platforma",
    description: "Mācību platforma, kas savieno studentus ar profesionāliem pasniedzējiem. Atrod pasniedzēju, rezervē laiku un mācies.",
    url: "https://macieste.lv",
    siteName: "MāciesTe",
    images: [
      {
        url: "https://macieste.lv/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MāciesTe - Tiešsaistes Mācību Platforma",
      },
    ],
    locale: "lv_LV",
    type: "website",
  },
};

// Use revalidation to avoid re-rendering on every request
export const revalidate = 3600; // Cache for 1 hour

export default async function LandingPage() {
  // Pre-fetch subjects for SSR with lesson counts
  const subjects = await fetchSubjectsWithLessonCounts();

  return (
    <>
      {/* Structured data for SEO - Statically defined with no variable values to prevent hydration issues */}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "MāciesTe",
            "url": "https://macieste.lv",
            "description": "Mācību platforma, kas savieno studentus ar profesionāliem pasniedzējiem tiešsaistē.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://macieste.lv/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
        type="application/ld+json"
      />
      
      <script
        {...jsonLdScriptProps<Organization>({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MāciesTe",
          url: "https://macieste.lv",
          logo: "https://macieste.lv/images/logo.png",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+37120000000",
            contactType: "customer service",
            email: "info@macieste.lv",
            areaServed: "LV",
            availableLanguage: "Latvian",
          },
          address: {
            "@type": "PostalAddress",
            streetAddress: "Brīvības iela 100",
            addressLocality: "Rīga",
            postalCode: "LV-1011",
            addressCountry: "LV",
          },
        })}
      />
      
      {/* Main content - darker background like in kontakti page */}
      <div className="min-h-screen bg-base-200">
        {/* Critical content - load immediately */}
        <LandingHero />
        
        {/* How It Works section first */}
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorksSection />
        </Suspense>
        
        {/* Subjects section follows after How It Works */}
        <Suspense fallback={<SectionSkeleton />}>
          <SubjectsSection subjects={subjects} />
        </Suspense>
        
        {/* Additional sections */}
        <Suspense fallback={<SectionSkeleton />}>
          <BujSectionWrapper />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <ContactSection />
        </Suspense>
      </div>
    </>
  );
}
