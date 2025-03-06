import dynamic from 'next/dynamic';

// Dynamically import BujSection with no SSR requirement
const BujSection = dynamic(() => import('@/features/shared/components/BujSection'), {
  ssr: true
});

/**
 * FAQ section of the landing page
 * This component is pre-renderable on the server
 * SEO-optimized with semantic HTML, proper ARIA attributes,
 * and descriptive headings for search engines
 */
export default function FAQSection() {
  return (
    <section className="py-12 bg-base-100" id="faq" aria-labelledby="faq-title">
      <div className="container mx-auto px-4">
        <h2 id="faq-title" className="text-3xl font-bold text-center mb-10">Biežāk Uzdotie Jautājumi</h2>
        
        <div className="max-w-3xl mx-auto">
          <BujSection />
        </div>
      </div>
    </section>
  );
} 