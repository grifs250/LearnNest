'use client';

import { SignUpButtons } from '@/features/auth/components';

/**
 * Hero section of the landing page
 * Contains the main headline, description, and signup buttons
 * Using DaisyUI components for consistent styling in both light and dark modes
 */
export default function LandingHero() {
  return (
    <div className="hero bg-primary text-primary-content min-h-[70vh]">
      <div className="hero-content text-center py-16 px-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Tavs ceļš uz efektīvām tiešsaistes mācībām 🚀</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">MāciesTe ir platforma, kas savieno studentus ar profesionāliem pasniedzējiem tiešsaistē. Elastīgs grafiks, individuāla pieeja un garantēta kvalitāte.</p>
          <div className="mt-6">
            <SignUpButtons />
          </div>
        </div>
      </div>
    </div>
  );
} 