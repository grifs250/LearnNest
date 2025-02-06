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
    <main className="bg-white p-8 ">
      <h1 className="text-2xl font-bold mb-4">Biežāk Uzdotie Jautājumi (BUJ)</h1>
      <div>
        {faqs.map((faq, idx) => (
          <details key={idx} className="mb-4 bg-gray-100 p-4 rounded-md">
            <summary className="cursor-pointer font-semibold">{faq.q}</summary>
            <p className="mt-2 text-gray-700">{faq.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
