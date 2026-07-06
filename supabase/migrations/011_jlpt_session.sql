-- Migration 011: Standardize jlpt_level to JLPT scale (5=N5 easiest → 1=N1 hardest)
-- Old constraint: BETWEEN 0 AND 4
-- New constraint: BETWEEN 1 AND 5

-- Step 1: Drop old check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_jlpt_level_check;

-- Step 2: Add new check constraint for JLPT scale
ALTER TABLE profiles ADD CONSTRAINT profiles_jlpt_level_check
    CHECK (jlpt_level BETWEEN 1 AND 5);

-- Step 3: Migrate existing data
-- Old values: 0=beginner → N5(5), 1=intermediate → N3(3)
UPDATE profiles
SET jlpt_level = CASE
    WHEN jlpt_level IS NULL OR jlpt_level = 0 THEN 5
    WHEN jlpt_level = 1 THEN 3
    ELSE LEAST(GREATEST(jlpt_level, 1), 5)
END;

UPDATE profiles
SET jlpt_label = 'N' || jlpt_level::text
WHERE jlpt_level BETWEEN 1 AND 5;
