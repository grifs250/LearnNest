-- Create Latvian text search dictionaries and configuration if they don't exist
DO $$
BEGIN
  -- First check if latvian configuration already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_ts_config WHERE cfgname = 'latvian'
  ) THEN
    -- Create a simple latvian configuration based on english
    -- This is a simplified approach - ideally we would have proper Latvian stemming
    CREATE TEXT SEARCH CONFIGURATION latvian (COPY = english);
    
    -- If unaccent extension is available, we can use it to handle Latvian diacritics
    IF EXISTS (
      SELECT 1 FROM pg_extension WHERE extname = 'unaccent'
    ) THEN
      ALTER TEXT SEARCH CONFIGURATION latvian 
      ALTER MAPPING FOR hword, hword_part, word WITH unaccent, english_stem;
    END IF;
  END IF;
END $$;

-- Fix the index to use simple text search for now
DROP INDEX IF EXISTS idx_profiles_fts;
CREATE INDEX idx_profiles_fts ON profiles
USING gin(to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(bio, '')));

-- Create additional text search indexes with simple configuration
CREATE INDEX IF NOT EXISTS idx_lessons_fts ON lessons
USING gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

CREATE INDEX IF NOT EXISTS idx_subjects_fts ON subjects
USING gin(to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))); 