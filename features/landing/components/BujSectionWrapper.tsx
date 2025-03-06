'use client';

import BujSection from '@/features/shared/components/BujSection';

/**
 * BujSectionWrapper - Landing page wrapper for BUJ (FAQ) section
 * 
 * This component provides consistent styling with other landing page sections
 * while wrapping the reusable BujSection component.
 */
export default function BujSectionWrapper() {
  return (
    <section className="py-12 bg-base-100" id="buj">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Biežāk Uzdotie Jautājumi</h2>
        </div>
        
        <BujSection />
        
        {/* <div className="text-center mt-10">
          <p className="mb-4 text-base-content/80">Neatradi atbildi uz savu jautājumu?</p>
          <a 
            href="/kontakti" 
            className="btn btn-primary"
          >
            Sazinies ar mums
          </a>
        </div> */}
      </div>
    </section>
  );
} 