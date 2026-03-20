-- Migration 004: Row Level Security

-- Enable RLS ────────────────────────────────────────────────
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learned_kana      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learned_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learned_kanji     ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger              ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_kana           ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_vocabulary     ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_kanji          ENABLE ROW LEVEL SECURITY;

-- Content tables: read-only for authenticated users ──────────
CREATE POLICY "authenticated read" ON content_kana
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated read" ON content_vocabulary
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated read" ON content_kanji
    FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles ───────────────────────────────────────────────────
CREATE POLICY "own profile select" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "own profile update" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- User learned tables ────────────────────────────────────────
CREATE POLICY "own data" ON user_learned_kana
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "own data" ON user_learned_vocabulary
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "own data" ON user_learned_kanji
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- SRS ────────────────────────────────────────────────────────
CREATE POLICY "own data" ON srs_items
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Quiz ───────────────────────────────────────────────────────
CREATE POLICY "own data" ON quiz_sessions
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "own quiz results" ON quiz_question_results
    USING (
        session_id IN (
            SELECT id FROM quiz_sessions WHERE user_id = auth.uid()
        )
    );

-- Streaks & XP ───────────────────────────────────────────────
CREATE POLICY "own data" ON daily_streaks
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "own data" ON xp_ledger
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
