-- Ensure all tables have proper timestamp handling
DO $$ 
DECLARE
  table_rec RECORD;
BEGIN
  FOR table_rec IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND 
          table_type = 'BASE TABLE' AND
          table_name NOT IN ('schema_migrations', 'spatial_ref_sys')
  LOOP
    -- Add triggers for updated_at columns if needed
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = table_rec.table_name AND column_name = 'updated_at'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgrelid = (table_rec.table_name)::regclass AND 
            tgname = table_rec.table_name || '_updated_at_trigger'
    ) THEN
      EXECUTE format('
        CREATE TRIGGER %I
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      ', table_rec.table_name || '_updated_at_trigger', table_rec.table_name);
    END IF;
  END LOOP;
END $$;

-- Create a user_metrics view for analytics
CREATE OR REPLACE VIEW user_metrics AS
SELECT
  p.id,
  p.user_id,
  p.full_name,
  p.role,
  p.created_at,
  COUNT(DISTINCT l.id) AS total_lessons_created,
  COUNT(DISTINCT b.id) AS total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) AS completed_bookings,
  CASE 
    WHEN p.role = 'teacher' THEN (
      SELECT COUNT(*) FROM reviews r
      JOIN bookings b2 ON r.booking_id = b2.id
      JOIN lesson_schedules ls ON b2.schedule_id = ls.id
      JOIN lessons l2 ON ls.lesson_id = l2.id
      WHERE l2.teacher_id = p.id
    )
    ELSE 0
  END AS total_reviews,
  CASE 
    WHEN p.role = 'teacher' THEN (
      SELECT COALESCE(AVG(r.rating), 0) FROM reviews r
      JOIN bookings b2 ON r.booking_id = b2.id
      JOIN lesson_schedules ls ON b2.schedule_id = ls.id
      JOIN lessons l2 ON ls.lesson_id = l2.id
      WHERE l2.teacher_id = p.id
    )
    ELSE 0
  END AS average_rating
FROM 
  profiles p
LEFT JOIN 
  lessons l ON p.id = l.teacher_id AND p.role = 'teacher'
LEFT JOIN 
  lesson_schedules ls ON l.id = ls.lesson_id
LEFT JOIN 
  bookings b ON (
    (p.role = 'student' AND b.student_id = p.id) OR
    (p.role = 'teacher' AND ls.id = b.schedule_id)
  )
GROUP BY p.id;

-- Create a sitemap helper function for SEO
CREATE OR REPLACE FUNCTION get_sitemap_urls()
RETURNS TABLE (
  url TEXT,
  last_modified TIMESTAMPTZ,
  priority DECIMAL,
  change_frequency TEXT
) AS $$
BEGIN
  -- Static pages
  RETURN QUERY SELECT 
    '/'::TEXT, 
    now(), 
    1.0, 
    'weekly'::TEXT;

  RETURN QUERY SELECT 
    '/about'::TEXT, 
    now(), 
    0.8, 
    'monthly'::TEXT;

  RETURN QUERY SELECT 
    '/contact'::TEXT, 
    now(), 
    0.7, 
    'monthly'::TEXT;

  -- Dynamic pages - Categories
  RETURN QUERY 
  SELECT 
    '/categories/' || slug,
    updated_at,
    0.9,
    'weekly'
  FROM categories
  WHERE is_active = true;

  -- Subjects
  RETURN QUERY 
  SELECT 
    '/' || c.slug || '/' || s.slug,
    s.updated_at,
    0.85,
    'weekly'
  FROM subjects s
  JOIN categories c ON s.category_id = c.id
  WHERE s.is_active = true;

  -- Lessons
  RETURN QUERY 
  SELECT 
    '/' || c.slug || '/' || s.slug || '/' || l.id,
    l.updated_at,
    0.8,
    'daily'
  FROM lessons l
  JOIN subjects s ON l.subject_id = s.id
  JOIN categories c ON s.category_id = c.id
  WHERE l.is_active = true;

  -- Teacher profiles
  RETURN QUERY 
  SELECT 
    '/teachers/' || url_slug,
    updated_at,
    0.9,
    'weekly'
  FROM user_profiles
  WHERE role = 'teacher' AND is_active = true;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON user_metrics TO service_role;
GRANT EXECUTE ON FUNCTION get_sitemap_urls() TO service_role;
GRANT SELECT ON TABLE user_metrics TO authenticated;

-- Add missing index for full-text search on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_fts ON profiles
USING gin(to_tsvector('latvian', coalesce(full_name, '') || ' ' || coalesce(bio, '')));

-- Ensure all RLS policies are properly applied
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_schedules ENABLE ROW LEVEL SECURITY; 