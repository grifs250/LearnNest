import { Suspense } from "react";
import { AuthWrapper } from "@/features/auth/components";
import AuthLoading from "./loading";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthWrapper />
    </Suspense>
  );
}
