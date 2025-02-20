📁 ROOT
├── 📁 app/
│   ├── 📁 (auth)/                    # Authentication route group
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
│   │   │   ├── 📁 bookings/
│   │   │   └── page.tsx
│   │   ├── 📁 teacher/
│   │   │   ├── 📁 schedule/
│   │   │   ├── 📁 lessons/
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
│   │   │   └── verify-email/
│   │   ├── 📁 lessons/
│   │   │   ├── create/
│   │   │   └── [id]/
│   │   └── 📁 bookings/
│   │       ├── create/
│   │       └── [id]/
│   │
│   ├── error.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
│
├── 📁 features/                      # Feature-specific code
│   ├── 📁 auth/
│   │   ├── 📁 components/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── AuthButtons.tsx
│   │   │   └── VerifyEmail.tsx
│   │   ├── 📁 hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useVerification.ts
│   │   ├── 📁 utils/
│   │   │   └── auth-helpers.ts
│   │   └── types.ts
│   │
│   ├── 📁 lessons/
│   │   ├── 📁 components/
│   │   │   ├── LessonCard.tsx
│   │   │   ├── LessonForm.tsx
│   │   │   └── LessonDetails.tsx
│   │   ├── 📁 hooks/
│   │   │   └── useLessons.ts
│   │   └── types.ts
│   │
│   ├── 📁 bookings/
│   │   ├── 📁 components/
│   │   │   ├── BookingCalendar.tsx
│   │   │   └── TimeSlotPicker.tsx
│   │   ├── 📁 hooks/
│   │   │   └── useBookings.ts
│   │   └── types.ts
│   │
│   └── 📁 payments/
│       ├── 📁 components/
│       │   └── PaymentModal.tsx
│       ├── 📁 hooks/
│       │   └── usePayment.ts
│       └── types.ts
│
├── 📁 shared/                        # Shared code
│   ├── 📁 components/                # Truly shared components
│   │   ├── 📁 ui/                   # Basic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   ├── 📁 hooks/                    # Common hooks
│   │   ├── useToast.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── 📁 utils/                    # Utilities
│   │   ├── date-helpers.ts
│   │   └── validation.ts
│   │
│   └── 📁 types/                    # Shared types
│       └── common.ts
│
├── 📁 styles/                       # Global styles
│   ├── globals.css
│   └── tailwind.css
│
├── 📁 lib/                          # External services
│   ├── 📁 firebase/
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   └── config.ts
│   │
│   ├── 📁 supabase/                 # Future Supabase integration
│   │   ├── client.ts
│   │   └── config.ts
│   │
│   └── 📁 google/
│       └── calendar.ts
│
├── 📁 config/                       # App configuration
│   ├── constants.ts
│   ├── routes.ts
│   └── site.ts
│
├── 📁 public/                       # Static files
│   ├── 📁 images/
│   └── 📁 icons/
│
├── .env.example
├── .env.local
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json