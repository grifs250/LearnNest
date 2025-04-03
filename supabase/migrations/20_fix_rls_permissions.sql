-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create SELECT policy for own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (
  auth.uid()::text = user_id 
  OR auth.jwt() ->> 'sub' = user_id
);

-- Create UPDATE policy for own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (
  auth.uid()::text = user_id 
  OR auth.jwt() ->> 'sub' = user_id
);

-- Create INSERT policy for own profile
CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid()::text = user_id 
  OR auth.jwt() ->> 'sub' = user_id
);

-- Create a public viewing policy for active profiles
CREATE POLICY "Anyone can view public profiles"
ON profiles FOR SELECT
USING (is_active = true);

-- Create DELETE policy for own profile (soft delete by setting is_active to false)
CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
USING (
  auth.uid()::text = user_id 
  OR auth.jwt() ->> 'sub' = user_id
);

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 