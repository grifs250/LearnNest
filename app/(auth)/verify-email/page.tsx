import { Suspense } from "react";
import { EmailVerification } from "@/features/auth/components";
import AuthLoading from "../loading";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <EmailVerification />
    </Suspense>
  );
} 