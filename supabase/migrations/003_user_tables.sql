-- Migration 003: User tables

-- ── profiles (extends auth.users) ──────────────────────────
CREATE TABLE profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username        text UNIQUE,
    avatar_url      text,

    -- JLPT Assessment
    jlpt_level      smallint NOT NULL DEFAULT 0
                    CHECK (jlpt_level BETWEEN 0 AND 4),
    jlpt_label      text NOT NULL DEFAULT 'Pre-N5',
    goals           text[]   NOT NULL DEFAULT '{}',
    minutes_per_day smallint NOT NULL DEFAULT 10,
    learning_plan   jsonb,
    onboarding_completed_at timestamptz,

    -- Progress
    xp              integer  NOT NULL DEFAULT 0,
    current_streak  integer  NOT NULL DEFAULT 0,
    longest_streak  integer  NOT NULL DEFAULT 0,
    last_active_at  date,

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Learned items ───────────────────────────────────────────
CREATE TABLE user_learned_kana (
    id         bigserial PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
    kana_id    integer NOT NULL REFERENCES content_kana ON DELETE CASCADE,
    learned_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, kana_id)
);
CREATE INDEX idx_learned_kana_user ON user_learned_kana (user_id);

CREATE TABLE user_learned_vocabulary (
    id         bigserial PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
    vocab_id   integer NOT NULL REFERENCES content_vocabulary ON DELETE CASCADE,
    learned_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, vocab_id)
);
CREATE INDEX idx_learned_vocab_user ON user_learned_vocabulary (user_id);

CREATE TABLE user_learned_kanji (
    id         bigserial PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
    kanji_id   integer NOT NULL REFERENCES content_kanji ON DELETE CASCADE,
    learned_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, kanji_id)
);
CREATE INDEX idx_learned_kanji_user ON user_learned_kanji (user_id);

-- ── SRS items ───────────────────────────────────────────────
CREATE TYPE srs_content_type AS ENUM ('kana', 'vocabulary', 'kanji');

CREATE TABLE srs_items (
    id               bigserial PRIMARY KEY,
    user_id          uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
    content_type     srs_content_type NOT NULL,

    -- Polymorphic FK (exactly one must be set)
    kana_id          integer REFERENCES content_kana ON DELETE CASCADE,
    vocab_id         integer REFERENCES content_vocabulary ON DELETE CASCADE,
    kanji_id         integer REFERENCES content_kanji ON DELETE CASCADE,

    wrong_count      smallint NOT NULL DEFAULT 1,
    next_review_at   timestamptz NOT NULL,
    last_reviewed_at timestamptz NOT NULL DEFAULT now(),
    created_at       timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT srs_single_content CHECK (
        (kana_id IS NOT NULL)::int +
        (vocab_id IS NOT NULL)::int +
        (kanji_id IS NOT NULL)::int = 1
    ),
    UNIQUE NULLS NOT DISTINCT (user_id, kana_id),
    UNIQUE NULLS NOT DISTINCT (user_id, vocab_id),
    UNIQUE NULLS NOT DISTINCT (user_id, kanji_id)
);
CREATE INDEX idx_srs_user_due ON srs_items (user_id, next_review_at);

-- ── Quiz tables ─────────────────────────────────────────────
CREATE TYPE quiz_type AS ENUM (
    'hiragana', 'katakana', 'vocabulary', 'kanji', 'mixed', 'daily', 'review'
);

CREATE TABLE quiz_sessions (
    id               bigserial PRIMARY KEY,
    user_id          uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
    quiz_type        quiz_type NOT NULL,
    score            smallint NOT NULL DEFAULT 0,
    total_questions  smallint NOT NULL,
    accuracy_pct     numeric(5,2) GENERATED ALWAYS AS
                     (ROUND(score * 100.0 / NULLIF(total_questions, 0), 2)) STORED,
    max_streak       smallint NOT NULL DEFAULT 0,
    xp_earned        smallint NOT NULL DEFAULT 0,
    duration_seconds integer,
    completed_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quiz_sessions_user ON quiz_sessions (user_id, completed_at DESC);

CREATE TABLE quiz_question_results (
    id              bigserial PRIMARY KEY,
    session_id      bigint NOT NULL REFERENCES quiz_sessions ON DELETE CASCADE,
    content_type    srs_content_type NOT NULL,
    kana_id         integer REFERENCES content_kana,
    vocab_id        integer REFERENCES content_vocabulary,
    kanji_id        integer REFERENCES content_kanji,
    prompt          text NOT NULL,
    correct_answer  text NOT NULL,
    user_answer     text,
    is_correct      boolean NOT NULL,
    is_skipped      boolean NOT NULL DEFAULT false,
    answered_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_qr_session ON quiz_question_results (session_id);

-- ── Streaks & XP ────────────────────────────────────────────
CREATE TABLE daily_streaks (
    id                  bigserial PRIMARY KEY,
    user_id             uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
    date                date NOT NULL DEFAULT CURRENT_DATE,
    questions_answered  smallint NOT NULL DEFAULT 0,
    xp_earned           smallint NOT NULL DEFAULT 0,
    UNIQUE (user_id, date)
);
CREATE INDEX idx_streaks_user ON daily_streaks (user_id, date DESC);

CREATE TYPE xp_reason AS ENUM (
    'kana_learned', 'vocab_learned', 'kanji_learned',
    'quiz_completed', 'daily_bonus', 'streak_bonus', 'srs_mastered'
);

CREATE TABLE xp_ledger (
    id          bigserial PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
    amount      smallint NOT NULL,
    reason      xp_reason NOT NULL,
    ref_id      bigint,
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_xp_user ON xp_ledger (user_id, created_at DESC);
