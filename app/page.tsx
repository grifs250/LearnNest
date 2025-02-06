import { Metadata } from "next";
import LandingContent from "@/app/landingContent";

export const metadata: Metadata = {
  title: "LearnNest - Mācību Platforma",
};

export default async function HomePage() {
  return await LandingContent();
}
