-- Check if the user_role type exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('student', 'teacher');
    ELSE
        -- If the type exists, check if it has the needed values and add them if not
        BEGIN
            ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'student';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, ignore
        END;
        
        BEGIN
            ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'teacher';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, ignore
        END;
    END IF;
END
$$; 