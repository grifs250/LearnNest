"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types/database.types";
import { ArrowRight, Check, X, Mail } from "lucide-react";

interface SignUpFormProps {
  role?: 'teacher' | 'student';
}

export default function SignUpForm({ role: initialRole }: SignUpFormProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(initialRole || "student"); // Default role
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Set role from initial prop when component mounts
  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);
  
  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      return false;
    }
    setPasswordMatchError(false);
    return true;
  };
  
  // Check password strength on change
  useEffect(() => {
    // Simple password strength check
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }
    
    // Validate passwords match
    if (!validatePasswords()) {
      setError("Paroles nesakrīt. Lūdzu, pārbaudiet ievadītās paroles.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Store the role in localStorage for the verification page
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', role);
      }
      
      // Start the sign-up process
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: {
          role: role
        }
      });
      
      // Prepare email verification
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      
      // Redirect directly to Clerk's built-in verification page
      router.push(`/verify-code`);
    } catch (err: any) {
      console.error("Error during sign up:", err);
      setError(err.message || "Radās kļūda reģistrācijas laikā. Lūdzu, mēģiniet vēlreiz.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Role-specific styling
  const roleIcon = role === "teacher" ? "👨‍🏫" : "👨‍🎓";
  const roleColor = role === "teacher" ? "btn-secondary" : "btn-accent";
  const roleTextColor = role === "teacher" ? "text-secondary" : "text-accent";
  const roleBgColor = role === "teacher" ? "bg-secondary" : "bg-accent";
  
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-base-300 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-2 text-center flex items-center justify-center gap-2">
        <span className="text-3xl">{roleIcon}</span> 
        <span>Reģistrēties kā {role === "teacher" ? "pasniedzējam" : "studentam"}</span>
      </h2>
      
      {/* Role selector */}
      <div className="relative mb-8 mt-6">
        <div className="bg-base-200 h-14 rounded-full flex items-center p-1">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 transition-all ${
              role === "student" ? "bg-base-100 shadow-md" : "hover:bg-base-300/50"
            }`}
          >
            <span>👨‍🎓</span>
            <span className={role === "student" ? "font-medium" : ""}>Skolēns</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 transition-all ${
              role === "teacher" ? "bg-base-100 shadow-md" : "hover:bg-base-300/50"
            }`}
          >
            <span>👨‍🏫</span>
            <span className={role === "teacher" ? "font-medium" : ""}>Pasniedzējs</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error mb-6 shadow-md">
          <X className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        <button 
          type="button"
          onClick={() => signUp?.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/profile/setup",
          })}
          className="btn btn-outline w-full gap-2 hover:bg-base-200"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          <span>Turpināt ar Google</span>
        </button>
        
        <button 
          type="button"
          onClick={() => signUp?.authenticateWithRedirect({
            strategy: "oauth_apple",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/profile/setup",
          })}
          className="btn btn-outline w-full gap-2 hover:bg-base-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 384 512">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
          </svg>
          <span>Turpināt ar Apple</span>
        </button>
      </div>
      
      <div className="divider text-sm text-base-content/60">vai reģistrējieties ar e-pastu</div>
      
      {/* Email form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">E-pasts</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">
              <Mail size={18} />
            </span>
            <input
              type="email"
              className="input input-bordered w-full pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jusu.epasts@piemers.lv"
              required
            />
          </div>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Parole</span>
          </label>
          <input
            type="password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Vismaz 8 simboli"
          />
          
          {/* Password strength indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full ${
                      passwordStrength >= level
                        ? passwordStrength >= 3
                          ? "bg-success"
                          : passwordStrength >= 2
                          ? "bg-warning"
                          : "bg-error"
                        : "bg-base-300"
                    }`}
                  ></div>
                ))}
              </div>
              <span className="label-text-alt mt-1 inline-block">
                {passwordStrength === 0 && "Ļoti vāja parole"}
                {passwordStrength === 1 && "Vāja parole"}
                {passwordStrength === 2 && "Vidēji droša parole"}
                {passwordStrength === 3 && "Laba parole"}
                {passwordStrength === 4 && "Ļoti droša parole"}
              </span>
            </div>
          )}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Apstiprināt paroli</span>
          </label>
          <input
            type="password"
            className={`input input-bordered w-full ${passwordMatchError ? "input-error" : ""}`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordMatchError) validatePasswords();
            }}
            required
            placeholder="Ievadiet paroli vēlreiz"
          />
          {passwordMatchError && (
            <span className="label-text-alt text-error mt-1">Paroles nesakrīt</span>
          )}
        </div>
        
        {/* Add Clerk CAPTCHA element here */}
        <div id="clerk-captcha" className="mt-4"></div>
        
        <button
          type="submit"
          className={`btn ${roleColor} w-full mt-6`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              <span>Lūdzu, uzgaidiet...</span>
            </>
          ) : (
            <>
              <span>Reģistrēties</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
} 