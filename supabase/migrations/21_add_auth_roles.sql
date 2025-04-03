-- Create roles for authentication
CREATE ROLE IF NOT EXISTS anon;
CREATE ROLE IF NOT EXISTS authenticated;
CREATE ROLE IF NOT EXISTS service_role;

-- Create application-specific roles
CREATE ROLE IF NOT EXISTS student;
CREATE ROLE IF NOT EXISTS teacher;

-- Grant appropriate permissions to roles
GRANT usage ON SCHEMA public TO anon, authenticated, student, teacher;

-- Grant authenticated permissions to student and teacher roles
GRANT authenticated TO student;
GRANT authenticated TO teacher;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, student, teacher;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, student, teacher;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, student, teacher; 