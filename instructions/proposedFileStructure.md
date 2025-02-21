📁 ROOT
├── 📁 app/
│   ├── 📁 (auth)/                    # Authentication route group
│   │   ├── 📁 action/                # Email verification action handler
│   │   │   └── page.tsx
│   │   ├── 📁 login/
│   │   │   └── page.tsx
│   │   ├── 📁 register/
│   │   │   └── page.tsx
│   │   ├── 📁 verify-email/
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Auth layout with protection
│   │   ├── loading.tsx               # Auth loading state
│   │   └── template.tsx              # Auth metadata
│   │
│   ├── 📁 (dashboard)/               # Dashboard route group
│   │   ├── 📁 student/
│   │   │   ├── 📁 lessons/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 bookings/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── 📁 teacher/
│   │   │   ├── 📁 schedule/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 lessons/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── template.tsx
│   │   └── page.tsx
│   │
│   ├── 📁 (lessons)/                 # Lessons route group
│   │   ├── 📁 [category]/
│   │   │   ├── 📁 [subjectId]/
│   │   │   │   ├── 📁 [lessonId]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   ├── error.tsx
│   │   │   │   │   └── template.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   └── template.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── template.tsx
│   │   ├── 📁 meet/
│   │   │   └── 📁 [lessonId]/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       ├── error.tsx
│   │   │       └── template.tsx
│   │   ├── layout.tsx                # Lessons layout with provider
│   │   ├── loading.tsx               # Lessons loading state
│   │   ├── error.tsx                 # Lessons error boundary
│   │   └── template.tsx              # Lessons metadata
│   │
│   ├── 📁 api/                       # API routes
│   │   ├── 📁 auth/
│   │   │   ├── 📁 [...nextauth]/     # NextAuth.js routes
│   │   │   │   └── route.ts
│   │   │   └── 📁 verify-email/
│   │   │       └── route.ts
│   │   ├── 📁 lessons/
│   │   │   ├── 📁 create/
│   │   │   │   └── route.ts
│   │   │   └── 📁 [id]/
│   │   │       └── route.ts
│   │   └── 📁 bookings/
│   │       ├── 📁 create/
│   │       │   └── route.ts
│   │       └── 📁 [id]/
│   │           └── route.ts
│   │
│   ├── 📁 profile/                   # Profile pages
│   │   ├── 📁 [userId]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   │
│   ├── 📁 buj/                       # FAQ/Help pages
│   │   └── page.tsx
│   │
│   ├── error.tsx                     # Root error boundary
│   ├── layout.tsx                    # Root layout
│   ├── loading.tsx                   # Root loading state
│   ├── page.tsx                      # Landing page
│   ├── landingContent.tsx            # Landing page content
│   └── themeProvider.tsx             # Theme context provider
│
├── 📁 features/                      # Feature-specific code
│   ├── 📁 auth/
│   │   ├── 📁 components/
│   │   │   ├── index.ts
│   │   │   ├── AuthForm.tsx
│   │   │   ├── AuthWrapper.tsx
│   │   │   ├── AuthButtons.tsx
│   │   │   └── EmailVerification.tsx
│   │   ├── 📁 hooks/
│   │   │   ├── index.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useVerification.ts
│   │   ├── 📁 utils/
│   │   │   └── auth-helpers.ts
│   │   └── types.ts
│   │
│   ├── 📁 lessons/
│   │   ├── 📁 components/
│   │   │   ├── index.ts
│   │   │   ├── CourseSections.tsx
│   │   │   ├── CreateLessonModal.tsx
│   │   │   ├── EditLessonModal.tsx
│   │   │   ├── LessonDetails.tsx
│   │   │   ├── LessonForm.tsx
│   │   │   ├── StudentLessons.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── 📁 hooks/
│   │   │   ├── index.ts
│   │   │   ├── useAvailableLessons.ts
│   │   │   ├── useCategory.ts
│   │   │   ├── useLessonDetails.ts
│   │   │   ├── useLessons.ts
│   │   │   └── useStudentLessons.ts
│   │   ├── 📁 services/
│   │   │   ├── index.ts
│   │   │   ├── lessonService.ts
│   │   │   └── bookingService.ts
│   │   ├── 📁 types/
│   │   │   ├── index.ts
│   │   │   ├── lesson.ts
│   │   │   ├── booking.ts
│   │   │   └── category.ts
│   │   ├── 📁 utils/
│   │   │   ├── index.ts
│   │   │   ├── dateHelpers.ts
│   │   │   ├── validation.ts
│   │   │   └── lessonHelpers.ts
│   │   ├── constants.ts
│   │   ├── config.ts
│   │   └── index.ts
│   │
│   ├── 📁 bookings/
│   │   ├── 📁 components/
│   │   │   ├── index.ts
│   │   │   ├── BookingCalendar.tsx
│   │   │   └── TimeSlotPicker.tsx
│   │   ├── 📁 hooks/
│   │   │   ├── index.ts
│   │   │   └── useBookings.ts
│   │   └── types.ts
│   │
│   └── 📁 payments/
│       ├── 📁 components/
│       │   ├── index.ts
│       │   └── PaymentModal.tsx
│       ├── 📁 hooks/
│       │   ├── index.ts
│       │   └── usePayment.ts
│       └── types.ts
│
├── 📁 shared/                        # Shared code
│   ├── 📁 components/                # Truly shared components
│   │   ├── 📁 ui/                   # Basic UI components
│   │   │   ├── index.ts
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── index.ts
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── UserInfoModal.tsx
│   │
│   ├── 📁 hooks/                    # Common hooks
│   │   ├── index.ts
│   │   ├── useToast.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── 📁 utils/                    # Utilities
│   │   ├── index.ts
│   │   ├── date-helpers.ts
│   │   └── validation.ts
│   │
│   └── 📁 types/                    # Shared types
│       ├── index.ts
│       ├── common.ts
│       └── lesson.ts
│
├── 📁 lib/                          # External services
│   ├── 📁 firebase/                 # Firebase related files (to be removed)
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   └── config.ts
│   │
│   ├── 📁 supabase/                 # Supabase related files
│   │   ├── index.ts
│   │   ├── client.ts
│   │   └── config.ts
│   │
│   ├── 📁 google/
│   │   ├── index.ts
│   │   └── calendar.ts
│   │
│   ├── fetchCategories.ts
│   ├── fetchLessons.ts
│   └── fetchSubjects.ts
│
├── 📁 config/                       # App configuration
│   ├── index.ts
│   ├── constants.ts
│   ├── routes.ts
│   └── site.ts
│
├── 📁 public/                       # Static files
│   ├── 📁 images/
│   ├── 📁 icons/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📁 instructions/                 # Project documentation
│   ├── helperPromts.md
│   ├── roadmap.md
│   └── proposedFileStructure.md
│
├── .env.example
├── .env.local
├── .cursorignore
├── .cursorrules
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── README.md
├── firestore.rules                   # To be removed if transitioning to Supabase
└── middleware.ts