import { Metadata } from "next";
import LandingContent from "@/app/landingContent";
import { fetchSubjects } from '@/features/lessons/services/subjectService';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "LearnNest - Mācību Platforma",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-4">
      {/* Logo and hero section */}
      <div className="text-center mb-12">
        <Image 
          src="/logo.svg" 
          alt="MāciesTe Logo" 
          width={150} 
          height={150}
          className="mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold mb-4">MāciesTe</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Atklāj jaunu veidu, kā mācīties. Savienojam studentus ar profesionāliem pasniedzējiem tiešsaistē.
        </p>
      </div>
      
      {/* Role selection buttons */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl">
        <Link 
          href="/register?role=student" 
          className="btn btn-primary btn-lg flex-1 h-auto py-8 text-lg font-bold"
        >
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Es vēlos mācīties
            <span className="text-sm opacity-80 mt-1">Reģistrēties kā students</span>
          </div>
        </Link>
        
        <Link 
          href="/register?role=teacher" 
          className="btn btn-secondary btn-lg flex-1 h-auto py-8 text-lg font-bold"
        >
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Es vēlos pasniegt
            <span className="text-sm opacity-80 mt-1">Reģistrēties kā pasniedzējs</span>
          </div>
        </Link>
      </div>
      
      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl">
        <div className="text-center">
          <div className="bg-base-200 p-4 rounded-full inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Elastīgs grafiks</h3>
          <p>Mācies vai māci sev ērtā laikā, bez stresa un steigas.</p>
        </div>
        
        <div className="text-center">
          <div className="bg-base-200 p-4 rounded-full inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Individuāla pieeja</h3>
          <p>Personalizētas nodarbības ar uzmanību tieši tev.</p>
        </div>
        
        <div className="text-center">
          <div className="bg-base-200 p-4 rounded-full inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Droši maksājumi</h3>
          <p>Vienkārša un droša maksājumu sistēma ar garantiju.</p>
        </div>
      </div>
    </div>
  );
}
