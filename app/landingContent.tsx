import { CourseSections } from "@/features/lessons/components";
import BujPage from "./buj/page";
import Link from "next/link";
import { AuthButtons } from "@/features/auth/components";
import { fetchCategoriesWithSubjects } from '@/features/lessons/services/subjectService';
import { Subject, Category } from '@/features/lessons/types';
import Head from 'next/head';

// Define the props interface for LandingContent
interface LandingContentProps {
  subjects: Subject[];
}

export default async function LandingContent({ subjects }: LandingContentProps) {
  const categoriesWithSubjects = await fetchCategoriesWithSubjects();

  return (
    <>
      <Head>
        <title>LearnNest - Your Path to Effective Online Learning</title>
        <meta name="description" content="Join LearnNest to connect with teachers and enhance your learning experience. Sign up today!" />
        <meta name="keywords" content="online learning, tutoring, education, courses, teachers" />
        <meta name="author" content="LearnNest" />
      </Head>
      <main className="bg-base-200 min-h-screen">
        {/* Hero Section */}
        <header className="hero bg-primary text-primary-content py-16 px-8 text-center flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold mb-4">Tavs ceļš uz efektīvām tiešsaistes mācībām 🚀</h1>
          <AuthButtons />
        </header>

        {/* How It Works Section */}
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

        {/* Categories and Subjects Section */}
        <section className="py-16 px-8 bg-base-200">
          {categoriesWithSubjects.map(item => {
            const { category, subjects } = item;
            return (
              <div key={category.id} className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8">{category.name}</h2>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subjects && subjects.length > 0 ? (
                    subjects.map(subject => (
                      <div key={subject.id} className="card bg-base-100 shadow-lg p-6 transition-all opacity-50 pointer-events-none">
                        <div className="card-body p-0">
                          <h4 className="font-semibold text-lg mb-2">{subject.name}</h4>
                          <div className="flex items-center text-gray-400">
                            <span className="mr-2">ℹ️</span>
                            <span>Nav pieejamu nodarbību</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nav pieejamu priekšmetu šajā kategorijā</p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* BUJ (FAQ) */}
        <div id="buj">
          <BujPage />
        </div>

        {/* Kontakti */}
        <section id="contact" className="py-16 px-8 bg-base-200">
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
    </>
  );
}