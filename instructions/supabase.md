# Supabase Documentation

supabase/schema_full.sql (full schema)

## Project Overview
Online learning platform connecting students with teachers for private lessons using Supabase for:
- Authentication (via Clerk integration)
- Database
- Storage
- Realtime subscriptions

## Environment Setup
```env
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Database Schema

### Custom Types and Enums
```sql
-- Enums
booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
user_role: 'student' | 'teacher' | 'admin'
```

### User Management
1. **profiles**
```sql
id: uuid PRIMARY KEY
email: text UNIQUE
full_name: text
role: user_role DEFAULT 'student'
avatar_url: text
bio: text
phone: text
timezone: text DEFAULT 'UTC'
language: text DEFAULT 'en'
is_active: boolean DEFAULT true
metadata: jsonb DEFAULT '{}'
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
```

2. **student_profiles**
```sql
id: uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE
learning_goals: text[]
interests: text[]
preferred_languages: text[]
study_schedule: jsonb DEFAULT '{}'
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
```

3. **teacher_profiles**
```sql
id: uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE
education: text[]
experience: text[]
certificates: text[]
specializations: text[]
hourly_rate: numeric(10,2)
rating: numeric(3,2)
total_reviews: integer DEFAULT 0
availability: jsonb DEFAULT '{}'
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
CONSTRAINT check_hourly_rate_positive CHECK (hourly_rate >= 0)
CONSTRAINT teacher_profiles_rating_check CHECK (rating >= 0 AND rating <= 5)
CONSTRAINT teacher_profiles_total_reviews_check CHECK (total_reviews >= 0)
```

### Educational Content
1. **categories**
```sql
id: uuid PRIMARY KEY
name: text UNIQUE
description: text
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
```

2. **subjects**
```sql
id: uuid PRIMARY KEY
name: text
slug: text UNIQUE
description: text
icon_url: text
is_active: boolean DEFAULT true
parent_id: uuid REFERENCES subjects(id) ON DELETE SET NULL
category_id: uuid REFERENCES categories(id) ON DELETE SET NULL
metadata: jsonb DEFAULT '{}'
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$')
```

3. **teacher_subjects**
```sql
teacher_id: uuid REFERENCES teacher_profiles(id) ON DELETE CASCADE
subject_id: uuid REFERENCES subjects(id) ON DELETE CASCADE
experience_years: integer DEFAULT 0
hourly_rate: numeric(10,2)
is_verified: boolean DEFAULT false
created_at: timestamptz DEFAULT now()
PRIMARY KEY (teacher_id, subject_id)
CONSTRAINT teacher_subjects_experience_years_check CHECK (experience_years >= 0)
CONSTRAINT teacher_subjects_hourly_rate_check CHECK (hourly_rate >= 0)
```

### Lesson Management
1. **lessons**
```sql
id: uuid PRIMARY KEY
teacher_id: uuid REFERENCES teacher_profiles(id) ON DELETE CASCADE
subject_id: uuid REFERENCES subjects(id) ON DELETE RESTRICT
title: text
description: text
duration: integer
max_students: integer DEFAULT 1
price: numeric(10,2)
is_active: boolean DEFAULT true
metadata: jsonb DEFAULT '{}'
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
CONSTRAINT check_duration_positive CHECK (duration > 0)
CONSTRAINT check_price_positive CHECK (price >= 0)
CONSTRAINT lessons_max_students_check CHECK (max_students > 0)
```

2. **lesson_schedules**
```sql
id: uuid PRIMARY KEY
lesson_id: uuid REFERENCES lessons(id) ON DELETE CASCADE
start_time: timestamptz
end_time: timestamptz
is_available: boolean DEFAULT true
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
CONSTRAINT valid_schedule CHECK (end_time > start_time)
CONSTRAINT no_schedule_overlap UNIQUE (lesson_id, start_time, end_time)
```

3. **teacher_work_hours**
```sql
id: uuid PRIMARY KEY
teacher_id: uuid REFERENCES profiles(id)
day_0: text  -- Sunday
day_1: text  -- Monday
day_2: text  -- Tuesday
day_3: text  -- Wednesday
day_4: text  -- Thursday
day_5: text  -- Friday
day_6: text  -- Saturday
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
```

### Booking System
1. **bookings**
```sql
id: uuid PRIMARY KEY
schedule_id: uuid REFERENCES lesson_schedules(id) ON DELETE CASCADE
student_id: uuid REFERENCES student_profiles(id) ON DELETE RESTRICT
amount: numeric
status: booking_status
payment_status: payment_status
metadata: jsonb DEFAULT '{}'
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
CONSTRAINT unique_student_schedule UNIQUE (student_id, schedule_id)
```

2. **reviews**
```sql
id: uuid PRIMARY KEY
booking_id: uuid UNIQUE REFERENCES bookings(id) ON DELETE CASCADE
student_id: uuid REFERENCES student_profiles(id) ON DELETE CASCADE
teacher_id: uuid REFERENCES teacher_profiles(id) ON DELETE CASCADE
rating: integer
comment: text
is_public: boolean DEFAULT true
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()
CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5)
```

### Communication
1. **messages**
```sql
id: uuid PRIMARY KEY
booking_id: uuid REFERENCES bookings(id) ON DELETE CASCADE
sender_id: uuid REFERENCES profiles(id) ON DELETE CASCADE
content: text
is_read: boolean DEFAULT false
created_at: timestamptz DEFAULT now()
CONSTRAINT messages_content_check CHECK (length(content) > 0)
```

2. **notifications**
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES profiles(id) ON DELETE CASCADE
type: text
title: text
message: text
is_read: boolean DEFAULT false
metadata: jsonb DEFAULT '{}'
created_at: timestamptz DEFAULT now()
CONSTRAINT notifications_title_check CHECK (length(title) > 0)
CONSTRAINT notifications_message_check CHECK (length(message) > 0)
```

### Important Indexes
```sql
-- Booking Indexes
CREATE INDEX idx_bookings_status ON bookings(status, payment_status);
CREATE INDEX idx_bookings_student ON bookings(student_id);

-- Lesson Indexes
CREATE INDEX idx_lessons_is_active ON lessons(is_active);
CREATE INDEX idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX idx_lessons_subject ON lessons(subject_id);
CREATE INDEX idx_lessons_search ON lessons USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_lessons_title_trgm ON lessons USING gin(title gin_trgm_ops);

-- Schedule Indexes
CREATE INDEX idx_lesson_schedules_availability ON lesson_schedules(lesson_id, start_time, is_available);
CREATE INDEX idx_lesson_schedules_time ON lesson_schedules(start_time, end_time);

-- Profile Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email_trgm ON profiles USING gin(email gin_trgm_ops);
CREATE INDEX idx_profiles_full_name_trgm ON profiles USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_profiles_search ON profiles USING gin(to_tsvector('english', full_name || ' ' || COALESCE(bio, '')));

-- Subject Indexes
CREATE INDEX idx_subjects_category_id ON subjects(category_id);
CREATE INDEX idx_subjects_name_trgm ON subjects USING gin(name gin_trgm_ops);
CREATE INDEX idx_subjects_search ON subjects USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_subjects_slug ON subjects(slug);

-- Communication Indexes
CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

## Performance Features

### Indexing Strategy
1. **Full-Text Search**
   - Lessons: title and description
   - Profiles: name and bio
   - Subjects: name and description

2. **Trigram Indexes**
   - Email search
   - Name search
   - Subject name search

3. **Composite Indexes**
   - Booking status + payment status
   - User notifications + read status
   - Lesson schedules + availability

### Data Validation
1. **Numeric Constraints**
   - Positive prices and rates
   - Valid rating ranges (1-5)
   - Positive durations

2. **Text Validation**
   - Email format
   - Slug format
   - Non-empty messages

3. **Temporal Validation**
   - Schedule overlap prevention
   - End time after start time
   - Timestamp management

## Security

### Row Level Security (RLS)
1. **Public Access**
   - Lesson viewing
   - Subject browsing
   - Teacher profile viewing

2. **Authenticated Access**
   - Booking management
   - Message sending
   - Review creation

3. **Role-Based Access**
   - Teacher-specific operations
   - Student-specific operations
   - Admin capabilities

### Data Protection
1. **Cascade Behaviors**
   - Appropriate deletion rules
   - Referential integrity
   - Data consistency

2. **Constraints**
   - Unique constraints
   - Foreign key relationships
   - Check constraints

## Integration with Next.js

### Client Setup
```typescript
import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';

export function createClerkSupabaseClient() {
  const { session } = useSession();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${session?.getToken({ template: 'supabase' })}`,
        },
      },
    }
  );
}
```

### Custom Hook Usage
```typescript
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';

export function YourComponent() {
  const { supabase, isInitialized } = useClerkSupabase();
  
  // Use supabase client here
}
```

## Maintenance

### Backup Strategy
- Regular automated backups
- Point-in-time recovery
- Data export capabilities

### Schema Updates
- Migration-based changes
- Backward compatibility
- Version control integration

### Performance Monitoring
- Query performance tracking
- Index usage analysis
- Connection pooling

## Best Practices

### Data Access
1. Use typed queries with generated types
2. Implement proper error handling
3. Use prepared statements
4. Cache frequently accessed data

### Security
1. Never expose service role key
2. Implement proper RLS policies
3. Use least privilege principle
4. Regular security audits

### Performance
1. Use appropriate indexes
2. Optimize query patterns
3. Implement connection pooling
4. Monitor query performance

## Common Operations

### Query Examples
```typescript
// Fetch active lessons with teacher info
const { data: lessons } = await supabase
  .from('lessons')
  .select(`
    *,
    teacher:teacher_profiles(
      id,
      full_name,
      rating
    )
  `)
  .eq('is_active', true);

// Create a booking
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    schedule_id,
    student_id,
    amount,
    status: 'pending'
  })
  .select()
  .single();

// Update lesson availability
const { error } = await supabase
  .from('lesson_schedules')
  .update({ is_available: false })
  .eq('id', scheduleId);
```

## Troubleshooting

### Common Issues
1. Connection problems
2. Permission errors
3. Constraint violations
4. Performance issues

### Solutions
1. Check environment variables
2. Verify RLS policies
3. Validate input data
4. Review query patterns

## Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [TypeScript Support](https://supabase.com/docs/reference/typescript-support)
- [Database Backups](https://supabase.com/docs/guides/platform/backups)

# Supabase Integration

## Overview
- Using Supabase for database only
- Authentication handled by Clerk
- Row Level Security (RLS) based on Clerk JWT claims

## Setup

1. Create Supabase project
2. Run initial migration SQL
3. Configure environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Access

### Client-side
```typescript
import { supabase } from '@/lib/supabase/client';

// Regular queries use RLS
const { data } = await supabase
  .from('profiles')
  .select('*');
```

### Server-side
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Admin operations
const supabase = await createServerSupabaseClient();
const { data } = await supabase
  .from('profiles')
  .select('*');
```

## Row Level Security
- Policies use Clerk JWT claims
- Each table has appropriate RLS policies
- Admin operations use service role key 

## Additional RLS Policies

### Profile Policies
```sql
CREATE POLICY "Users can manage own profiles" ON profiles
    USING (user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub');
```

### Wallet Policies
```sql
CREATE POLICY "Users can manage wallet transactions" ON wallet_transactions
    USING (wallet_id IN (
        SELECT w.id FROM wallets w
        JOIN profiles p ON p.id = w.profile_id
        WHERE p.user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    ));
```

### Message Policies
```sql
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id IN (
        SELECT id FROM profiles
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    ));

CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        sender_id IN (
            SELECT id FROM profiles
            WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        ) OR EXISTS (
            SELECT 1 FROM bookings b
            JOIN lesson_schedules ls ON ls.id = b.schedule_id
            JOIN lessons l ON l.id = ls.lesson_id
            WHERE b.id = messages.booking_id
            AND (
                b.student_id IN (
                    SELECT id FROM profiles
                    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
                ) OR l.teacher_id IN (
                    SELECT id FROM profiles
                    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
                )
            )
        )
    );
```

## Updated Client Integration

```typescript
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

export function useSupabaseClient() {
  const { getToken } = useAuth();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await getToken({ template: 'supabase' });
          return {
            Authorization: `Bearer ${token}`,
          };
        },
      },
    }
  );
  
  return supabase;
}
```

## Realtime Configuration

### Publications
```sql
-- Create realtime publication for messages
CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');

-- Create specific publication for messages and notifications
CREATE PUBLICATION supabase_realtime_messages_publication 
WITH (publish = 'insert, update, delete, truncate');

-- Add tables to messages publication
ALTER PUBLICATION supabase_realtime_messages_publication 
ADD TABLE ONLY public.messages;

ALTER PUBLICATION supabase_realtime_messages_publication 
ADD TABLE ONLY public.notifications;
```

### Extensions
```sql
-- Required extensions
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
```

### Additional Types and Enums
```sql
-- Form Schema Types
lesson_type: 'one_on_one' | 'group' | 'workshop'
message_type: 'text' | 'file' | 'system'
notification_type: 'booking' | 'message' | 'payment' | 'system'
transaction_type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'payout'

-- Validation Functions
validate_lesson_type(): Ensures lesson type is valid
validate_message_type(): Ensures message type is valid
validate_notification_type(): Ensures notification type is valid
validate_transaction_type(): Ensures transaction type is valid
```

### Type Constraints
```sql
-- Example usage in tables
CREATE TABLE lessons (
    -- other fields...
    type lesson_type NOT NULL DEFAULT 'one_on_one',
    CONSTRAINT valid_lesson_type CHECK (
        type IN ('one_on_one', 'group', 'workshop')
    )
);

CREATE TABLE messages (
    -- other fields...
    type message_type NOT NULL DEFAULT 'text',
    CONSTRAINT valid_message_type CHECK (
        type IN ('text', 'file', 'system')
    )
);

CREATE TABLE notifications (
    -- other fields...
    type notification_type NOT NULL DEFAULT 'system',
    CONSTRAINT valid_notification_type CHECK (
        type IN ('booking', 'message', 'payment', 'system')
    )
);

CREATE TABLE wallet_transactions (
    -- other fields...
    type transaction_type NOT NULL,
    CONSTRAINT valid_transaction_type CHECK (
        type IN ('deposit', 'withdrawal', 'payment', 'refund', 'payout')
    )
);
``` 