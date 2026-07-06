-- Migration 014: Pronouns, character slang, and common expressions

INSERT INTO content_vocabulary (japanese, reading, english, category, jlpt_level) VALUES

-- ── First-person pronouns (一人称) ─────────────────────────────────
('俺', 'Ore', 'I / Me (masculine, rough)', 'Anime', 4),
('僕', 'Boku', 'I / Me (masculine, gentle)', 'Anime', 5),
('うち', 'Uchi', 'I / Me (feminine, casual / Kansai)', 'Anime', 4),

-- ── Second-person pronouns (二人称) ────────────────────────────────
('てめえ', 'Temee', 'YOU! (extremely rude / fighting words)', 'Anime', 3),

-- ── Insults / Character types (悪口・キャラ) ──────────────────────
('下衆', 'Gesu', 'Scumbag / Low-life / Despicable person', 'Anime', 2),
('陰キャ', 'Inkya', 'Introvert / Gloomy / Social outcast (slang)', 'Anime', 3),
('陽キャ', 'Youkya', 'Extrovert / Cheerful / Popular person (slang)', 'Anime', 3),
('カス', 'Kasu', 'Trash / Scum / Good-for-nothing', 'Anime', 3),
('クズ', 'Kuzu', 'Scum / Lowlife / Piece of garbage', 'Anime', 3),

-- ── Common expressions (日常) ──────────────────────────────────────
('腹へった', 'Hara hetta', 'I''m starving! / My stomach is empty! (casual)', 'Everyday', 4)

ON CONFLICT (japanese) DO NOTHING;
