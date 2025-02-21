import { Metadata } from "next";
import LandingContent from "@/app/landingContent";
import { fetchSubjects } from '@/features/lessons/services/subjectService';

export const metadata: Metadata = {
  title: "LearnNest - Mācību Platforma",
};

export default async function HomePage() {
  const subjects = await fetchSubjects();
  return <LandingContent subjects={subjects} />;
}
