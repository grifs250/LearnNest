# Clerk JWT Template for Supabase Integration

This guide explains how to set up a JWT template in Clerk to authenticate with Supabase using Row Level Security (RLS).

## Step 1: Get the Supabase JWT Secret

1. Log in to your Supabase dashboard
2. Navigate to Project Settings > API
3. Scroll down to find the `JWT Secret` under the API Keys section
4. Copy the JWT Secret (you'll need this for the Clerk JWT template)

## Step 2: Create a JWT Template in Clerk

1. Log in to your Clerk dashboard
2. Navigate to JWT Templates
3. Click "Add New Template"
4. Configure the template:
   - Name: `supabase`
   - Algorithm: `HS256`
   - Signing Key: Paste the Supabase JWT Secret
   - Claims:
     ```json
     {
       "sub": "{{user.id}}",
       "role": "{{user.public_metadata.role}}",
       "email": "{{user.primary_email_address}}",
       "aud": "authenticated"
     }
     ```
   - Leave Token Lifetime as default (15 minutes)

## Step 3: Configure the Middleware

Ensure that your `middleware.ts` file is configured to work with Clerk and pass the JWT to Supabase:

```typescript
import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks(.*)", "/login", "/register", "/profile/setup"],
});
 
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

## Step 4: Set Up Supabase Client with Clerk JWT

### Client-Side

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@clerk/nextjs';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export function useClerkSupabase() {
  const { getToken, isLoaded } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const initSupabase = async () => {
      // Get the Clerk JWT token using the supabase template
      const token = await getToken({ template: 'supabase' });
      
      const client = createBrowserClient<Database>(
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
      setSupabase(client);
      setIsInitialized(true);
    };

    initSupabase();
  }, [getToken, isLoaded]);

  return {
    supabase,
    isInitialized,
    isLoading: !isLoaded || !isInitialized
  };
}
```

### Server-Side

```typescript
import { auth } from '@clerk/nextjs';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const { getToken } = auth();
  
  // Get Clerk JWT token with the Supabase template
  const supabaseToken = await getToken({ template: 'supabase' });
  
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`
        }
      }
    }
  );
}
```

## Step 5: Set Up Row Level Security (RLS) Policies in Supabase

Create policies in Supabase that use the JWT claims from Clerk:

```sql
-- Basic profile policy (allows users to see and edit their own profile)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Example policy for a lessons table
CREATE POLICY "Teachers can create lessons"
ON lessons FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM profiles
    WHERE role = 'teacher'
  )
);

CREATE POLICY "Students can book available lessons"
ON bookings FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM profiles
    WHERE role = 'student'
  )
);
```

## Step 6: Webhook for Syncing Users

Ensure the Clerk webhook is set up to create/update user profiles in Supabase:

1. Configure a Clerk webhook endpoint in your Clerk dashboard pointing to `/api/webhooks/clerk`
2. Set the webhook secret in your environment variables (`CLERK_WEBHOOK_SECRET`)
3. Configure the webhook to listen for `user.created` and `user.updated` events
4. Implement the webhook handler to create/update profiles in Supabase

## Testing the Integration

To test that everything is working correctly:

1. Register a new user through Clerk
2. Check if the user is properly synced to the Supabase `profiles` table
3. Try accessing protected resources with the correct role
4. Verify that RLS policies are being enforced

## Common Issues

- **JWT Token Expired**: Check the token lifetime in the Clerk JWT template
- **Missing Claims**: Ensure all necessary claims are included in the JWT template
- **RLS Policy Failures**: Verify RLS policies are correctly referencing the JWT claims
- **Webhook Issues**: Check webhook logs for any errors during user sync 