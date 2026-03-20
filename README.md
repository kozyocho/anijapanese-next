# AniJapanese — Next.js + Supabase

A Japanese learning app with React/Next.js frontend and Supabase backend.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Vector Search | pgvector (OpenAI embeddings) |

---

## Quick Start

### 1. Clone & install

```bash
cd anijapanese-next
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` → `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

### 3. Run migrations

Open the Supabase **SQL Editor** and run these files in order:

| Order | File | Description |
|---|---|---|
| 1 | `supabase/migrations/001_extensions.sql` | Enable pgvector + uuid-ossp |
| 2 | `supabase/migrations/002_content_tables.sql` | kana, vocabulary, kanji tables |
| 3 | `supabase/migrations/003_user_tables.sql` | profiles, SRS, quiz, streaks, XP |
| 4 | `supabase/migrations/004_rls.sql` | Row Level Security policies |
| 5 | `supabase/migrations/005_functions.sql` | Triggers, views, pgvector helpers |
| 6 | `supabase/migrations/006_seed.sql` | Seed all content data |

> **Tip:** If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed, you can run:
> ```bash
> supabase db push
> ```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
anijapanese-next/
├── app/                    # Next.js App Router pages
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client (RSC/Server Actions)
│   │   └── middleware.ts   # Session refresh middleware
│   └── db/
│       ├── profiles.ts     # Profile CRUD + XP
│       ├── progress.ts     # Learned kana/vocab/kanji
│       ├── srs.ts          # Spaced Repetition System
│       ├── quiz.ts         # Quiz sessions & results
│       └── streaks.ts      # Daily streaks
├── types/
│   └── database.ts         # Auto-typed Database schema
├── supabase/
│   └── migrations/         # SQL migration files (run in order)
├── middleware.ts            # Next.js middleware (session refresh)
└── .env.local.example      # Environment variable template
```

---

## Database Schema Overview

```
profiles          ← extends auth.users (JLPT level, goals, XP, streaks)
content_kana      ← static hiragana + katakana
content_vocabulary← static vocabulary + pgvector embeddings
content_kanji     ← static kanji + pgvector embeddings

user_learned_kana      ← per-user learned kana
user_learned_vocabulary← per-user learned vocabulary
user_learned_kanji     ← per-user learned kanji

srs_items         ← Spaced Repetition queue (next review date)
quiz_sessions     ← quiz results summary
quiz_question_results← per-question answers
daily_streaks     ← calendar of daily activity
xp_ledger         ← append-only XP event log
```

See `supabase_schema.md` for the full schema design document.

---

## pgvector Setup (Semantic Search)

After seeding content, generate embeddings for vocabulary and kanji using the OpenAI API and store them in the `embedding` column. Then enable ANN indexes:

```sql
-- After embeddings are populated:
CREATE INDEX idx_vocab_embedding ON content_vocabulary
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_kanji_embedding ON content_kanji
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
```

Use the `search_similar_vocab()` and `get_similar_answers()` Postgres functions for semantic search and smart quiz distractor generation.

---

## Data Access API

```ts
import { createClient } from '@/lib/supabase/client'
import { getUserProgress } from '@/lib/db/progress'
import { getDueItems, recordWrongAnswer } from '@/lib/db/srs'
import { saveQuizSession } from '@/lib/db/quiz'
import { recordDailyActivity } from '@/lib/db/streaks'

const supabase = createClient()
const userId = (await supabase.auth.getUser()).data.user?.id!

// Get dashboard stats
const progress = await getUserProgress(supabase, userId)

// SRS review
const dueItems = await getDueItems(supabase, userId)
await recordWrongAnswer(supabase, userId, 'vocabulary', vocabId)

// Save quiz
await saveQuizSession(supabase, userId, {
  quizType: 'daily',
  score: 8,
  totalQuestions: 10,
  maxStreak: 5,
  xpEarned: 80,
  questions: [...],
})

// Update streak
await recordDailyActivity(supabase, userId, 10, 80)
```
