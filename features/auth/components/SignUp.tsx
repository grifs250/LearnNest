import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/db';

const SignUp = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const user = data.user;

    // Store user role in the database
    const { data: roleData, error: roleError } = await supabase
      .from('profiles')
      .insert([{ id: user!.id, role }]);

    if (roleError) {
      setError(roleError.message);
      return;
    }

    // Redirect to the profile page or dashboard
    router.push('/profile');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <form onSubmit={handleSignUp} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Reģistrēties</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2">E-pasts</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Parole</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Loma</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
            className="select select-bordered w-full"
          >
            <option value="student">Students</option>
            <option value="teacher">Pasniedzējs</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-full">Reģistrēties</button>
      </form>
    </div>
  );
};

export default SignUp; 