-- Fix: migration 011 changed jlpt_level CHECK to BETWEEN 1 AND 5,
-- but the column default was still 0 (from migration 003).
-- Every new profile INSERT without explicit jlpt_level violated the check,
-- breaking guest profile creation entirely.

alter table profiles alter column jlpt_level set default 5;
