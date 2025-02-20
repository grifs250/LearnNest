import { AuthWrapper } from "@/features/auth/components";
import { AuthMode } from "@/features/auth/types";

export default function RegisterPage() {
  return <AuthWrapper initialMode={"signup" as AuthMode} />;
} 