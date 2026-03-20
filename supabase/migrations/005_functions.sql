-- Migration 005: Utility functions & views

-- user_progress view (used on home dashboard) ────────────────
CREATE VIEW user_progress AS
SELECT
    p.id,
    p.xp,
    p.jlpt_label,
    p.jlpt_level,
    p.current_streak,
    p.longest_streak,
    p.minutes_per_day,
    COUNT(DISTINCT ulk.kana_id)
        FILTER (WHERE ck.type = 'hiragana') AS hiragana_learned,
    COUNT(DISTINCT ulk.kana_id)
        FILTER (WHERE ck.type = 'katakana') AS katakana_learned,
    (SELECT COUNT(*) FROM content_kana WHERE type = 'hiragana') AS hiragana_total,
    (SELECT COUNT(*) FROM content_kana WHERE type = 'katakana') AS katakana_total,
    COUNT(DISTINCT ulv.vocab_id) AS vocab_learned,
    (SELECT COUNT(*) FROM content_vocabulary)  AS vocab_total,
    COUNT(DISTINCT ulj.kanji_id) AS kanji_learned,
    (SELECT COUNT(*) FROM content_kanji)       AS kanji_total,
    COUNT(DISTINCT si.id)
        FILTER (WHERE si.next_review_at <= now()) AS srs_due,
    COUNT(DISTINCT si.id) AS srs_total
FROM profiles p
LEFT JOIN user_learned_kana ulk ON ulk.user_id = p.id
LEFT JOIN content_kana ck       ON ck.id = ulk.kana_id
LEFT JOIN user_learned_vocabulary ulv ON ulv.user_id = p.id
LEFT JOIN user_learned_kanji ulj      ON ulj.user_id = p.id
LEFT JOIN srs_items si                ON si.user_id = p.id
GROUP BY p.id;

-- Expose view through RLS (authenticated users see only their row)
ALTER VIEW user_progress OWNER TO authenticated;

-- ── Semantic similarity search function (pgvector) ──────────
CREATE OR REPLACE FUNCTION search_similar_vocab(
    query_embedding vector(1536),
    match_count     int     DEFAULT 5,
    max_jlpt_level  smallint DEFAULT 5
)
RETURNS TABLE (
    id          int,
    japanese    text,
    english     text,
    reading     text,
    category    text,
    similarity  float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        cv.id,
        cv.japanese,
        cv.english,
        cv.reading,
        cv.category,
        1 - (cv.embedding <=> query_embedding) AS similarity
    FROM content_vocabulary cv
    WHERE cv.jlpt_level <= max_jlpt_level
      AND cv.embedding IS NOT NULL
    ORDER BY cv.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- ── Smart distractor generation (for quiz options) ──────────
CREATE OR REPLACE FUNCTION get_similar_answers(
    target_vocab_id int,
    num_distractors int DEFAULT 3
)
RETURNS TABLE (english text)
LANGUAGE sql STABLE
AS $$
    SELECT cv.english
    FROM content_vocabulary cv
    WHERE cv.id != target_vocab_id
      AND cv.embedding IS NOT NULL
    ORDER BY cv.embedding <=> (
        SELECT embedding FROM content_vocabulary WHERE id = target_vocab_id
    )
    LIMIT num_distractors;
$$;
