# Authentication & Profile Onboarding Flow Documentation

## Overview
This document describes the complete authentication and profile onboarding flow for the MāciesTe platform. The system uses Clerk for authentication and Supabase for user profile management.

## Authentication Flow

### 1. Initial Sign Up/In
- Users can sign up/in through Clerk's authentication system
- Available routes:
  - `/login` - Sign in page
  - `/register` - Sign up page
  - `/sso-callback` - SSO callback handler

### 2. Clerk Webhook Integration
When a user signs up, Clerk triggers a webhook (`/api/webhooks/clerk/route.ts`) that:
1. Creates a new profile in Supabase with:
   - Default role: 'student'
   - `profile_needs_setup: true`
   - `profile_completed: false`
   - Basic user info (email, name, avatar)

### 3. JWT Handling
- Clerk provides JWT tokens for authentication
- These tokens are used for Supabase RLS policies
- No direct Supabase auth is used

## Profile Onboarding Flow

### 1. Initial Redirect
- `ProfileRedirectCheck` component checks user's profile status
- Excluded paths:
  ```typescript
  const excludedPaths = [
    '/profile/setup',
    '/login',
    '/register',
    '/verify-email',
    '/verify-code',
    '/api',
    '/buj',
    '/',
    '/profiles',
    '/subjects'
  ];
  ```

### 2. Profile Setup Process
The setup process consists of 4 steps:

#### Step 1: Role Selection
- Users choose between 'student' or 'teacher' role
- Role is stored in:
  - Clerk user metadata
  - Supabase profile
  - Local storage (backup)

#### Step 2: Basic Information
Common fields for both roles:
- Full name
- Bio
- Age
- Phone
- Languages

#### Step 3: Role-Specific Information
**For Students:**
- Learning goals (array)

**For Teachers:**
- Hourly rate
- Education (array)
- Experience (array)
- Specializations (array)

#### Step 4: Completion
- Profile is marked as complete
- User is redirected to role-specific dashboard

### 3. Data Storage
Profile data is stored in:
1. **Supabase Profiles Table:**
   ```typescript
   {
     user_id: string;
     email: string;
     full_name: string;
     role: 'student' | 'teacher';
     bio: string | null;
     phone: string | null;
     is_active: boolean;
     hourly_rate: number | null;
     learning_goals: string[] | null;
     age: number | null;
     languages: string[] | null;
     metadata: {
       profile_slug: string;
       education?: string[];
       experience?: string[];
       specializations?: string[];
       profile_completed: boolean;
       profile_needs_setup: boolean;
       profile_completion_date: string;
     }
   }
   ```

2. **Clerk User Metadata:**
   ```typescript
   {
     role: 'student' | 'teacher';
     profile_completed: boolean;
     profile_needs_setup: boolean;
   }
   ```

### 4. Profile Status Flags
Two main flags control the profile state:
- `profile_needs_setup`: Indicates if user needs to complete onboarding
- `profile_completed`: Indicates if profile setup is finished

### 5. Redirection Logic
1. **Unauthenticated Users:**
   - Redirected to `/login`

2. **Authenticated Users:**
   - If profile needs setup: Stay on setup page
   - If profile completed: Redirect to role-specific dashboard
     - Teachers → `/teacher`
     - Students → `/student`

## Error Handling

### 1. Webhook Errors
- Logs errors to console
- Returns appropriate HTTP status codes
- Maintains data consistency between Clerk and Supabase

### 2. Profile Setup Errors
- Shows toast notifications for errors
- Maintains form state on error
- Provides clear error messages in Latvian

## Security Considerations

### 1. RLS Policies
- Supabase RLS uses Clerk JWT for authentication
- No direct Supabase auth needed
- Policies ensure users can only access their own data

### 2. Data Validation
- Form validation using Zod
- Server-side validation in webhook
- Type safety with TypeScript

## Development Guidelines

### 1. Adding New Profile Fields
1. Update Supabase schema
2. Modify profile setup form
3. Update webhook handler
4. Update types

### 2. Modifying Role-Specific Logic
1. Update `RoleSelectionForm`
2. Modify role-specific form components
3. Update webhook role handling
4. Update redirection logic

### 3. Testing
- Test webhook with Clerk test events
- Verify profile completion flow
- Test role-specific features
- Verify RLS policies

## Common Issues & Solutions

### 1. Profile Not Completing
- Check webhook logs
- Verify metadata flags
- Ensure all required fields are filled

### 2. Role Selection Issues
- Clear local storage
- Check Clerk metadata
- Verify Supabase profile

### 3. Redirection Loops
- Check excluded paths
- Verify profile status flags
- Clear browser cache
