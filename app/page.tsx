import { Metadata } from "next";
import LandingContent from "@/app/landingContent";
import { fetchSubjects } from '@/features/lessons/services/subjectService';
import { Subject } from '@/types/models';

export const metadata: Metadata = {
  title: "LearnNest - Mācību Platforma",
  description: "Mācību platforma, kas savieno studentus ar profesionāliem pasniedzējiem tiešsaistē.",
};

export default async function LandingPage() {
  // Fetch subjects from Supabase
  const subjects = await fetchSubjects();
  
  return <LandingContent subjects={subjects} />;
}
