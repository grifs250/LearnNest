-- Drop existing policies if they exist (so we can recreate them)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid()::text = user_id OR auth.jwt() ->> 'sub' = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid()::text = user_id OR auth.jwt() ->> 'sub' = user_id);

-- Allow anyone to view active, public profiles (especially teacher profiles)
CREATE POLICY "Anyone can view public profiles"
ON profiles FOR SELECT
USING (is_active = true);

-- Allow authenticated users to create their own profile
CREATE POLICY "Authenticated users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid()::text = user_id OR auth.jwt() ->> 'sub' = user_id);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 