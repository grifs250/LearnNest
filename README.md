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

## Key Features

- User registration and authentication with Clerk
- Teacher profiles and student dashboards
- Lesson creation and management for teachers
- Booking system for students to schedule lessons
- Realtime chat between students and teachers

## Progress Update

### Fixed TypeScript Issues
- Added null checks for Supabase client in `BookingCalendar` and `AvailableVacancies` components
- Properly defined the `Vacancy` type for available timeslots
- Added null checks and improved error handling in components
- Defined missing types like `TimeRange` and `WorkHours` in the booking components
- Updated the Booking type definition to align with Supabase data structure
- Fixed booking component imports to use the updated types
- Created a comprehensive types file for booking-related types

### Known Issues
1. Fixed: TypeScript errors in the Clerk webhook route by properly awaiting the headers promise.
2. Database Schema: Unified from separate profile tables to a single `user_profiles` table. References to old table names have been updated.
3. TypeScript Errors Progress:
   - Fixed types in `features/bookings/types`
   - Updated `StudentBookings` and `TeacherBookings` components
   - Added null checks for Supabase client in all components
   - Various components still have TypeScript errors (see TypeScript Error Summary below)

### TypeScript Error Summary
We're making good progress on TypeScript errors. The latest error count shows:
- 100 errors in 40 files
- Most errors are related to:
  1. Firebase imports that need to be migrated to Supabase
  2. Missing type definitions
  3. Type mismatches between component usage and type definitions
  4. Null checks for Supabase client

## Next Steps

1. **Migration to Supabase**: Complete the migration from Firebase to Supabase:
   - Replace all Firebase imports with Supabase equivalents
   - Update data access patterns to use Supabase client
   - Create helper functions to abstract Supabase-specific logic

2. **Fix Remaining TypeScript Errors**:
   - Create missing type definitions in `features/messages/types.ts` 
   - Fix component prop type mismatches
   - Complete null checks for all Supabase client usage

3. **Refactor Components**:
   - Update components to use the database service
   - Improve error handling throughout the application
   - Fix all linter and TypeScript errors in lesson-related components

4. **Testing**:
   - Add comprehensive test coverage
   - Test error cases and edge conditions

## Migration Strategy

### Firebase to Supabase Migration Plan

1. Identify all Firebase imports:
   - Replace `import { auth, db } from "@/lib/firebase/client"` with Supabase equivalents
   - Replace `import { doc, getDoc } from "firebase/firestore"` with Supabase methods

2. Update authentication:
   - Replace Firebase auth with Clerk auth
   - Use Clerk JWT for Supabase RLS

3. Update data access:
   - Replace Firebase queries with Supabase queries
   - Use `createClient` from `@/lib/utils/supabaseClient` 

4. Error handling:
   - Add consistent error handling with toast notifications
   - Implement proper null checking for Supabase client

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create `.env.local` file with:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```
4. Run the development server:
```bash
npm run dev
```

## Build and Deploy

```bash
npm run build
npm start
```



