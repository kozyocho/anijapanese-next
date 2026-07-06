-- Migration 011: Standardize jlpt_level to JLPT scale (5=N5 easiest → 1=N1 hardest)

-- Step 1: Drop old check constraint (BETWEEN 0 AND 4)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_jlpt_level_check;

-- Step 2: Migrate existing data BEFORE adding new constraint
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

-- Step 3: Add new check constraint after data is clean
ALTER TABLE profiles ADD CONSTRAINT profiles_jlpt_level_check
    CHECK (jlpt_level BETWEEN 1 AND 5);
