# 📚 MāciesTe - Online Learning Platform

LINK: https://learn-nest-seven.vercel.app/

MāciesTe is a modern online learning platform built with **Next.js 15**, connecting students with qualified teachers for personalized lessons. The platform features **TypeScript**, **TailwindCSS with DaisyUI**, and **Supabase** for authentication and data storage. Students can search for teachers, book lessons, make payments via Stripe, and attend video sessions. Teachers can manage their schedules, track earnings, and receive secure payouts.

---

### 🔧 Technical Specification

## 1. Technology Stack
- **Frontend**: TypeScript, Next.js 15
- **UI**: TailwindCSS with DaisyUI
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL)
- **Video Calls**: Daily.co (TBD)
- **Payments**: Stripe

## 2. User Roles & Features

### 2.1 Student Features
- **Registration**:
  - Name, email, phone, age, password
  - Email/password login
  - Password recovery
- **Core Features**:
  - Search teachers by subject
  - Book available time slots
  - Make prepayments
  - Receive email confirmations with lesson links
  - View booked lessons and links in profile
  - Leave reviews after lessons
  - Access lesson history

### 2.2 Teacher Features
- **Registration**:
  - Name, email, phone, profile photo
  - Bio and specialization
  - Education documents
  - Tax ID/Personal ID
- **Core Features**:
  - Set availability and pricing (with visible commission fees)
  - Confirm lesson requests
  - Receive lesson links via email
  - Access virtual wallet
  - View earnings history
  - Request payouts
  - View lesson history

### 2.3 Admin Features
- Approve user accounts
- Teacher quality control
- Process teacher payouts
- Monitor reviews
- Handle disputes
- Manage all bookings
- Access payment overview
- Review all communications

## 3. Core Platform Features

### 3.1 Booking System
- Teacher availability management
- Student booking with prepayment
- Automated email/SMS notifications
- 24-hour cancellation policy

### 3.2 Payment System
- Student prepayments
- Teacher virtual wallet
- Platform commission handling
- Automated invoice generation
- Payment history tracking

### 3.3 Video Lessons
- Google Meet link generation (TBD)
- Link distribution
- Optional lesson recording

### 3.4 Review System
- Post-lesson student feedback
- Public teacher reviews

## 4. Technical Requirements

### 4.1 Security
- SSL certification (Vercel)
- User authentication (Clerk)
- CAPTCHA protection (Clerk)

### 4.2 Integrations
- Google Analytics
- Stripe
- Google Meet (TBD)
- Calendar (TBD)
- Virtual Wallet (TBD)
- Survey System (TBD)

### 4.3 Testing
- Cross-browser testing (Chrome, Firefox, Safari)
- Responsive design testing
- Full functionality testing

## 5. Timeline
- Development: 6 months from contract signing

## MāciesTe - Online Learning Platform

MāciesTe ("Learn Here" in Latvian) is an online learning platform that connects students with teachers for private lessons.

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Authentication**: Clerk
- **Database**: Supabase
- **Styling**: TailwindCSS with DaisyUI
- **Form Handling**: React Hook Form with Zod validation
- **Language**: TypeScript

## System Overview

### Authentication

MāciesTe uses Clerk for user authentication and management:

- Clerk handles all user authentication (sign-up, login, account management)
- Supabase uses Clerk JWT for Row Level Security (RLS)
- No Supabase Auth or cookies are needed
- A webhook syncs Clerk users to Supabase profiles

### Data Structure

The database is organized with a clear structure:

- Centralized database types in `types/database.ts`
- Database access through a service layer in `lib/supabase/db.ts`
- Feature-specific hooks for data operations

## Project Structure

The project follows a modular structure:

- **app/**: Next.js App Router pages and layouts
  - **(auth)/**: Authentication-related pages
  - **(dashboard)/**: Dashboard pages for students and teachers
  - **(lessons)/**: Lesson browsing and details
  - **api/**: API routes for data operations

- **features/**: Feature-specific code
  - **auth/**: Authentication components and hooks
  - **lessons/**: Lesson-related components and hooks
  - **bookings/**: Booking-related components and hooks

- **shared/**: Code shared across features
  - **components/**: Reusable UI components
  - **hooks/**: Common hooks
  - **utils/**: Utility functions

- **lib/**: External services integration
  - **supabase/**: Supabase client and helpers
  - **clerk/**: Clerk configuration

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Clerk and Supabase credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

## Building for Production

To build for production:

```bash
npm run build
npm start
```

## Recent Improvements

We've recently made several improvements to the codebase:

1. **Centralized Database Types**: Moved all database type definitions to `types/database.ts`, ensuring consistency across the application.

2. **Enhanced Supabase Client**: Improved the Supabase client implementation with proper typings and consistent usage patterns.

3. **Database Service Layer**: Created a central service object for database operations with typed methods instead of direct Supabase queries.

4. **TypeScript Error Fixes**: Fixed numerous TypeScript errors and improved type safety throughout the application.

5. **Consistent Error Handling**: Implemented consistent error handling patterns in API routes and hooks.

6. **UI Components**: Added new components like `TeacherProfile` and enhanced SEO with `DynamicMetadata`.

7. **Routing Fixes**: Updated page routes to correctly handle parameters and loading states.

8. **BookingStatus Enum**: Standardized the BookingStatus enum values across the application.

9. **Clean Code**: Removed unused code and fixed linter errors to improve maintainability.

## Known Issues

There are a few remaining issues that need to be addressed:

1. **~~Clerk Webhook TypeScript Errors~~** ✅ **FIXED**: The Clerk webhook route's TypeScript errors with the `headers()` function have been fixed by properly awaiting the headers promise.

2. **~~Database Schema Changes~~** ✅ **FIXED**: The database schema was changed from separate profile tables (`profiles`, `teacher_profiles`, `student_profiles`) to a unified `user_profiles` table. References to old table names have been updated.

3. **TypeScript Errors Progress**:
   - ✅ **FIXED**: Updated the `features/bookings/types` to include necessary types for the booking components
   - ✅ **IN PROGRESS**: Updating booking components (`StudentBookings`, `TeacherBookings`) to match the new types
   - ⏳ **PENDING**: Firebase references need to be migrated to Supabase (especially in `features/dashboard`, `features/payments`, and `features/schedule`)
   - ⏳ **PENDING**: Several files need to update their Supabase client imports to use service functions

4. **Next Steps**: 
   - Complete the migration from Firebase to Supabase
   - Fix linter errors in `StudentBookings` and `TeacherBookings` components
   - Create missing type definitions for remaining files
   - Fix validation in lesson utilities
   - Add comprehensive test coverage
   - Improve error handling in edge cases

## Upcoming Improvements

1. **Enhanced Error Handling**: Implement more robust error handling throughout the application, especially for edge cases.

2. **Component Cleanup**: Continue refactoring components to match the new unified database schema.

3. **Firebase Migration Completion**: Finish converting all Firebase references to Supabase equivalents.

4. **Testing**: Add comprehensive test coverage for critical functionality.

5. **UI Improvements**: Enhance user experience with better loading states and error messages.

6. **Documentation**: Improve code documentation and add JSDoc comments to all functions.

## Migration Strategy

To complete the migration from Firebase to Supabase, we should:

1. Create a list of all files still using Firebase imports
2. Define the matching Supabase functionality for each Firebase feature
3. Replace Firebase imports with Supabase equivalents
4. Update data access patterns to match Supabase's approach
5. Test thoroughly after each update

## Booking Components Update

The booking components are being updated to:

1. Use the correct type definitions
2. Handle potential error cases more gracefully
3. Transform data from the database into the expected format
4. Use the createClient utility consistently instead of the direct import



