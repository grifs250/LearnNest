/**
 * Contact section of the landing page
 * Simple server component that displays contact information
 */
export default function ContactSection() {
  const currentYear = new Date().getFullYear();
  
  return (
    <section className="py-12 bg-base-200" id="kontakti">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Kontakti</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-base-100 shadow-lg rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-6 border-b md:border-b-0 md:border-r border-base-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">E-pasts</h3>
                <a href="mailto:info@macieste.lv" className="text-primary hover:underline">info@macieste.lv</a>
              </div>
              
              <div className="p-6 border-b md:border-b-0 md:border-r border-base-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Tālrunis</h3>
                <a href="tel:+37120000000" className="text-secondary hover:underline">+371 2000 0000</a>
              </div>
              
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Adrese</h3>
                <p className="text-base-content">Brīvības iela 100, Rīga, LV-1011</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center text-sm text-base-content/70">
            <p>© {currentYear} MāciesTe | <a href="/privacy" className="link link-hover">Privātuma Politika</a> | <a href="/terms" className="link link-hover">Lietošanas Noteikumi</a></p>
          </div>
        </div>
      </div>
    </section>
  );
} 