import { SignUpForm } from "@/features/auth/components";
import { extractRoleFromUrl } from "@/lib/utils/url-helpers";
import { Metadata } from "next";

type RegisterPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// Generate metadata
export const metadata: Metadata = {
  title: "Reģistrēties | MāciesTe",
  description: "Pievienojieties MāciesTe platformai, lai sāktu mācīties vai mācīt citus.",
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  // Get role from URL parameters
  const role = extractRoleFromUrl(searchParams);

  return (
    <div className="container mx-auto py-10">
      <SignUpForm role={role} />
    </div>
  );
}