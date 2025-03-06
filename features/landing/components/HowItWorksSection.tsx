'use client';

/**
 * How It Works section of the landing page
 * Displays a step-by-step overview of the platform usage
 * ID structure preserved to ensure compatibility with SmoothScrollLink
 */
export default function HowItWorksSection() {
  return (
    <section className="py-12" id="how-it-works">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Kā tas darbojas? 🤔</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4" aria-hidden="true">🔍</div>
              <h3 className="card-title">1. Atrodi</h3>
              <p>Atrodi sev piemērotu pasniedzēju un priekšmetu, kas atbilst tavām vajadzībām.</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4" aria-hidden="true">📅</div>
              <h3 className="card-title">2. Rezervē</h3>
              <p>Izvēlies ērtāko laiku un rezervē nodarbību tiešsaistē vai klātienē.</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4" aria-hidden="true">💳</div>
              <h3 className="card-title">3. Samaksā</h3>
              <p>Veic drošu maksājumu tiešsaistē ar sev ērtāko maksājuma metodi.</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4" aria-hidden="true">📚</div>
              <h3 className="card-title">4. Mācies</h3>
              <p>Piedalies nodarbībā un saņem individuālu pieeju savām vajadzībām.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 