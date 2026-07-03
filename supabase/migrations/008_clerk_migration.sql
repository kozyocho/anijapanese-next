-- Migration 008: Migrate from Supabase Auth to Clerk
-- profiles.id を uuid(auth.users依存) から text(Clerk user ID) に変更

-- Step 1: Supabase Auth のトリガー・関数を削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 2: profiles(id) を参照しているテーブルの FK を一時削除
ALTER TABLE user_learned_kana       DROP CONSTRAINT IF EXISTS user_learned_kana_user_id_fkey;
ALTER TABLE user_learned_vocabulary  DROP CONSTRAINT IF EXISTS user_learned_vocabulary_user_id_fkey;
ALTER TABLE user_learned_kanji      DROP CONSTRAINT IF EXISTS user_learned_kanji_user_id_fkey;
ALTER TABLE srs_items               DROP CONSTRAINT IF EXISTS srs_items_user_id_fkey;
ALTER TABLE quiz_sessions           DROP CONSTRAINT IF EXISTS quiz_sessions_user_id_fkey;
ALTER TABLE quiz_question_results   DROP CONSTRAINT IF EXISTS quiz_question_results_session_id_fkey;
ALTER TABLE daily_streaks           DROP CONSTRAINT IF EXISTS daily_streaks_user_id_fkey;
ALTER TABLE xp_ledger               DROP CONSTRAINT IF EXISTS xp_ledger_user_id_fkey;

-- Step 3: profiles.id の auth.users FK と PK を削除
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;

-- Step 4: profiles.id を text 型に変更
ALTER TABLE profiles ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- Step 5: 参照テーブルの user_id を text 型に変更
ALTER TABLE user_learned_kana      ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE user_learned_vocabulary ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE user_learned_kanji     ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE srs_items              ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE quiz_sessions          ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE daily_streaks          ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE xp_ledger              ALTER COLUMN user_id TYPE text USING user_id::text;

-- Step 6: FK を再追加
ALTER TABLE user_learned_kana      ADD CONSTRAINT user_learned_kana_user_id_fkey      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_learned_vocabulary ADD CONSTRAINT user_learned_vocabulary_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_learned_kanji     ADD CONSTRAINT user_learned_kanji_user_id_fkey     FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE srs_items              ADD CONSTRAINT srs_items_user_id_fkey              FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE quiz_sessions          ADD CONSTRAINT quiz_sessions_user_id_fkey          FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE daily_streaks          ADD CONSTRAINT daily_streaks_user_id_fkey          FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE xp_ledger              ADD CONSTRAINT xp_ledger_user_id_fkey              FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 7: user_srs_progress / user_learned_contents (アプリで使用中) も対応
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_srs_progress' AND column_name = 'user_id') THEN
        ALTER TABLE user_srs_progress ALTER COLUMN user_id TYPE text USING user_id::text;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_learned_contents' AND column_name = 'user_id') THEN
        ALTER TABLE user_learned_contents ALTER COLUMN user_id TYPE text USING user_id::text;
    END IF;
END $$;

-- Step 8: is_guest カラムが存在しない場合は追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT true;
