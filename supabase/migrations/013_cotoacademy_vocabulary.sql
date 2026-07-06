-- Migration 013: Anime vocabulary from cotoacademy.com/japanese-anime-vocabulary-words/
-- ~58 new words not already in DB

INSERT INTO content_vocabulary (japanese, reading, english, category, jlpt_level) VALUES

-- ── Everyday / Common Expressions (日常) ──────────────────────────
('みんな', 'Minna', 'Everyone / Everybody', 'Everyday', 4),
('何', 'Nani', 'What?!', 'Everyday', 5),
('分かる', 'Wakaru', 'To understand / I get it', 'Everyday', 4),
('ちょっと', 'Chotto', 'Wait a moment / Just a little', 'Everyday', 4),
('違う', 'Chigau', 'That''s wrong! / To differ', 'Everyday', 4),
('よし', 'Yoshi', 'Alright! / Here we go! / OK!', 'Everyday', 3),
('よかった', 'Yokatta', 'Thank goodness! / What a relief!', 'Everyday', 3),
('ほら', 'Hora', 'Look! / Hey! / There!', 'Everyday', 3),
('久しぶり', 'Hisashiburi', 'Long time no see!', 'Everyday', 3),
('おはよう', 'Ohayou', 'Good morning!', 'Everyday', 5),
('とりあえず', 'Toiaezu', 'For now / Anyway / First of all', 'Everyday', 3),
('頑張る', 'Ganbaru', 'To do one''s best / To persevere', 'Everyday', 4),
('走る', 'Hashiru', 'To run', 'Everyday', 4),
('うまい', 'Umai', 'Delicious! / Skilled / Nice!', 'Everyday', 4),
('謝る', 'Ayamaru', 'To apologize / To say sorry', 'Everyday', 3),

-- ── Emotions / Reactions (感情) ────────────────────────────────────
('びっくり', 'Bikkuri', 'Surprised! / Shocked! / Startled!', 'Emotions', 3),
('うらやましい', 'Urayamashii', 'Jealous / Envious / I envy you', 'Emotions', 3),
('残念', 'Zannen', 'What a shame! / Disappointing / Too bad', 'Emotions', 3),
('酷い', 'Hidoi', 'That''s cruel! / Terrible / Awful', 'Emotions', 3),
('平気', 'Heiki', 'I''m fine / Don''t care / Unfazed', 'Emotions', 3),
('相変わらず', 'Aikawarazu', 'Same as always / As usual / Nothing''s changed', 'Emotions', 2),

-- ── Character / Identity (人物) ────────────────────────────────────
('お前', 'Omae', 'You (informal/rough pronoun)', 'Anime', 4),
('あいつ', 'Aitsu', 'That guy / That girl / He/She (informal)', 'Anime', 3),
('貴様', 'Kisama', 'YOU! (extremely rude / dramatic)', 'Anime', 2),
('人間', 'Ningen', 'Human being / Humans', 'Anime', 3),
('美人', 'Bijin', 'Beautiful woman / Beauty', 'Anime', 2),
('美少年', 'Bishounen', 'Beautiful young man / Bishōnen', 'Anime', 2),
('イケメン', 'Ikemen', 'Handsome guy / Good-looking man', 'Anime', 3),
('チビ', 'Chibi', 'Shorty / Tiny (teasing nickname)', 'Anime', 4),
('おっさん', 'Ossan', 'Middle-aged man (informal)', 'Anime', 3),
('やつ', 'Yatsu', 'That guy / The thing / Fella', 'Anime', 3),

-- ── Descriptors / Adjectives (形容詞) ─────────────────────────────
('怪しい', 'Ayashii', 'Suspicious / Shady / Sketchy', 'Anime', 3),
('変', 'Hen', 'Weird / Strange / Odd', 'Anime', 3),
('変態', 'Hentai', 'Pervert / Weirdo', 'Anime', 2),
('大変', 'Taihen', 'Terrible / Serious / This is bad!', 'Everyday', 4),
('若い', 'Wakai', 'Young', 'Anime', 4),
('でかい', 'Dekai', 'Huge! / Massive / Giant', 'Anime', 3),
('おしゃれ', 'Oshare', 'Stylish / Fashionable', 'Anime', 3),

-- ── Actions / Verbs (動詞) ─────────────────────────────────────────
('死ぬ', 'Shinu', 'To die', 'Anime', 4),
('殺す', 'Korosu', 'To kill', 'Battle', 3),
('逃げる', 'Nigeru', 'To run away / To escape / Flee!', 'Anime', 3),
('騙す', 'Damasu', 'To deceive / To trick / To lie', 'Anime', 3),
('黙る', 'Damaru', 'To be silent / Shut up!', 'Anime', 3),
('許す', 'Yurusu', 'To forgive / To permit', 'Anime', 3),
('ふざける', 'Fuzakeru', 'To mess around / Stop fooling!', 'Anime', 3),

-- ── Slang / Expressions (スラング・表現) ───────────────────────────
('別に', 'Betsu ni', 'Not really / Whatever / Nothing in particular', 'Anime', 4),
('ダメ', 'Dame', 'No good! / Not allowed / Useless', 'Anime', 4),
('無理', 'Muri', 'Impossible! / No way! / Can''t do it', 'Anime', 3),
('邪魔', 'Jama', 'In the way! / Nuisance / Get out!', 'Anime', 3),
('冗談', 'Joudan', 'Joke / Just kidding!', 'Anime', 3),
('さすが', 'Sasuga', 'As expected! / Impressive! / That''s you!', 'Anime', 3),
('面倒くさい', 'Mendoukusai', 'What a pain! / Bothersome / Can''t be bothered', 'Anime', 2),
('まじ', 'Maji', 'Seriously? / For real? / Are you kidding?', 'Anime', 4),
('めっちゃ', 'Meccha', 'Super / Extremely / Way too (Kansai slang)', 'Anime', 4),
('あほ', 'Aho', 'Idiot! / Dummy! (Kansai dialect)', 'Anime', 4),
('くそ', 'Kuso', 'Damn! / Crap! (strong exclamation)', 'Anime', 3),
('やれやれ', 'Yare yare', 'Good grief... / Sheesh... / What a pain', 'Anime', 3),

-- ── Battle / Competition ────────────────────────────────────────────
('相手', 'Aite', 'Opponent / Partner / Rival', 'Battle', 3),
('勝ち', 'Kachi', 'Victory / Win / I win!', 'Battle', 3),

-- ── Fantasy / Magic ─────────────────────────────────────────────────
('魔法', 'Mahou', 'Magic / Spell / Sorcery', 'Anime', 3),
('化け物', 'Bakemono', 'Monster / Goblin / Freak', 'Anime', 3),

-- ── Slang / Character Types (追加) ────────────────────────────────
('ヤンキー', 'Yankii', 'Delinquent / Young punk / Rebel', 'Anime', 3),
('キモい', 'Kimoi', 'Gross! / Disgusting! / Creepy!', 'Anime', 4),
('自分', 'Jibun', 'Myself / Oneself / I', 'Everyday', 4),
('やめる', 'Yameru', 'To stop / To quit / Cut it out!', 'Everyday', 4)

ON CONFLICT (japanese) DO NOTHING;
