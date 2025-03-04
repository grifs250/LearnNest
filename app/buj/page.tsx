// app/buj/page.tsx
"use client";

import { useState } from "react";

export default function BujPage() {
  const faqs = [
    {
      q: "Kā reģistrēties?",
      a: "Noklikšķini uz 'Reģistrēties' pogas un aizpildi informāciju.",
    },
    {
      q: "Kā notiek maksājumi?",
      a: "Maksājumus var veikt ar bankas karti vai bankas pārskaitījumu.",
    },
    {
      q: "Vai varu atcelt rezervāciju?",
      a: "Jā, ja tas ir vismaz 24 stundas pirms nodarbības.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details key={idx} className="collapse collapse-arrow bg-base-100 rounded-lg">
            <summary className="collapse-title text-lg font-medium">
              {faq.q}
            </summary>
            <div className="collapse-content">
              <p>{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
