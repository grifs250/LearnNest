-- Migration 19: Fix audit log trigger for changed_by field 🚀
-- This migration ensures that audit log insertions always provide a non-null value for changed_by
-- It updates the trigger function to default to 'system' if the JWT claim is not available

BEGIN;

-- Drop the existing audit log trigger on profiles if it exists
DROP TRIGGER IF EXISTS audit_log_trigger ON profiles;

-- Update the audit log trigger function to provide a default for changed_by
CREATE OR REPLACE FUNCTION log_profile_changes() RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_log(table_name, record_id, action, old_data, new_data, changed_by, changed_at)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(OLD.id, NEW.id),
    TG_OP,
    to_jsonb(OLD),
    to_jsonb(NEW),
    COALESCE(NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'sub', ''), 'system'),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger on the profiles table
CREATE TRIGGER audit_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_profile_changes();

COMMIT; 