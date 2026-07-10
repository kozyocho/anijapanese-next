-- 019: Scene-based dialogue quizzes ("What would this character say?")
-- Original example lines only — no real anime titles, characters, or direct quotes.

CREATE TABLE IF NOT EXISTS content_scene_quizzes (
    id serial PRIMARY KEY,
    scene_en text NOT NULL,
    question_type text NOT NULL CHECK (question_type IN ('fill_blank', 'choose_line')),
    prompt_jp text,
    correct_phrase text NOT NULL,
    correct_reading text NOT NULL,
    correct_meaning text NOT NULL,
    distractors jsonb NOT NULL,
    difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_scene_results (
    user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id integer NOT NULL REFERENCES content_scene_quizzes(id) ON DELETE CASCADE,
    correct_count integer NOT NULL DEFAULT 0,
    wrong_count integer NOT NULL DEFAULT 0,
    last_answered_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_scene_quizzes_difficulty ON content_scene_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_scene_results_user ON user_scene_results(user_id);

-- ==========================================================================
-- Seed data
-- Distractor patterns:
--  register  = right meaning, wrong formality / character voice
--  grammar   = subtly wrong conjugation or different nuance
--  sound     = similar sound or kanji, different meaning
--  unnatural = rude or unnatural in this situation
-- ==========================================================================

-- ---------------- BEGINNER (15) ----------------
INSERT INTO content_scene_quizzes (scene_en, question_type, prompt_jp, correct_phrase, correct_reading, correct_meaning, distractors, difficulty) VALUES
('A rival finally shows up late to the battlefield. The hero smirks and says:', 'choose_line', NULL,
 'やっと来たか', 'やっときたか', 'So you finally came.',
 '[{"phrase":"やっと来ましたね","reading":"やっときましたね","reason":"Polite form sounds wrong for a rival smirking in battle"},{"phrase":"もう来たのか","reading":"もうきたのか","reason":"Means you came already (too early) — opposite nuance of finally"},{"phrase":"やっと行くか","reading":"やっといくか","reason":"Uses 行く (to go) instead of 来る (to come) — wrong direction"}]'::jsonb,
 'beginner'),

('The hero sees something unbelievable happen right in front of them:', 'choose_line', NULL,
 'まさか…', 'まさか', 'No way... / It cannot be...',
 '[{"phrase":"もちろん…","reading":"もちろん","reason":"Means of course — expresses certainty, not disbelief"},{"phrase":"まさに…","reading":"まさに","reason":"Similar sound but means exactly / indeed — confirms instead of doubting"},{"phrase":"そうですね…","reading":"そうですね","reason":"Polite agreement — far too calm for a shocking moment"}]'::jsonb,
 'beginner'),

('An angry character storms off after an argument, telling the other person to do whatever they want:', 'choose_line', NULL,
 '勝手にしろ', 'かってにしろ', 'Do whatever you want. (dismissive)',
 '[{"phrase":"勝手にしてください","reading":"かってにしてください","reason":"Polite request form kills the angry dismissive tone"},{"phrase":"勝手にしよう","reading":"かってにしよう","reason":"Volitional (let us do) instead of imperative — wrong form"},{"phrase":"一緒にしろ","reading":"いっしょにしろ","reason":"Means do it together — opposite of leaving someone alone"}]'::jsonb,
 'beginner'),

('A character blocks the doorway and refuses to let the villain pass:', 'choose_line', NULL,
 '通さないぞ', 'とおさないぞ', 'I will not let you through!',
 '[{"phrase":"通れないぞ","reading":"とおれないぞ","reason":"Potential form means I cannot pass — about oneself, not blocking"},{"phrase":"お通しできません","reading":"おとおしできません","reason":"Sounds like restaurant staff — wrong register for a showdown"},{"phrase":"通っていいぞ","reading":"とおっていいぞ","reason":"Gives permission to pass — the opposite of blocking"}]'::jsonb,
 'beginner'),

('A friend is about to give up mid-battle. The hero shouts encouragement:', 'choose_line', NULL,
 'あきらめるな', 'あきらめるな', 'Do not give up!',
 '[{"phrase":"あきらめよう","reading":"あきらめよう","reason":"Volitional — suggests let us give up, the opposite message"},{"phrase":"あきらめてください","reading":"あきらめてください","reason":"Politely asks the friend to give up — wrong meaning and register"},{"phrase":"あきらめたな","reading":"あきらめたな","reason":"Past tense observation you gave up huh — no encouragement"}]'::jsonb,
 'beginner'),

('The hero charges at the enemy with a battle cry meaning here I come:', 'choose_line', NULL,
 '行くぞ！', 'いくぞ', 'Here I go! / Let us go!',
 '[{"phrase":"行きますよ！","reading":"いきますよ","reason":"Polite form is too soft for a battle charge"},{"phrase":"来るぞ！","reading":"くるぞ","reason":"Means something is coming (toward us) — a warning, not a charge"},{"phrase":"行けよ！","reading":"いけよ","reason":"Imperative telling someone else to go — not announcing your own move"}]'::jsonb,
 'beginner'),

('A character senses danger and warns everyone to run:', 'choose_line', NULL,
 '逃げろ！', 'にげろ', 'Run! / Get away!',
 '[{"phrase":"逃げよう！","reading":"にげよう","reason":"Volitional let us run — softer, includes self, weaker as a warning shout"},{"phrase":"逃げるな！","reading":"にげるな","reason":"Negative imperative do NOT run — the opposite command"},{"phrase":"お逃げになって","reading":"おにげになって","reason":"Honorific sounds like a butler — absurd register in an emergency"}]'::jsonb,
 'beginner'),

('After winning a long battle, the exhausted hero says it is finally over:', 'choose_line', NULL,
 '終わったな', 'おわったな', 'It is over now.',
 '[{"phrase":"終わりましたね","reading":"おわりましたね","reason":"Polite form feels stiff for a battle-worn murmur to a comrade"},{"phrase":"終わらないな","reading":"おわらないな","reason":"Negative — means it never ends, opposite meaning"},{"phrase":"始まったな","reading":"はじまったな","reason":"Means it has begun — opposite end of the story"}]'::jsonb,
 'beginner'),

('A character catches their friend sneaking snacks and calls them out playfully:', 'choose_line', NULL,
 '見たぞ', 'みたぞ', 'I saw that!',
 '[{"phrase":"見ましたよ","reading":"みましたよ","reason":"Polite form loses the playful gotcha tone between friends"},{"phrase":"見えたぞ","reading":"みえたぞ","reason":"Means it became visible — about ability to see, not catching someone"},{"phrase":"見ろよ","reading":"みろよ","reason":"Imperative look! — telling them to look, not saying you saw"}]'::jsonb,
 'beginner'),

('The mentor tells the young hero it is too early to celebrate:', 'choose_line', NULL,
 'まだだ', 'まだだ', 'Not yet.',
 '[{"phrase":"もうだ","reading":"もうだ","reason":"もう means already — ungrammatical here and opposite nuance of まだ"},{"phrase":"まだです","reading":"まだです","reason":"Polite form is too formal for a gruff mentor mid-battle"},{"phrase":"もういい","reading":"もういい","reason":"Means that is enough / forget it — resignation, not vigilance"}]'::jsonb,
 'beginner'),

('A character swears they will absolutely win the upcoming match:', 'choose_line', NULL,
 '絶対勝つ', 'ぜったいかつ', 'I will definitely win.',
 '[{"phrase":"絶対勝った","reading":"ぜったいかった","reason":"Past tense — the match has not happened yet"},{"phrase":"絶対勝とう","reading":"ぜったいかとう","reason":"Volitional let us win — a group suggestion, not a personal vow"},{"phrase":"絶対買う","reading":"ぜったいかう","reason":"Same sound かう but means to buy — wrong kanji and meaning"}]'::jsonb,
 'beginner'),

('Someone thanks the stoic hero, who brushes it off saying it was nothing:', 'choose_line', NULL,
 '別に', 'べつに', 'It is nothing. / Whatever.',
 '[{"phrase":"どういたしまして","reading":"どういたしまして","reason":"Textbook polite you are welcome — breaks the stoic character voice"},{"phrase":"別で","reading":"べつで","reason":"Means separately — a logistics word, not a brush-off"},{"phrase":"確かに","reading":"たしかに","reason":"Means indeed / true — agreeing, not deflecting thanks"}]'::jsonb,
 'beginner'),

('The hero promises a crying child they will definitely come back:', 'choose_line', NULL,
 '必ず戻る', 'かならずもどる', 'I will come back for sure.',
 '[{"phrase":"必ず戻れ","reading":"かならずもどれ","reason":"Imperative orders the child to return — the promise reversed"},{"phrase":"多分戻る","reading":"たぶんもどる","reason":"多分 means maybe — far too weak for a hero promise"},{"phrase":"必ず戻った","reading":"かならずもどった","reason":"Past tense — cannot promise something already done"}]'::jsonb,
 'beginner'),

('A character notices someone eavesdropping behind the door and says who is there:', 'choose_line', NULL,
 '誰だ！', 'だれだ', 'Who is there?!',
 '[{"phrase":"誰ですか？","reading":"だれですか","reason":"Polite question too calm for catching an intruder"},{"phrase":"どれだ！","reading":"どれだ","reason":"Means which one — asking about things, not a person"},{"phrase":"誰か！","reading":"だれか","reason":"Means somebody (help)! — a call for help, not a challenge"}]'::jsonb,
 'beginner'),

('The team captain rallies everyone before the final match:', 'choose_line', NULL,
 '行くしかない', 'いくしかない', 'We have no choice but to go.',
 '[{"phrase":"行くだけない","reading":"いくだけない","reason":"だけない is ungrammatical — しかない is the correct pattern"},{"phrase":"行かなくていい","reading":"いかなくていい","reason":"Means we do not have to go — removes all urgency"},{"phrase":"行けばよかった","reading":"いけばよかった","reason":"Means I wish we had gone — past regret, not resolve"}]'::jsonb,
 'beginner');

-- ---------------- INTERMEDIATE (15) ----------------
INSERT INTO content_scene_quizzes (scene_en, question_type, prompt_jp, correct_phrase, correct_reading, correct_meaning, distractors, difficulty) VALUES
('A usually cheerful friend is quiet and gloomy today. The character remarks:', 'choose_line', NULL,
 'らしくないな', 'らしくないな', 'That is not like you.',
 '[{"phrase":"らしいな","reading":"らしいな","reason":"Means that is just like you / apparently — opposite of unusual"},{"phrase":"君らしいよ","reading":"きみらしいよ","reason":"Affirms it IS like them — reversed meaning"},{"phrase":"好きじゃないな","reading":"すきじゃないな","reason":"Means I do not like it — a preference, not an observation of change"}]'::jsonb,
 'intermediate'),

('The wounded hero tells their comrade to leave them behind:', 'fill_blank', '俺に構わず＿＿＿',
 '先に行け', 'さきにいけ', 'Go on ahead (without me).',
 '[{"phrase":"先に行く","reading":"さきにいく","reason":"Plain form states I will go ahead — not a command to the comrade"},{"phrase":"先に来い","reading":"さきにこい","reason":"Means come here first — wrong direction verb"},{"phrase":"先に行こう","reading":"さきにいこう","reason":"Volitional let us go together — defeats the point of leaving them behind"}]'::jsonb,
 'intermediate'),

('A detective character finally connects the clues and mutters:', 'choose_line', NULL,
 'そういうことか', 'そういうことか', 'So that is what this is about.',
 '[{"phrase":"そういうことだ","reading":"そういうことだ","reason":"Declarative — sounds like explaining to others, not realizing yourself"},{"phrase":"どういうことだ","reading":"どういうことだ","reason":"Means what is going on — still confused, not enlightened"},{"phrase":"そういうことで","reading":"そういうことで","reason":"Means with that said — a transition phrase for wrapping up meetings"}]'::jsonb,
 'intermediate'),

('A character warns their overconfident rival not to underestimate them:', 'choose_line', NULL,
 'なめるなよ', 'なめるなよ', 'Do not underestimate me.',
 '[{"phrase":"なめろよ","reading":"なめろよ","reason":"Imperative without な — commands them TO underestimate (or lick) — reversed"},{"phrase":"なめないでくださいね","reading":"なめないでくださいね","reason":"Polite request deflates the tough-guy warning entirely"},{"phrase":"やめるなよ","reading":"やめるなよ","reason":"Similar sound but means do not quit — different verb"}]'::jsonb,
 'intermediate'),

('The captain accepts responsibility for the mission failure:', 'fill_blank', '責任は俺が＿＿＿',
 '取る', 'とる', 'I will take (responsibility).',
 '[{"phrase":"撮る","reading":"とる","reason":"Same sound but means to take a photo — wrong kanji"},{"phrase":"取れる","reading":"とれる","reason":"Potential form means can be taken / comes off — not a declaration of resolve"},{"phrase":"預かる","reading":"あずかる","reason":"Means to hold temporarily for someone — dodges true responsibility"}]'::jsonb,
 'intermediate'),

('A character sees their friend about to make a reckless deal and cuts in:', 'choose_line', NULL,
 '話にならない', 'はなしにならない', 'This is not even worth discussing.',
 '[{"phrase":"話さない","reading":"はなさない","reason":"Just means I will not talk — no nuance of absurdity"},{"phrase":"話になった","reading":"はなしになった","reason":"Past tense — means it became a proper discussion, reversed"},{"phrase":"話せばわかる","reading":"はなせばわかる","reason":"Means we can work it out by talking — conciliatory, not dismissive"}]'::jsonb,
 'intermediate'),

('An underling reports to the calm villain that the plan failed. The villain replies coldly:', 'choose_line', NULL,
 'そうか', 'そうか', 'I see. (cold, measured)',
 '[{"phrase":"マジで！？","reading":"マジで","reason":"Slangy shock breaks the calm villain register completely"},{"phrase":"そうですか","reading":"そうですか","reason":"Polite form — a boss does not speak up to an underling"},{"phrase":"どうか","reading":"どうか","reason":"Means please / somehow — a plea, not an acknowledgment"}]'::jsonb,
 'intermediate'),

('The hero, badly beaten, slowly stands up one more time:', 'choose_line', NULL,
 'まだ終わってない', 'まだおわってない', 'It is not over yet.',
 '[{"phrase":"もう終わってる","reading":"もうおわってる","reason":"Means it is already over — surrender, not defiance"},{"phrase":"まだ終わらせない","reading":"まだおわらせない","reason":"Causative I will not LET it end — close, but stronger agency than the set phrase and slightly unnatural alone"},{"phrase":"まだ始まってない","reading":"まだはじまってない","reason":"Means it has not started yet — wrong verb for a mid-battle comeback"}]'::jsonb,
 'intermediate'),

('A character reluctantly agrees to help, making clear it is a one-time thing:', 'fill_blank', '今回＿＿＿だぞ',
 'だけ', 'だけ', 'Only (this time).',
 '[{"phrase":"だけど","reading":"だけど","reason":"Means but / however — a conjunction, not the limiter だけ"},{"phrase":"しか","reading":"しか","reason":"しか requires a negative verb (しか…ない) — ungrammatical with だぞ"},{"phrase":"ばかり","reading":"ばかり","reason":"Means nothing but / always — implies repetition, opposite of one-time"}]'::jsonb,
 'intermediate'),

('The strategist realizes the enemy deliberately let them win the last round:', 'choose_line', NULL,
 'わざとか', 'わざとか', 'So it was on purpose.',
 '[{"phrase":"わずかか","reading":"わずかか","reason":"Similar sound but わずか means slight / few — different word"},{"phrase":"わざわざか","reading":"わざわざか","reason":"わざわざ means going out of the way (effort) — not deliberate deception"},{"phrase":"たまたまか","reading":"たまたまか","reason":"Means by coincidence — the exact opposite of on purpose"}]'::jsonb,
 'intermediate'),

('A character stops their friend from apologizing, saying it is not their fault:', 'choose_line', NULL,
 '君のせいじゃない', 'きみのせいじゃない', 'It is not your fault.',
 '[{"phrase":"君のおかげじゃない","reading":"きみのおかげじゃない","reason":"おかげ is credit for good things — wrong word for blame"},{"phrase":"君のせいだ","reading":"きみのせいだ","reason":"Directly blames them — the opposite of comforting"},{"phrase":"君のせいかもしれない","reading":"きみのせいかもしれない","reason":"Means it might be your fault — undermines the reassurance"}]'::jsonb,
 'intermediate'),

('Facing a stronger opponent, the character refuses to back down:', 'fill_blank', '逃げるわけには＿＿＿',
 'いかない', 'いかない', 'I cannot (run away). — set phrase わけにはいかない',
 '[{"phrase":"いけない","reading":"いけない","reason":"わけにはいけない is a common learner error — the set phrase requires いかない"},{"phrase":"ならない","reading":"ならない","reason":"なければならない takes ならない, but わけには does not"},{"phrase":"いく","reading":"いく","reason":"Affirmative — わけにはいく is not a valid expression"}]'::jsonb,
 'intermediate'),

('A character hears a suspicious noise from the supposedly empty warehouse:', 'choose_line', NULL,
 '誰かいるのか', 'だれかいるのか', 'Is someone there?',
 '[{"phrase":"誰かあるのか","reading":"だれかあるのか","reason":"ある is for inanimate objects — people take いる"},{"phrase":"誰もいるのか","reading":"だれもいるのか","reason":"誰も pairs with negatives (誰もいない) — ungrammatical in a question like this"},{"phrase":"誰がいるのか","reading":"だれがいるのか","reason":"Asks WHO is there — presumes someone is, subtly different from checking IF anyone is"}]'::jsonb,
 'intermediate'),

('The mentor watches the student master a difficult move and murmurs approvingly:', 'choose_line', NULL,
 'よくやった', 'よくやった', 'Well done.',
 '[{"phrase":"よくやる","reading":"よくやる","reason":"Present tense means they often do it — or sarcastic unbelievable — not praise for this moment"},{"phrase":"よくできました","reading":"よくできました","reason":"Teacher-to-small-child sticker phrase — condescending for a mentor of warriors"},{"phrase":"やってよかった","reading":"やってよかった","reason":"Means I am glad I did it — about oneself, not praising another"}]'::jsonb,
 'intermediate'),

('A character declares they will settle things with their rival once and for all:', 'fill_blank', 'ここで決着を＿＿＿',
 'つける', 'つける', 'To settle it. — set phrase 決着をつける',
 '[{"phrase":"つく","reading":"つく","reason":"Intransitive 決着がつく — with を you need transitive つける"},{"phrase":"きめる","reading":"きめる","reason":"決める means to decide — 決着 pairs with つける, not きめる"},{"phrase":"とる","reading":"とる","reason":"取る does not collocate with 決着 — wrong verb pairing"}]'::jsonb,
 'intermediate');

-- ---------------- ADVANCED (15) ----------------
INSERT INTO content_scene_quizzes (scene_en, question_type, prompt_jp, correct_phrase, correct_reading, correct_meaning, distractors, difficulty) VALUES
('Knocked down repeatedly, the hero grips the ground and growls:', 'choose_line', NULL,
 'まだ立てる', 'まだたてる', 'I can still stand.',
 '[{"phrase":"まだ立てない","reading":"まだたてない","reason":"Means I still cannot stand — one syllable flips the resolve to defeat"},{"phrase":"まだ立ってる","reading":"まだたってる","reason":"Means I am still standing — a state, not the willpower to rise again"},{"phrase":"また立てる","reading":"またたてる","reason":"また (again) vs まだ (still) — I can stand again lacks the defiant nuance of still"}]'::jsonb,
 'advanced'),

('The strategist looks at the board and declares the opponent has no moves left:', 'fill_blank', 'これで＿＿＿だ',
 '詰み', 'つみ', 'Checkmate. (game over)',
 '[{"phrase":"罪","reading":"つみ","reason":"Homophone meaning sin / crime — wrong kanji entirely"},{"phrase":"積み","reading":"つみ","reason":"Homophone meaning stacking / piling — wrong kanji"},{"phrase":"詰まり","reading":"つまり","reason":"Means blockage, or in other words as つまり — not the shogi term for checkmate"}]'::jsonb,
 'advanced'),

('A tsundere character does a favor, then denies caring about it:', 'choose_line', NULL,
 '勘違いしないでよね', 'かんちがいしないでよね', 'Do not get the wrong idea, okay?!',
 '[{"phrase":"勘違いしてよね","reading":"かんちがいしてよね","reason":"Dropping ない tells them TO misunderstand — reversed"},{"phrase":"勘違いなさらないでください","reading":"かんちがいなさらないでください","reason":"Keigo is completely wrong for a flustered tsundere outburst"},{"phrase":"間違いしないでよね","reading":"まちがいしないでよね","reason":"間違い does not take する like this (間違えない) — and 勘違い specifically means misreading intentions"}]'::jsonb,
 'advanced'),

('After a long buildup, the character announces the real fight starts now:', 'fill_blank', 'ここからが＿＿＿だ',
 '本番', 'ほんばん', 'The real thing / the main event.',
 '[{"phrase":"本場","reading":"ほんば","reason":"Shares 本 but means place of origin (like authentic cuisine regions)"},{"phrase":"本音","reading":"ほんね","reason":"Means true feelings — what you really think, not the real round"},{"phrase":"本題","reading":"ほんだい","reason":"Means the main topic of a discussion — for meetings, not battles"}]'::jsonb,
 'advanced'),

('A defeated villain, sparing the hero a final compliment, admits the loss:', 'choose_line', NULL,
 '俺の負けだ', 'おれのまけだ', 'It is my loss. (I concede.)',
 '[{"phrase":"俺は負けない","reading":"おれはまけない","reason":"Means I will not lose — continued defiance, not concession"},{"phrase":"俺が負けそうだ","reading":"おれがまけそうだ","reason":"Means I am about to lose — mid-fight prediction, not the formal concession noun form"},{"phrase":"俺に負けたな","reading":"おれにまけたな","reason":"Means you lost to me — declares victory instead of defeat"}]'::jsonb,
 'advanced'),

('The stoic swordsman warns that the next strike ends everything:', 'fill_blank', '次の一撃で＿＿＿',
 '仕留める', 'しとめる', 'I will finish (you) off.',
 '[{"phrase":"仕上げる","reading":"しあげる","reason":"Shares 仕 but means to finish a task or craft — not to slay"},{"phrase":"止める","reading":"とめる","reason":"Means to stop — halting an attack, not finishing an opponent"},{"phrase":"認める","reading":"みとめる","reason":"Similar ending sound but means to acknowledge — unrelated"}]'::jsonb,
 'advanced'),

('A character quietly vows revenge at a comrade''s grave:', 'choose_line', NULL,
 'この借りは必ず返す', 'このかりはかならずかえす', 'I will repay this debt without fail.',
 '[{"phrase":"この貸しは必ず返す","reading":"このかしはかならずかえす","reason":"貸し is what OTHERS owe YOU — a debt you are owed cannot be repaid by you"},{"phrase":"この借りは必ず帰す","reading":"このかりはかならずかえす","reason":"Homophone 帰す means to send someone home — wrong kanji"},{"phrase":"この借りは必ず借りる","reading":"このかりはかならずかりる","reason":"Means I will borrow it — circular and nonsensical"}]'::jsonb,
 'advanced'),

('The rival grudgingly acknowledges the hero''s growth after their rematch:', 'choose_line', NULL,
 '腕を上げたな', 'うでをあげたな', 'You have improved. (idiom: raised your arm = skill)',
 '[{"phrase":"腕が上がったな","reading":"うでがあがったな","reason":"Grammatical but the transitive を上げた credits their effort — が上がった sounds like it happened on its own; を is the natural idiom here"},{"phrase":"手を上げたな","reading":"てをあげたな","reason":"手を上げる means to raise a hand / hit someone or surrender — different idiom"},{"phrase":"足を上げたな","reading":"あしをあげたな","reason":"足を上げる is literally lifting a leg — no idiomatic meaning of skill"}]'::jsonb,
 'advanced'),

('A character senses the barrier is about to break and warns the team:', 'fill_blank', '結界が＿＿＿ぞ',
 '破られる', 'やぶられる', 'The barrier is being broken (by the enemy).',
 '[{"phrase":"破れる","reading":"やぶれる","reason":"Intransitive — it tears on its own; passive 破られる implies enemy agency, the right nuance"},{"phrase":"敗れる","reading":"やぶれる","reason":"Homophone meaning to be defeated (in a match) — wrong kanji for objects"},{"phrase":"破る","reading":"やぶる","reason":"Active — WE break it; reversed agent"}]'::jsonb,
 'advanced'),

('An elite butler character politely but firmly refuses an unreasonable order:', 'choose_line', NULL,
 'それは致しかねます', 'それはいたしかねます', 'I am afraid I cannot do that. (humble refusal)',
 '[{"phrase":"それは致しかねません","reading":"それはいたしかねません","reason":"かねません means might possibly do — double-negative trap reverses the refusal"},{"phrase":"それは無理っす","reading":"それはむりっす","reason":"Casual slang destroys the elite butler register"},{"phrase":"それは致します","reading":"それはいたします","reason":"Means I WILL do it — dropping かね flips acceptance"}]'::jsonb,
 'advanced'),

('The commander orders the squad to hold the line no matter what:', 'fill_blank', '何があっても持ち＿＿＿',
 'こたえろ', 'こたえろ', 'Hold out / endure. (持ちこたえる)',
 '[{"phrase":"あげろ","reading":"あげろ","reason":"持ち上げる means to lift up — wrong compound"},{"phrase":"かえろ","reading":"かえろ","reason":"持ち帰る means to take home — wrong compound"},{"phrase":"こたえて","reading":"こたえて","reason":"Te-form is a soft request — a commander barks the imperative ろ"}]'::jsonb,
 'advanced'),

('A character realizes too late they walked into a trap:', 'choose_line', NULL,
 'はめられた', 'はめられた', 'I was set up. (passive of はめる)',
 '[{"phrase":"はめた","reading":"はめた","reason":"Active — means I set someone up; reversed agent"},{"phrase":"はまった","reading":"はまった","reason":"Intransitive — I fell into it / got hooked on it; loses the someone did this to me nuance"},{"phrase":"ほめられた","reading":"ほめられた","reason":"One sound off — means I was praised"}]'::jsonb,
 'advanced'),

('The veteran warns the rookie the enemy is only pretending to retreat:', 'fill_blank', 'あれは＿＿＿だ',
 '見せかけ', 'みせかけ', 'A facade / a feint.',
 '[{"phrase":"見せしめ","reading":"みせしめ","reason":"Similar form but means making an example of someone (public punishment)"},{"phrase":"見た目","reading":"みため","reason":"Means outward appearance of things — not a deliberate deception tactic"},{"phrase":"見どころ","reading":"みどころ","reason":"Means highlight / promising point — positive word, unrelated"}]'::jsonb,
 'advanced'),

('The hero entrusts everything to their final attack:', 'choose_line', NULL,
 'これに全てを懸ける', 'これにすべてをかける', 'I stake everything on this.',
 '[{"phrase":"これに全てを掛ける","reading":"これにすべてをかける","reason":"掛ける is hang or multiply — 懸ける is the kanji for staking/risking"},{"phrase":"これに全てを欠ける","reading":"これにすべてをかける","reason":"欠ける means to lack / be chipped — and it is intransitive, ungrammatical with を"},{"phrase":"これで全てが終わる","reading":"これですべてがおわる","reason":"Means everything ends with this — fatalistic, no nuance of betting on victory"}]'::jsonb,
 'advanced'),

('A quiet character finally snaps at their manipulative superior:', 'choose_line', NULL,
 'いい加減にしろ', 'いいかげんにしろ', 'Enough already! / Cut it out!',
 '[{"phrase":"いい加減だな","reading":"いいかげんだな","reason":"As a na-adjective いい加減 means sloppy / half-hearted — an insult about their work, not a demand to stop"},{"phrase":"いい感じにしろ","reading":"いいかんじにしろ","reason":"Similar sound but means make it nice — absurd here"},{"phrase":"いい加減にしてもいい","reading":"いいかげんにしてもいい","reason":"Means you may cut it out — permission form guts the outburst"}]'::jsonb,
 'advanced');
