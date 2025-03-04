-- Base setup first
\i 'supabase/migrations/00_base_setup.sql'
\echo 'Base setup complete ✓'

-- Then cleanup
\i 'supabase/migrations/00_cleanup.sql'
\echo 'Cleanup complete ✓'

-- Then rest of migrations
\i 'supabase/migrations/01_initial_setup.sql'
\echo 'Initial setup complete ✓'

\i 'supabase/migrations/02_clerk_auth_setup.sql'
\echo 'Clerk auth setup complete ✓'

\i 'supabase/migrations/03_fix_work_hours.sql'
\echo 'Work hours fix complete ✓'

\i 'supabase/migrations/04_fix_auth_policies.sql'
\echo 'Auth policies fix complete ✓'

\i 'supabase/migrations/05_add_missing_indexes.sql'
\echo 'Missing indexes added ✓'

\i 'supabase/migrations/06_fix_lesson_relationships.sql'
\echo 'Lesson relationships fixed ✓'

\i 'supabase/migrations/07_fix_roles_and_relationships.sql'
\echo 'Roles and relationships fixed ✓'

\i 'supabase/migrations/08_enhance_schema.sql'
\echo 'Schema enhanced ✓'

\i 'supabase/migrations/09_finalize_setup.sql'
\echo 'Setup finalized ✓'

\i 'supabase/migrations/10_final_optimizations.sql'
\echo 'Final optimizations complete ✓'

\i 'supabase/migrations/11_fix_triggers.sql'
\echo 'Triggers fixed ✓'

-- Verify setup
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
\echo 'Setup verification complete ✓' 