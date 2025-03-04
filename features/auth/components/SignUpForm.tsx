import { useSignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUpForm() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState("student"); // Default role
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Get role from URL parameters
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "teacher" || roleParam === "student") {
      setRole(roleParam);
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }
    
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Start the sign-up process
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName
      });
      
      // After sign-up, add metadata for role
      const { createdSessionId } = await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      
      if (createdSessionId) {
        // Store the role to be used after email verification
        localStorage.setItem('userRole', role);
        
        // Redirect to verification
        router.push('/verify-email');
      }
    } catch (err) {
      console.error("Error during sign up:", err);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-base-200 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {role === "teacher" ? "Reģistrēties kā pasniedzējam" : "Reģistrēties kā studentam"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Vārds</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Uzvārds</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">E-pasts</span>
          </label>
          <input
            type="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Parole</span>
          </label>
          <input
            type="password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control mt-6">
          <button type="submit" className={`btn ${role === 'teacher' ? 'btn-secondary' : 'btn-primary'} w-full`}>
            Reģistrēties
          </button>
        </div>
      </form>
    </div>
  );
} 