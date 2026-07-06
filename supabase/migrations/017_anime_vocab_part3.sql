-- Migration 017: Anime vocabulary part 3 - remaining words (~180 words)

INSERT INTO content_vocabulary (japanese, reading, english, category, jlpt_level) VALUES

-- ── Fantasy Realms (世界・次元) ─────────────────────────────────────
('魔界', 'Makai', 'Demon world / Demon realm', 'Fantasy', 3),
('冥界', 'Meikai', 'Underworld / Realm of the dead', 'Fantasy', 2),
('天界', 'Tenkai', 'Heavenly realm / Celestial world', 'Fantasy', 2),
('異空間', 'Ikuukan', 'Alternate space / Pocket dimension', 'Fantasy', 2),
('天空', 'Tenkuu', 'The sky / Heavens / High above', 'Fantasy', 3),
('聖域', 'Seiiki', 'Sacred ground / Holy territory', 'Fantasy', 2),
('神域', 'Shin''iki', 'Divine domain / Sacred area of a god', 'Fantasy', 2),

-- ── Time / Special Abilities (時間・特殊能力) ──────────────────────
('時間停止', 'Jikan teishi', 'Time stop / Freezing time', 'Fantasy', 2),
('時間逆行', 'Jikan gyakkō', 'Time reversal / Rewinding time', 'Fantasy', 2),
('未来視', 'Miraiashi', 'Precognition / Future vision / Foresight', 'Fantasy', 2),
('千里眼', 'Senrigan', 'Clairvoyance / All-seeing eye', 'Fantasy', 2),
('読心', 'Dokushin', 'Mind reading / Telepathy', 'Fantasy', 2),
('念話', 'Nenwa', 'Telepathic communication / Mind speech', 'Fantasy', 1),
('幻覚', 'Genkaku', 'Hallucination / Illusion / Visual deception', 'Fantasy', 2),
('神気', 'Shinki', 'Divine energy / Godly aura', 'Fantasy', 2),
('支配', 'Shihai', 'Control / Domination / Rule', 'Anime', 3),

-- ── Bloodline / Succession (血筋・継承) ───────────────────────────
('血筋', 'Chisuji', 'Bloodline / Family lineage', 'Fantasy', 3),
('一族', 'Ichizoku', 'Clan / Family / Tribe', 'Anime', 3),
('王家', 'Ouke', 'Royal family / Royal house', 'Fantasy', 2),
('名門', 'Meimon', 'Prestigious family / Noble house', 'Fantasy', 2),
('分家', 'Bunke', 'Branch family / Cadet branch', 'Fantasy', 2),
('本家', 'Honke', 'Main family / Main house / Head family', 'Fantasy', 2),
('血統', 'Kettou', 'Bloodline / Pedigree / Lineage', 'Fantasy', 2),
('後継者', 'Koukeisha', 'Successor / Heir / Inheritor', 'Anime', 2),
('継承', 'Keishou', 'Succession / Inheritance / Taking over', 'Anime', 2),
('継承者', 'Keishousha', 'Successor / Person of inheritance', 'Anime', 2),
('遺志', 'Ishi', 'Dying wish / Will of the deceased / Last wish', 'Anime', 2),
('皇子', 'Ouji', 'Imperial prince (son of emperor)', 'Fantasy', 2),
('眷族', 'Kenzoku', 'Kin / Followers / Creatures of the same bloodline', 'Fantasy', 1),

-- ── Forms / Power States (形態・状態) ─────────────────────────────
('第二形態', 'Daini keitai', 'Second form / Phase 2', 'Anime', 2),
('究極形態', 'Kyuukyoku keitai', 'Ultimate form / Final evolution', 'Anime', 2),
('真価', 'Shinka', 'True value / Full potential / Real worth', 'Anime', 2),
('覚悟完了', 'Kakugo kanryou', 'Resolve complete / Fully prepared / Ready to die', 'Anime', 2),

-- ── Battle / Tactics (戦術・戦闘詳細) ─────────────────────────────
('特訓', 'Tokkun', 'Intensive training / Special training / Drilling', 'Battle', 3),
('奇策', 'Kisaku', 'Cunning plan / Surprise tactic / Clever scheme', 'Battle', 2),
('最終作戦', 'Saishuu sakusen', 'Final operation / Last resort plan', 'Battle', 2),
('作戦会議', 'Sakusen kaigi', 'Strategy meeting / War council / Mission briefing', 'Battle', 2),
('奥の手', 'Oku no te', 'Ace up one''s sleeve / Hidden trump card', 'Battle', 2),
('秘策', 'Hisaku', 'Secret plan / Hidden strategy', 'Battle', 2),
('包囲網', 'Houimou', 'Encirclement net / Siege network', 'Battle', 2),
('激昂', 'Gekikou', 'Furious rage / Flying into a rage', 'Battle', 2),
('熱戦', 'Nessen', 'Heated battle / Fiercely contested fight', 'Battle', 2),
('治療', 'Chiryou', 'Treatment / Medical care / Healing', 'Battle', 3),
('応急処置', 'Oukyuu shochi', 'First aid / Emergency treatment', 'Battle', 2),
('命令', 'Meirei', 'Order / Command / Directive', 'Battle', 3),
('盾役', 'Tate yaku', 'Tank / Shield bearer / Protective role', 'Battle', 3),
('隊長', 'Taichou', 'Squad leader / Team captain / Unit leader', 'Battle', 3),
('副隊長', 'Fukutaichou', 'Vice captain / Deputy squad leader', 'Battle', 2),
('中将', 'Chuujou', 'Lieutenant general / Vice admiral', 'Battle', 2),
('少将', 'Shoushou', 'Major general / Rear admiral', 'Battle', 2),
('司令官', 'Shireikan', 'Commander / Commanding officer', 'Battle', 2),
('指揮官', 'Shikikan', 'Officer / Tactical commander', 'Battle', 2),
('調査隊', 'Chousatai', 'Investigation team / Survey squad', 'Battle', 2),
('偵察隊', 'Teisatsutai', 'Scouting team / Recon unit', 'Battle', 2),
('特務隊', 'Tokumutai', 'Special duty unit / Covert squad', 'Battle', 2),

-- ── Political / Power (政治・権力) ────────────────────────────────
('王政', 'Ousei', 'Monarchy / Royal rule', 'Fantasy', 2),
('独裁', 'Dokusai', 'Dictatorship / Authoritarian rule', 'Anime', 2),
('支配階級', 'Shihai kaikyuu', 'Ruling class / Dominant class', 'Anime', 2),
('復元', 'Fukugen', 'Restoration / Rebuilding / Reconstruction', 'Anime', 2),

-- ── Story / Fate (運命・因果) ──────────────────────────────────────
('天命', 'Tenmei', 'Heavenly mandate / Heaven''s will / Destiny from above', 'Anime', 2),
('天罰', 'Tenbatsu', 'Heaven''s punishment / Divine retribution', 'Fantasy', 2),
('運命共同体', 'Unmei kyoudoutai', 'Shared fate / Bound by destiny together', 'Anime', 2),
('宿業', 'Shukugou', 'Karma / Fate / Inescapable destiny', 'Anime', 2),
('信仰', 'Shinkou', 'Faith / Belief / Religion / Devotion', 'Fantasy', 3),
('祈り', 'Inori', 'Prayer / Wish / Supplication', 'Fantasy', 3),
('創造', 'Souzou', 'Creation / Making something from nothing', 'Anime', 3),
('因果律', 'Ingaritsu', 'Law of causality / Principle of cause and effect', 'Anime', 1),
('犠牲精神', 'Gisei seishin', 'Spirit of sacrifice / Willingness to give everything', 'Anime', 2),
('陰謀論', 'Inbou ron', 'Conspiracy theory / Hidden plot theory', 'Anime', 2),
('極秘任務', 'Gokuhi ninmu', 'Top secret mission / Classified operation', 'Battle', 2),
('約束の日', 'Yakusoku no hi', 'The promised day / The day of the vow', 'Anime', 3),
('幼少期', 'Youshouki', 'Childhood / Early childhood years', 'Anime', 3),
('告別', 'Kokubetsu', 'Farewell / Final goodbye / Last parting', 'Anime', 2),
('微笑み', 'Hohoemi', 'Gentle smile / Soft smile', 'Emotions', 3),

-- ── Weapons (武器追加) ─────────────────────────────────────────────
('魔弓', 'Makyuu', 'Magic bow / Demon bow', 'Battle', 2),

-- ── Locations (場所追加) ───────────────────────────────────────────
('森林', 'Shinrin', 'Forest / Woodland', 'Fantasy', 3),
('山脈', 'Sanmyaku', 'Mountain range / Mountain chain', 'Fantasy', 3),
('地下洞窟', 'Chika doukutsu', 'Underground cave / Subterranean cavern', 'Fantasy', 2),
('地下室', 'Chikashitsu', 'Basement / Underground chamber', 'Fantasy', 3),
('礼拝堂', 'Reihaidou', 'Chapel / Prayer hall', 'Fantasy', 2),
('橋', 'Hashi', 'Bridge', 'Fantasy', 4),
('門', 'Mon', 'Gate / Gateway / Entrance', 'Fantasy', 4),
('城門', 'Joumon', 'Castle gate / Fortress gate', 'Fantasy', 2),
('食堂', 'Shokudou', 'Cafeteria / Dining hall / Canteen', 'School', 4),
('図書館', 'Toshokan', 'Library', 'School', 4),
('研究所', 'Kenkyuujo', 'Research institute / Laboratory', 'Anime', 3),
('農場', 'Noujou', 'Farm / Farmland', 'Fantasy', 3),
('牧場', 'Bokujou', 'Ranch / Pasture / Farm', 'Fantasy', 3),
('湿地', 'Shitchi', 'Wetlands / Marshland / Swamp area', 'Fantasy', 2),
('海岸', 'Kaigan', 'Coastline / Shore / Seashore', 'Fantasy', 3),
('半島', 'Hantou', 'Peninsula', 'Fantasy', 3),
('草地', 'Kusachi', 'Grassy area / Meadow / Green field', 'Fantasy', 3),
('鉱山', 'Kouzan', 'Mine / Mineral mine / Ore mine', 'Fantasy', 3),

-- ── School (学校詳細) ──────────────────────────────────────────────
('教頭', 'Kyoutou', 'Vice principal / Deputy principal', 'School', 3),
('校長', 'Kouchou', 'Principal / School headmaster', 'School', 3),
('副会長', 'Fuku kaichou', 'Vice president (of student council)', 'School', 3),
('書記', 'Shoki', 'Secretary (of student council)', 'School', 3),
('会計', 'Kaikei', 'Treasurer / Accountant', 'School', 3),
('学生証', 'Gakusei shou', 'Student ID card', 'School', 3),
('図書室', 'Tosho shitsu', 'Library room (school)', 'School', 3),
('理科室', 'Rika shitsu', 'Science lab / Chemistry room', 'School', 3),
('部室', 'Bu heya', 'Club room / Activities room', 'School', 3),
('放送室', 'Housou shitsu', 'Broadcasting room / PA room', 'School', 3),
('中庭', 'Nakaniwa', 'Courtyard / Inner garden', 'School', 3),
('購買', 'Koubai', 'School store / Canteen shop', 'School', 3),
('朝礼', 'Chouroku', 'Morning assembly / Morning meeting', 'School', 3),
('終礼', 'Shuurei', 'End-of-day assembly / Closing homeroom', 'School', 3),
('試験勉強', 'Shiken benkyou', 'Exam study / Cramming / Test prep', 'School', 3),
('海水浴', 'Kaisuiyoku', 'Swimming in the sea / Beach trip', 'Cultural', 3),
('花火大会', 'Hanabi taikai', 'Fireworks festival / Fireworks show', 'Cultural', 3),
('部活動', 'Bukatsu dou', 'Club activities / Extracurricular activities', 'School', 3),

-- ── Characters (キャラクター追加) ──────────────────────────────────
('医者', 'Isha', 'Doctor / Physician', 'Everyday', 4),
('同級生', 'Doukyuusei', 'Classmate / Same grade / Peer', 'School', 3),
('学級委員', 'Gakkyuu iin', 'Class representative / Class monitor', 'School', 3),
('先生', 'Sensei', 'Teacher / Master / Doctor (title)', 'School', 5),
('職人', 'Shokunin', 'Craftsman / Artisan / Skilled worker', 'Fantasy', 3)

ON CONFLICT (japanese) DO NOTHING;
