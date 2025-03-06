import { SignInForm } from "@/features/auth/components";
import { Metadata } from "next";

// Generate metadata
export const metadata: Metadata = {
  title: "Ieiet | MāciesTe",
  description: "Ieiet savā MāciesTe kontā, lai piekļūtu mācību materiāliem un nodarbībām.",
};

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10">
      <SignInForm />
    </div>
  );
} 