/**
 * BujSection - SEO-friendly Frequently Asked Questions component
 * 
 * This component implements a list of FAQs using semantic HTML and
 * ensures the first question is open by default for better SEO.
 * Using the <details> and <summary> elements allows for an accessible 
 * accordion without JavaScript/state.
 */

// Define the component as a Server Component for better SEO performance
const BujSection = () => {
  // Common FAQs in Latvian
  const faqs = [
    {
      question: "Kā es varu sākt mācīties?",
      answer: "Lai sāktu mācīties, reģistrējies platformā, izvēlies sev piemērotu pasniedzēju un priekšmetu, rezervē laiku un apmaksā nodarbību."
    },
    {
      question: "Vai es varu atcelt nodarbību?",
      answer: "Jā, nodarbību var atcelt vismaz 24 stundas pirms plānotā sākuma laika, saņemot pilnu atmaksu."
    },
    {
      question: "Kā notiek apmaksa?",
      answer: "Apmaksa notiek tiešsaistē caur mūsu drošo maksājumu sistēmu, izmantojot bankas karti vai internetbanku."
    },
    {
      question: "Vai es varu kļūt par pasniedzēju?",
      answer: "Jā, reģistrējies kā pasniedzējs, aizpildi profilu un sāc piedāvāt savas nodarbības pēc verifikācijas."
    },
    {
      question: "Cik maksā nodarbības?",
      answer: "Katra pasniedzēja cenas ir individuālas. Tās ir redzamas pasniedzēja profilā un var atšķirties atkarībā no priekšmeta un nodarbības ilguma."
    },
    {
      question: "Kā notiek tiešsaistes nodarbības?",
      answer: "Tiešsaistes nodarbības notiek platformā iebūvētajā video zvanu rīkā. Jums būs nepieciešams dators vai viedierīce ar interneta pieslēgumu, mikrofonu un kameru."
    },
    {
      question: "Kādi ir platformas lietošanas noteikumi?",
      answer: "Platformas lietošanas noteikumi ir atrodami mūsu vietnes sadaļā 'Lietošanas Noteikumi'. Tie ietver informāciju par lietotāju tiesībām un pienākumiem, maksājumiem, un citu svarīgu informāciju."
    },
    {
      question: "Kas notiek, ja rodas tehniskas problēmas nodarbības laikā?",
      answer: "Ja rodas tehniskas problēmas, mēģiniet atjaunot savienojumu. Ja problēmas turpinās, sazinieties ar pasniedzēju vai mūsu atbalsta dienestu. Ja nodarbība nevar notikt tehnisku iemeslu dēļ, tiek piedāvāta tās pārcelšana vai naudas atmaksa."
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <details 
          key={index} 
          className="group bg-white shadow rounded-lg overflow-hidden"
          // open={index === 0} // First item open by default for SEO
        >
          <summary className="flex justify-between items-center px-6 py-4 bg-base-200 cursor-pointer list-none">
            <h3 className="text-lg font-medium">{faq.question}</h3>
            <div className="transition-transform group-open:rotate-180">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </summary>
          <div className="p-6">
            <p>{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
};

export default BujSection; 