import { adminDb } from "@/lib/firebaseAdmin"; // Server-side Firestore
import CourseSections from "@/components/CourseSections";
import BujPage from "./buj/page";
import Link from "next/link";

async function fetchCourses(collectionName: string) {
  const snapshot = await adminDb.collection(collectionName).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export default async function LandingContent() {
  // Fetch courses from Firestore (Server-side for SEO)
  const subjects = await fetchCourses("subjects");
  const languages = await fetchCourses("languages");
  const itCourses = await fetchCourses("itCourses");

  return (
    <main className="bg-base-200 min-h-screen">
      {/* Hero Section */}
      <section className="hero bg-primary text-primary-content p-10 text-center flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold mb-4">Tavs ceļš uz efektīvām tiešsaistes mācībām 🚀</h1>
        <p className="text-xl">Izmēģini LearnNest jau šodien!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a className="btn btn-accent w-full sm:w-auto" href="/auth?role=skolēns">
            👩‍🎓 Reģistrēties kā Skolēns
          </a>
          <a className="btn btn-secondary w-full sm:w-auto" href="/auth?role=pasniedzējs">
            👨‍🏫 Reģistrēties kā Pasniedzējs
          </a>
        </div>
      </section>

      {/* Kā tas strādā? */}
      <section id="how-it-works" className="py-16 px-8 bg-base-100">
        <h2 className="text-2xl font-bold mb-8 text-center">Kā tas strādā?</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: "🔎", title: "Izvēlies, ko vēlies mācīties", description: "Pārlūko mācību priekšmetus, valodu kursus vai IT kursus" },
            { icon: "👨‍🏫", title: "Izvēlies pasniedzēju", description: "Izlasi atsauksmes un apskati pasniedzēja prasmes" },
            { icon: "📅", title: "Rezervē nodarbību", description: "Atrodi sev ērtāko laiku un apmaksā nodarbību" },
            { icon: "💻", title: "Uzsāc mācības", description: "Ienāc iebūvētā video zvanā un sāc savu mācību pieredzi" },
          ].map((step, i) => (
            <div key={i} className="card bg-base-200 shadow hover:shadow-lg transition text-center p-6">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clickable Course Sections */}
      <CourseSections subjects={subjects} languages={languages} itCourses={itCourses} />

      {/* BUJ (FAQ) */}
      <div id="buj">
        <BujPage />
      </div>

      {/* Kontakti */}
      <section id="contact" className="py-16 px-8 bg-base-100">
        <h2 className="text-2xl font-bold mb-8 text-center">Kontakti</h2>
        <div className="max-w-2xl mx-auto text-center">
          <p className="mb-4">E-pasts: info@learnnest.com</p>
          <p className="mb-4">Tālrunis: +371 12345678</p>
          <p>Adrese: Rīga, Latvija</p>
          <p className="mt-4">
            <a href="/privacy-policy" className="text-blue-500 underline">
              📜 Privātuma politika
            </a>
          </p>
          <p className="mt-2">
            <a href="/terms-of-service" className="text-blue-500 underline">
              📖 Lietošanas noteikumi
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
