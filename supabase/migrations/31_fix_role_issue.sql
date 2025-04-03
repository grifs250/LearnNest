-- This migration fixes the "role does not exist" error by changing the approach to authentication
-- We'll use a more direct approach that doesn't rely on specific database roles

-- Drop existing policies
DROP POLICY IF EXISTS "allow_public_view_active_profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "allow_user_view_own_profile" ON "public"."profiles";
DROP POLICY IF EXISTS "allow_user_create_own_profile" ON "public"."profiles";
DROP POLICY IF EXISTS "allow_user_update_own_profile" ON "public"."profiles";

-- Recreate policies without referencing specific database roles

-- Allow anyone to view active profiles
CREATE POLICY "allow_public_view_active_profiles" 
ON "public"."profiles" 
FOR SELECT 
USING (is_active = true);

-- Allow users to view their own profile using JWT sub claim
CREATE POLICY "allow_user_view_own_profile" 
ON "public"."profiles" 
FOR SELECT 
USING (
  (auth.jwt() ->> 'sub')::text = user_id
);

-- Allow users to create their own profile using JWT sub claim
CREATE POLICY "allow_user_create_own_profile" 
ON "public"."profiles" 
FOR INSERT 
WITH CHECK (
  (auth.jwt() ->> 'sub')::text = user_id
);

-- Allow users to update their own profile using JWT sub claim
CREATE POLICY "allow_user_update_own_profile" 
ON "public"."profiles" 
FOR UPDATE 
USING (
  (auth.jwt() ->> 'sub')::text = user_id
); 