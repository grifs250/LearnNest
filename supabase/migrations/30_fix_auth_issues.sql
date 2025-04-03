-- Fix permissions for authenticated users to insert into profiles

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to create their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow users to update their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow users to view their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow viewing of active profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Anyone can view public profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can view their own profile" ON "public"."profiles";

-- Enable RLS on profiles
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Create new policies using JWT sub claim
-- Policy for viewing any user's profile (public access to active profiles)
CREATE POLICY "allow_public_view_active_profiles" 
ON "public"."profiles" 
FOR SELECT 
USING (is_active = true);

-- Policy for viewing own profile
CREATE POLICY "allow_user_view_own_profile" 
ON "public"."profiles" 
FOR SELECT 
USING (
  auth.uid()::text = user_id OR
  auth.jwt()->>'sub' = user_id
);

-- Policy for creating own profile
CREATE POLICY "allow_user_create_own_profile" 
ON "public"."profiles" 
FOR INSERT 
WITH CHECK (
  auth.uid()::text = user_id OR
  auth.jwt()->>'sub' = user_id
);

-- Policy for updating own profile
CREATE POLICY "allow_user_update_own_profile" 
ON "public"."profiles" 
FOR UPDATE 
USING (
  auth.uid()::text = user_id OR
  auth.jwt()->>'sub' = user_id
);

-- Add logging statement
DO $$
BEGIN
  RAISE NOTICE 'RLS policies for profiles table have been updated successfully';
END $$; 