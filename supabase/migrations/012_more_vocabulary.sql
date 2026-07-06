-- Migration 012: Additional anime vocabulary (~50 words)
-- Focus: everyday phrases, emotions, relationships, romance, core nouns

INSERT INTO content_vocabulary (japanese, reading, english, category, jlpt_level) VALUES

-- ── Everyday Anime Phrases (日常) ──────────────────────────────────
('ただいま', 'Tadaima', 'I''m home! (said when returning)', 'Everyday', 5),
('おかえり', 'Okaeri', 'Welcome home!', 'Everyday', 5),
('痛い', 'Itai', 'Ouch! / It hurts!', 'Everyday', 5),
('やめて', 'Yamete', 'Stop it! / Please stop!', 'Everyday', 5),
('待って', 'Matte', 'Wait! / Hold on!', 'Everyday', 5),
('本当', 'Hontou', 'Really / Truth / Seriously', 'Everyday', 5),
('嘘', 'Uso', 'Lie / No way! / You''re kidding!', 'Everyday', 4),
('危ない', 'Abunai', 'Dangerous! / Watch out!', 'Everyday', 4),

-- ── Core Nouns (基本語彙) ──────────────────────────────────────────
('夢', 'Yume', 'Dream', 'Anime', 4),
('心', 'Kokoro', 'Heart / Mind / Soul', 'Anime', 4),
('魂', 'Tamashii', 'Soul / Spirit', 'Anime', 3),
('力', 'Chikara', 'Power / Strength', 'Anime', 4),
('言葉', 'Kotoba', 'Words / Language', 'Anime', 4),
('声', 'Koe', 'Voice', 'Anime', 4),
('涙', 'Namida', 'Tears', 'Emotions', 4),
('笑顔', 'Egao', 'Smile / Smiling face', 'Anime', 3),
('敵', 'Teki', 'Enemy / Foe', 'Anime', 4),
('大切', 'Taisetsu', 'Precious / Important / Dear', 'Anime', 4),
('無駄', 'Muda', 'Useless / Futile / Pointless', 'Anime', 3),

-- ── Emotions (感情) ────────────────────────────────────────────────
('嬉しい', 'Ureshii', 'Happy / I''m so happy!', 'Emotions', 5),
('悲しい', 'Kanashii', 'Sad / Heartbreaking', 'Emotions', 5),
('こわい', 'Kowai', 'Scary / I''m scared!', 'Emotions', 4),
('寂しい', 'Sabishii', 'Lonely / I miss you', 'Emotions', 4),
('悔しい', 'Kuyashii', 'Frustrating / Mortifying (at defeat)', 'Emotions', 3),
('イライラ', 'Iraira', 'Irritated / Frustrated', 'Emotions', 3),
('ワクワク', 'Wakuwaku', 'Excited / Thrilling / Anticipation', 'Emotions', 4),
('切ない', 'Setsunai', 'Bittersweet sadness / Aching longing', 'Emotions', 2),
('懐かしい', 'Natsukashii', 'Nostalgic / That takes me back!', 'Emotions', 3),
('気持ち', 'Kimochi', 'Feeling / Emotion / Mood', 'Emotions', 3),
('怒る', 'Okoru', 'To get angry / To lose one''s temper', 'Emotions', 4),

-- ── Characters / Personality (性格) ───────────────────────────────
('優しい', 'Yasashii', 'Kind / Gentle / Sweet', 'Anime', 5),
('強い', 'Tsuyoi', 'Strong / Powerful', 'Anime', 5),
('弱い', 'Yowai', 'Weak / Powerless', 'Anime', 5),
('素直', 'Sunao', 'Honest / Straightforward / Obedient', 'Anime', 2),
('鈍感', 'Donkan', 'Dense / Unperceptive (dense protagonist trope)', 'Anime', 2),

-- ── Relationships (人間関係) ───────────────────────────────────────
('先輩', 'Senpai', 'Upperclassman / Senior / Mentor', 'School', 4),
('後輩', 'Kouhai', 'Junior / Underclassman', 'School', 4),
('仲間', 'Nakama', 'Friend / Companion / Comrade', 'Anime', 3),
('幼なじみ', 'Osananajimi', 'Childhood friend', 'Romance', 3),

-- ── Romance (恋愛) ─────────────────────────────────────────────────
('好き', 'Suki', 'Like / I like you / Favorite', 'Romance', 5),
('大好き', 'Daisuki', 'Love / I love you! / My favorite', 'Romance', 5),
('愛', 'Ai', 'Love (deep / unconditional)', 'Romance', 3),
('恋', 'Koi', 'Romantic love / Crush', 'Romance', 3),
('彼氏', 'Kareshi', 'Boyfriend', 'Romance', 4),
('彼女', 'Kanojo', 'Girlfriend / She', 'Romance', 4),
('愛してる', 'Aishiteru', 'I love you (strongest expression)', 'Romance', 3),
('気になる', 'Ki ni naru', 'Can''t stop thinking about / Interested in', 'Romance', 3),

-- ── Battle / Action (戦闘) ─────────────────────────────────────────
('変身', 'Henshin', 'Transformation! / Henshin!', 'Anime', 3),
('必殺技', 'Hissatsu waza', 'Finishing move / Special attack', 'Battle', 2)

ON CONFLICT (japanese) DO NOTHING;
