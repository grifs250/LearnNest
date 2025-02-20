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
│   │   ├── layout.tsx
│   │   └── loading.tsx
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
│   │   └── loading.tsx
│   │
│   ├── 📁 (lessons)/                 # Lessons route group
│   │   ├── 📁 [category]/
│   │   │   └── 📁 [subjectId]/
│   │   │       └── page.tsx
│   │   ├── 📁 meet/
│   │   │   └── 📁 [lessonId]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   │
│   ├── 📁 api/                       # API routes
│   │   ├── 📁 auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts
│   │   │   └── verify-email/
│   │   │       └── route.ts
│   │   ├── 📁 lessons/
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── 📁 bookings/
│   │       ├── create/
│   │       │   └── route.ts
│   │       └── [id]/
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
│   ├── error.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── page.tsx
│   ├── landingContent.tsx
│   └── themeProvider.tsx
│
├── 📁 features/                      # Feature-specific code
│   ├── 📁 auth/
│   │   ├── 📁 components/
│   │   │   ├── index.ts              # Barrel file for auth components
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
│   │   │   ├── LessonCard.tsx
│   │   │   ├── LessonForm.tsx
│   │   │   └── LessonDetails.tsx
│   │   ├── 📁 hooks/
│   │   │   ├── index.ts
│   │   │   └── useLessons.ts
│   │   └── types.ts
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
│   │   ├── UserInfoModal.tsx
│   │   ├── StudentLessons.tsx
│   │   ├── StudentBookings.tsx
│   │   ├── TeacherBookings.tsx
│   │   ├── AvailableVacancies.tsx
│   │   ├── EditLessonModal.tsx
│   │   ├── CreateLessonModal.tsx
│   │   ├── WorkSchedule.tsx
│   │   └── CourseSections.tsx
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
├── 📁 styles/                       # Global styles
│   ├── globals.css
│   └── tailwind.css
│
├── 📁 lib/                          # External services
│   ├── 📁 firebase/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   └── config.ts
│   │
│   ├── 📁 supabase/                 # Future Supabase integration
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
│   ├── fetchSubjects.ts
│   └── lessons.ts
│
├── 📁 config/                       # App configuration
│   ├── index.ts
│   ├── constants.ts
│   ├── routes.ts
│   └── site.ts
│
├── 📁 public/                       # Static files
│   ├── 📁 images/
│   │   └── ...
│   ├── 📁 icons/
│   │   └── ...
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
├── next.config.js
├── package.json
├── postcss.config.js
├── postcss.config.mjs
├── tailwind.config.js
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── README1.md
├── firestore.rules
├── middleware.ts
└── next-env.d.ts