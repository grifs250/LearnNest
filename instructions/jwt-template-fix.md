# JWT Template Fix

## Current Template (Incorrect)
```json
{
  "aud": "authenticated",
  "role": "authenticated",
  "user_metadata": {
    "role": "{{user.public_metadata.role || 'student'}}",
    "email": "{{user.primary_email_address}}"
  }
}
```

## Problem Explanation
The current JWT template has several issues:

1. **Nested role**: The `role` claim is nested inside `user_metadata`, but Supabase RLS policies expect it at the top level
2. **Duplicate role**: There's both a static `role: "authenticated"` and a dynamic role in `user_metadata`
3. **Incorrect claim structure**: Supabase specifically looks for the claims `sub` and `role` at the top level

## Correct Template
```json
{
  "aud": "authenticated",
  "role": "{{user.public_metadata.role || 'student'}}",
  "user_id": "{{user.id}}",
  "email": "{{user.primary_email_address}}"
}
```

## Key Differences
1. The `sub` claim is added with the user's ID - this is critical for RLS policies
2. The `role` claim is moved to the top level (not nested in user_metadata)
3. The duplicate static `role` value is removed
4. The `email` claim is moved to the top level

## How This Fixes Permission Issues
Supabase RLS policies are checking for:
1. `auth.jwt() ->> 'sub' = user_id` - This checks if the JWT's sub claim matches the user_id column
2. The role claim is used for role-based policies

Without the correct structure, these checks will fail even if the JWT is valid.

## Steps to Update
1. Go to Clerk Dashboard > JWT Templates
2. Select your 'supabase' template
3. Replace the entire JSON with the corrected version above
4. Save changes

After updating, test with the `/debug/jwt` and `/debug/db` pages to verify it's working correctly. 

## Issue with Reserved Claims
According to Clerk, you cannot use the reserved claim `sub` in your template. Clerk automatically includes this claim with the user's ID.

## RLS Policy Check
Make sure your RLS policies are set up to check:
```sql
auth.jwt() ->> 'sub' = user_id   -- For the built-in sub claim from Clerk
OR 
auth.jwt() ->> 'user_id' = user_id   -- For your custom user_id claim
```

## Redirect Issue
The redirect to `/profile/setup` likely happens because:

1. The middleware checks if a user has completed profile setup
2. If not, it redirects to the setup page

Check your middleware.ts file to see this logic. The pattern is usually:

```typescript
// Example middleware pattern that might be causing the issue
export default authMiddleware({
  publicRoutes: ['/login', '/register', /* other public routes */],
  afterAuth(auth, req, evt) {
    // Auth check
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    
    // Profile check - this is likely causing your redirect
    if (auth.userId && 
        !req.url.includes('/profile/setup') && 
        /* some condition to check if profile needs setup */) {
      return NextResponse.redirect(new URL('/profile/setup', req.url));
    }
  }
});
``` 