# Clerk Integration

This directory contains the Clerk authentication integration for the MāciesTe platform.

## Overview

The Clerk integration includes:

- Custom email templates in Latvian
- Email verification helpers
- Custom ClerkProvider with Latvian localization
- Authentication utilities

## Files

- `auth.ts` - Authentication helper functions
- `emailTemplates.ts` - Email template configuration
- `emails/verification.html` - Custom verification email template in Latvian
- `index.ts` - Re-exports for easier imports
- `localization.ts` - Latvian localization for Clerk
- `providers.tsx` - Custom ClerkProvider with styling
- `verification.ts` - Email verification helper functions

## Authentication Flow

The application uses Clerk's recommended authentication flow:

1. User registers using the SignUpForm component
2. Registration initiates email verification with Clerk's API
3. User is redirected to `/verify-code` where they can input the verification code
4. After successful verification, user is redirected to the home page

The verification flow is optimized using:
- Clerk's built-in methods for verification
- Performance optimizations with React's `useTransition`
- Direct routing without unnecessary redirects
- Custom middleware configuration for public routes

## Email Templates

Custom email templates are implemented in HTML and configured in `emailTemplates.ts`. Currently, we have:

- **Verification Email** - Custom template in Latvian for verifying user email addresses
- **Password Reset** - Placeholder for password reset template (to be implemented)
- **Organization Invitation** - Placeholder for organization invitation template (to be implemented)

### Verification Email Template

The verification email template (`emails/verification.html`) includes:

- MāciesTe branding
- Instructions in Latvian for verifying the email
- Verification code placeholder (`{{code}}`)
- Responsive design for different devices

## Email Verification

The verification system provides two approaches:

1. **Built-in Clerk UI** - The primary approach using Clerk's verification flow
2. **Custom Components** - An alternative using our custom functions (`verification.ts`)

### Verification Page

A dedicated verification page at `app/(auth)/verify-code/page.tsx`:
- Shows a user-friendly interface for entering verification codes
- Uses Clerk's `attemptEmailAddressVerification` for optimal performance
- Includes error handling and success messages in Latvian
- Supports resending verification codes

## Usage

### Using the ClerkProvider

The custom ClerkProvider is automatically used in your application. It includes:

- Latvian localization
- Custom styling
- Optimized routing configuration

### Using the Verification Form

```tsx
import { VerificationForm } from '@/features/auth/components';

// In your component:
<VerificationForm 
  email="user@example.com" 
  onSuccess={() => console.log('Email verified!')} 
  className="my-4"
/>
```

## Implementation Notes

- Email verification uses Clerk's recommended approach for optimal performance
- Middleware is configured to optimize authentication checks
- All user-facing text is in Latvian
- Email templates follow responsive design principles for better user experience

## Future Improvements

- Implement password reset email template
- Implement organization invitation email template
- Add SMS verification support
- Enhance error handling and logging 