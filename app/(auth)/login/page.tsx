import { AuthWrapper } from "@/features/auth/components";
import { AuthMode } from "@/features/auth/types";

export default function LoginPage() {
  return <AuthWrapper initialMode={"login" as AuthMode} />;
} 