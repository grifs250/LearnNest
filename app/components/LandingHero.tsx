'use client';

import { SignUpButtons } from '@/features/auth/components';

/**
 * Hero section of the landing page
 * Contains the main headline, description, and signup buttons
 */
export default function LandingHero() {
  return (
    <header className="hero bg-primary text-primary-content py-20 px-8 text-center flex flex-col items-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Tavs ceļš uz efektīvām tiešsaistes mācībām 🚀</h1>
        <p className="text-xl mb-12 max-w-2xl mx-auto">MāciesTe ir platforma, kas savieno studentus ar profesionāliem pasniedzējiem tiešsaistē. Elastīgs grafiks, individuāla pieeja un garantēta kvalitāte.</p>
        <div className="mt-6">
          <SignUpButtons />
        </div>
      </div>
    </header>
  );
} 