-- Migration 011: Standardize jlpt_level to JLPT scale (5=N5 easiest → 1=N1 hardest)
-- Old values: 0=beginner, 1=intermediate → New: 5=N5, 3=N3

UPDATE profiles
SET jlpt_level = CASE
    WHEN jlpt_level IS NULL OR jlpt_level = 0 THEN 5  -- Pre-N5/beginner → N5
    WHEN jlpt_level = 1 THEN 3                          -- intermediate → N3
    ELSE LEAST(GREATEST(jlpt_level, 1), 5)              -- clamp valid values
END;

UPDATE profiles
SET jlpt_label = 'N' || jlpt_level::text
WHERE jlpt_level BETWEEN 1 AND 5;
