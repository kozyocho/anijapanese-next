-- Migration 002: Static content tables (kana, vocabulary, kanji)

CREATE TABLE content_kana (
    id          serial PRIMARY KEY,
    type        text NOT NULL CHECK (type IN ('hiragana', 'katakana')),
    character   text NOT NULL,
    romaji      text NOT NULL,
    examples    jsonb NOT NULL DEFAULT '[]',
    UNIQUE (type, character)
);

CREATE INDEX idx_kana_type ON content_kana (type);

-- ────────────────────────────────────────────────────────────

CREATE TABLE content_vocabulary (
    id          serial PRIMARY KEY,
    japanese    text NOT NULL UNIQUE,
    reading     text NOT NULL,
    english     text NOT NULL,
    category    text NOT NULL DEFAULT 'General',
    jlpt_level  smallint CHECK (jlpt_level BETWEEN 1 AND 5),
    tags        text[]   NOT NULL DEFAULT '{}',
    -- pgvector: 1536-dim embedding (OpenAI text-embedding-3-small)
    embedding   vector(1536),
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vocab_category  ON content_vocabulary (category);
CREATE INDEX idx_vocab_jlpt      ON content_vocabulary (jlpt_level);
-- ANN index (build after seeding embeddings)
-- CREATE INDEX idx_vocab_embedding ON content_vocabulary
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ────────────────────────────────────────────────────────────

CREATE TABLE content_kanji (
    id           serial PRIMARY KEY,
    character    text NOT NULL UNIQUE,
    meaning      text NOT NULL,
    on_reading   text,
    kun_reading  text,
    stroke_count smallint,
    jlpt_level   smallint CHECK (jlpt_level BETWEEN 1 AND 5),
    examples     jsonb NOT NULL DEFAULT '[]',
    embedding    vector(1536),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_kanji_jlpt ON content_kanji (jlpt_level);
-- CREATE INDEX idx_kanji_embedding ON content_kanji
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
