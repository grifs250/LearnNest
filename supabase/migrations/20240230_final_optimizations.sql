-- Uzlabojam profila meklēšanas veiktspēju
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);

-- Pievienojam auditācijas funkcionalitāti
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name, 
    record_id, 
    action, 
    old_data, 
    new_data, 
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    NEW.id,
    TG_OP,
    row_to_json(OLD),
    row_to_json(NEW),
    current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_audit_trigger ON profiles;
CREATE TRIGGER profiles_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION log_profile_changes();

-- Pievienojam CHECK ierobežojumu pasniedzēju likmēm
ALTER TABLE profiles 
ADD CONSTRAINT check_hourly_rate 
CHECK (hourly_rate IS NULL OR (hourly_rate >= 5 AND hourly_rate <= 200));

-- Uzlabojam lietotāju profilu skatu, lai tas būtu SEO draudzīgāks
DROP VIEW IF EXISTS user_profiles;
CREATE VIEW user_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.avatar_url,
  p.bio,
  p.is_active,
  p.created_at,
  p.updated_at,
  p.metadata,
  p.settings,
  p.hourly_rate,
  p.learning_goals,
  p.phone,
  p.age,
  p.languages,
  p.education_documents,
  p.tax_id,
  p.personal_id,
  p.verification_status,
  p.stripe_customer_id,
  p.stripe_account_id,
  CASE
    WHEN p.role = 'teacher' THEN p.bio
    ELSE NULL
  END AS teacher_bio,
  CASE
    WHEN p.role = 'teacher' THEN p.hourly_rate
    ELSE NULL
  END AS teacher_rate,
  CASE
    WHEN p.role = 'student' THEN p.learning_goals
    ELSE NULL
  END AS student_goals,
  p.role AS profile_type,
  -- Pievienojam SEO draudzīgus laukus
  lower(replace(p.full_name, ' ', '-')) AS url_slug,
  CASE 
    WHEN p.role = 'teacher' THEN concat(p.full_name, ' - Pasniedzējs | MāciesTe')
    ELSE concat(p.full_name, ' | MāciesTe')
  END AS page_title
FROM profiles p;

-- Create an index on the underlying table instead
CREATE INDEX IF NOT EXISTS idx_profiles_url_friendly_name ON profiles(lower(replace(full_name, ' ', '-')));

-- Atļaujam anonīmiem lietotājiem skatīt pasniedzēju profilus
GRANT SELECT ON user_profiles TO anon; 