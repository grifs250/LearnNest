'use client';

import { useState } from 'react';

/**
 * BujSection - Frequently Asked Questions component using DaisyUI 
 * 
 * This component implements a list of FAQs with enhanced UI
 * featuring smooth animations, better spacing, and visual indicators.
 */
const BujSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

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
    <div className="max-w-3xl mx-auto">
      {faqs.map((faq, index) => (
        <div 
          key={index} 
          className={`group mb-4 rounded-xl border border-base-300 overflow-hidden transition-all duration-300 ${
            activeIndex === index ? 'shadow-md' : 'hover:shadow-sm'
          }`}
        >
          <button
            className="w-full text-left px-6 py-4 bg-base-200 flex justify-between items-center"
            onClick={() => setActiveIndex(index === activeIndex ? -1 : index)}
            aria-expanded={activeIndex === index}
            aria-controls={`faq-content-${index}`}
          >
            <span className="text-lg font-medium">{faq.question}</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-base-content transition-all duration-300 ${
              activeIndex === index ? 'bg-primary text-primary-content transform rotate-180' : 'bg-base-300'
            }`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </button>
          
          <div 
            id={`faq-content-${index}`}
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 py-5 bg-base-100 border-t border-base-300">
              <p className="leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BujSection; 