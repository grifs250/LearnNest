# Clerk JWT Token Setup Guide for Supabase

This guide provides step-by-step instructions for correctly setting up Clerk JWT tokens to work with Supabase Row Level Security (RLS) policies.

## Problem: Permission Denied for Table Profiles

If you're encountering the error `permission denied for table profiles` when trying to create or update user profiles, it's likely due to one of these issues:

1. JWT token not being correctly passed to Supabase
2. JWT claims not matching your Supabase RLS policies
3. Incorrect setup of the JWT template in Clerk

## Solution

### Step 1: Configure Clerk JWT Template

1. Log in to your [Clerk Dashboard](https://dashboard.clerk.dev)
2. Navigate to **JWT Templates** in the left sidebar
3. Create a new template named `supabase` or edit the existing one
4. Set the following configuration:
   - **Algorithm**: HS256
   - **Signing Key**: Paste your Supabase JWT Secret (from Supabase Dashboard > Settings > API)
   - **Claims**:
   ```json
   {
     "sub": "{{user.id}}",
     "role": "{{user.unsafeMetadata.role}}",
     "email": "{{user.primaryEmailAddress}}",
     "aud": "authenticated"
   }
   ```
   - **Token lifetime**: 15 minutes (default)

> **IMPORTANT**: Make sure to use `unsafeMetadata` for the role claim, not `publicMetadata` (unless you've set up your app to use publicMetadata instead)

### Step 2: Verify RLS Policies in Supabase

Run the following SQL in your Supabase SQL Editor to update your RLS policies:

```sql
-- Drop existing policies first
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

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Step 3: Update Your Client-Side Code

When making requests to Supabase in client components, make sure to get the JWT token from Clerk and pass it to Supabase:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

export function YourComponent() {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const initSupabase = async () => {
      // Get Clerk JWT token using the supabase template
      const token = await getToken({ template: 'supabase' });
      
      // Create Supabase client with the token
      const supabaseClient = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      
      setSupabase(supabaseClient);
    };
    
    initSupabase();
  }, [getToken]);

  // Use supabase client in your component...
}
```

### Step 4: Verify JWT with Debug Page

To troubleshoot JWT issues, visit `/debug/jwt` in your application to view:

- The JWT token claims
- Validation status
- Any issues with your JWT configuration

## Common Issues and Solutions

### Issue 1: Role Not Being Included in JWT

If the `role` claim is missing from your JWT token:
- Make sure you've updated the user's `unsafeMetadata` with the role
- Verify your JWT template uses `{{user.unsafeMetadata.role}}`

### Issue 2: User ID Format Mismatch

If the JWT `sub` claim doesn't match the `user_id` in your profiles table:
- Ensure you're using the exact Clerk User ID (usually starts with `user_`)
- Check that the format matches between the database and the JWT token

### Issue 3: Invalid Token or No Authorization Header

If Supabase returns 401 Unauthorized:
- Verify the token is being correctly passed in the Authorization header
- Check that your Supabase JWT secret matches what's in your Clerk JWT template

## Debugging Tools

Use the built-in debugging tools to troubleshoot:

1. Visit `/debug/jwt` to inspect your JWT token
2. Check the Network tab in your browser's developer tools to see the request headers
3. Look at Supabase logs for RLS policy rejections
4. Monitor your application logs for JWT-related errors

## Need Further Help?

If you're still experiencing issues:
1. Check if the webhook is correctly creating user profiles in Supabase
2. Verify your ngrok tunnel is forwarding webhook events properly
3. Look for any errors in your server logs related to JWT validation 