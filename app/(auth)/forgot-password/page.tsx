import { ForgotPasswordForm } from "@/features/auth/components";
import { Metadata } from "next";

// Generate metadata
export const metadata: Metadata = {
  title: "Atjaunot paroli | MāciesTe",
  description: "Atjaunot aizmirsto paroli MāciesTe kontam.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto py-10">
      <ForgotPasswordForm />
    </div>
  );
} 