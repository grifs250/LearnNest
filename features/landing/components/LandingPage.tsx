import { Subject } from '@/types/models';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LandingHero from '@/app/components/LandingHero';

// Dynamic imports for non-critical sections with loading fallbacks
const HowItWorksSection = dynamic(() => import('@/app/components/HowItWorksSection'), {
  ssr: true,
  loading: () => <SectionSkeleton />
});

const SubjectsSection = dynamic(() => import('@/app/components/SubjectsSection'), {
  ssr: true,
  loading: () => <SectionSkeleton />
});

const FAQSection = dynamic(() => import('@/app/components/FAQSection'), {
  ssr: true,
  loading: () => <SectionSkeleton />
});

const ContactSection = dynamic(() => import('@/app/components/ContactSection'), {
  ssr: true,
  loading: () => <SectionSkeleton />
});

// Loading skeleton component
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

interface LandingPageProps {
  subjects: Subject[];
}

/**
 * Main landing page component with optimized loading
 * Uses dynamic imports and suspense for better performance
 * Provides SEO-friendly structure with proper semantics
 */
export default function LandingPageComponent({ subjects }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Critical content - load immediately */}
      <LandingHero />
      
      {/* Non-critical content - load on demand with suspense */}
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorksSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <SubjectsSection subjects={subjects} />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <FAQSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <ContactSection />
      </Suspense>
    </div>
  );
} 