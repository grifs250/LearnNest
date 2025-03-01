# MāciesTe - Technical Specification

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


