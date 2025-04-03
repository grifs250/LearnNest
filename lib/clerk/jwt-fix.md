# Fix for JWT and Profile Setup Issues

## Problem: Permission denied for table profiles

When trying to create or update your profile, you encounter a "permission denied for table profiles" error.

## Root Cause

1. **JWT Template Issue**: Your Clerk JWT template doesn't have the correct claims structure for Supabase RLS policies
2. **Profile Setup Workflow**: The `ProfileSetupForm` component is trying to create/update a profile in Supabase, but the JWT token doesn't contain the right claims

## Solution

### 1. Fix your JWT Template

Go to Clerk Dashboard > JWT Templates > "supabase" template and use this structure:

```json
{
  "aud": "authenticated",
  "role": "{{user.public_metadata.role || 'student'}}",
  "user_id": "{{user.id}}"
}
```

**Key points:**
- Keep "aud" set to "authenticated" for Supabase RLS
- Use a top-level "role" claim (not nested in user_metadata)
- Add "user_id" claim with the user's ID
- Don't use "sub" as it's a reserved claim (Clerk adds this automatically)

### 2. Update RLS Policies

Your Supabase RLS policies need to check for both auth.uid() and the JWT claims. The policy in your migration file looks correct, but ensure you run the migration:

```sql
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (
  auth.uid()::text = user_id 
  OR auth.jwt() ->> 'sub' = user_id
  OR auth.jwt() ->> 'user_id' = user_id
);
```

### 3. Understanding the Redirect Flow

The redirect to `/profile/setup` happens because:

1. When you log in, your Clerk user has `profile_needs_setup: true` in metadata
2. Your middleware checks this and redirects you to setup
3. When you try to save the profile in `ProfileSetupForm`, it fails with permission denied
4. After the error, you're still marked as needing setup

Look at line 271-370 in `ProfileSetupForm.tsx` - this is where the profile is saved to Supabase.

### 4. Testing After Fixes

After updating your JWT template:

1. Log out and log back in
2. Go to `/profile/setup`
3. Fill out the form and submit
4. The form should successfully save to Supabase without permission errors
5. You should be redirected to either `/student` or `/teacher` based on your role

If you still encounter issues, check your browser console for error details.

### Debugging Tip

Add this temporary code to `ProfileSetupForm.tsx` at the beginning of the `handleSubmit` function to log the token:

```javascript
// Debug JWT
console.log("JWT Token:", await getToken({ template: 'supabase' }));
```

This will help you confirm that your token has the correct structure. 