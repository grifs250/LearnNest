-- Drop existing policies
DROP POLICY IF EXISTS "allow_public_view_active_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_user_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_user_create_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_user_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to create their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow viewing of active profiles" ON profiles;

-- Public policy for viewing active profiles
CREATE POLICY "View active profiles" ON profiles 
FOR SELECT USING (is_active = true);

-- Policy for users to view their own profiles
CREATE POLICY "Users view own profile" ON profiles 
FOR SELECT USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = user_id);

-- Policy for users to create their own profile
CREATE POLICY "Users create own profile" ON profiles 
FOR INSERT WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = user_id);

-- Policy for users to update their own profile
CREATE POLICY "Users update own profile" ON profiles 
FOR UPDATE USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'sub') = user_id);

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 