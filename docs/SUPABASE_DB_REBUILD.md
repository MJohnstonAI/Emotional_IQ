# Supabase DB Rebuild (Single Source of Truth)

This project is moving to a normalized schema where **Supabase is the only source of truth** for:

- categories
- daily quiz puzzles
- questions + answer options (including correctness, stored server-side)

## 0) Important warning

The rebuild script below **drops legacy tables** (`puzzles`, `daily_puzzles`, etc). Only run this on a **development** database.

If you want to preserve existing data, stop and ask for a data migration plan instead of running the destructive rebuild.

## 1) Rebuild SQL (copy/paste into Supabase SQL editor)

Run this entire block in the Supabase SQL editor:

```sql
-- Rebuild database to the normalized daily quiz schema (DESTRUCTIVE).
-- Source file in repo: `supabase/migrations/003_normalized_quiz_schema.sql`

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------
-- 1) Drop legacy / conflicting objects
-- -----------------------------

-- Legacy v0 "tone grid" tables (old schema.sql)
DROP TABLE IF EXISTS attempts CASCADE;
DROP TABLE IF EXISTS daily_puzzles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Legacy v1 "branching puzzles" tables (old migrations)
DROP VIEW IF EXISTS public_leaderboard_profiles CASCADE;
DROP FUNCTION IF EXISTS update_puzzle_stats(TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS set_profile_admin_flag() CASCADE;

DROP TABLE IF EXISTS user_puzzle_completions CASCADE;
DROP TABLE IF EXISTS puzzle_stats CASCADE;
DROP TABLE IF EXISTS puzzles CASCADE;

-- -----------------------------
-- 2) User profiles (private) + public leaderboard view
-- -----------------------------

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym TEXT UNIQUE NOT NULL,
  country TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pseudonym_length CHECK (char_length(pseudonym) BETWEEN 3 AND 20)
);

CREATE INDEX IF NOT EXISTS idx_profiles_country
  ON user_profiles(country)
  WHERE country IS NOT NULL;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE VIEW public_leaderboard_profiles AS
SELECT user_id, pseudonym, country
FROM user_profiles;

GRANT SELECT ON public_leaderboard_profiles TO anon, authenticated;

-- Optional admin flag automation (customize or remove).
CREATE OR REPLACE FUNCTION set_profile_admin_flag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = NEW.user_id
      AND email = 'syncteamai@gmail.com'
  ) THEN
    NEW.is_admin := TRUE;
  ELSE
    NEW.is_admin := FALSE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_set_admin ON user_profiles;
CREATE TRIGGER user_profiles_set_admin
BEFORE INSERT OR UPDATE
ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_profile_admin_flag();

-- -----------------------------
-- 3) Monetization (kept; used by client)
-- -----------------------------

CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  purchase_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT entitlements_unique UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  purchase_token TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Entitlements are per-user" ON entitlements;
CREATE POLICY "Entitlements are per-user" ON entitlements
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Purchases are per-user" ON purchases;
CREATE POLICY "Purchases are per-user" ON purchases
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON entitlements, purchases TO authenticated;

-- -----------------------------
-- 4) Normalized quiz content
-- -----------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_question_type') THEN
    CREATE TYPE quiz_question_type AS ENUM ('yes_no', 'true_false', 'single_choice', 'multi_choice');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_date DATE NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title TEXT,
  context TEXT NOT NULL,
  message TEXT NOT NULL,
  reveal_truth TEXT,
  reveal_explanation TEXT,
  reveal_pattern TEXT,
  difficulty TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_puzzles_category
  ON quiz_puzzles(category_id)
  WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_id UUID NOT NULL REFERENCES quiz_puzzles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  question TEXT NOT NULL,
  question_type quiz_question_type NOT NULL DEFAULT 'single_choice',
  allow_multiple BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quiz_questions_position_unique UNIQUE (puzzle_id, position),
  CONSTRAINT quiz_questions_multi_flag_check CHECK (
    (question_type = 'multi_choice' AND allow_multiple = TRUE)
    OR
    (question_type <> 'multi_choice' AND allow_multiple = FALSE)
  )
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_puzzle
  ON quiz_questions(puzzle_id, position);

CREATE TABLE IF NOT EXISTS quiz_answer_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quiz_answer_options_position_unique UNIQUE (question_id, position),
  CONSTRAINT quiz_answer_options_id_question_unique UNIQUE (id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_answer_options_question
  ON quiz_answer_options(question_id, position);

-- Enforce option/correctness rules per question type.
CREATE OR REPLACE FUNCTION validate_quiz_question_options(p_question_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type quiz_question_type;
  v_allow_multiple BOOLEAN;
  v_option_count INTEGER;
  v_correct_count INTEGER;
BEGIN
  SELECT question_type, allow_multiple
    INTO v_type, v_allow_multiple
  FROM quiz_questions
  WHERE id = p_question_id;

  IF v_type IS NULL THEN
    RETURN;
  END IF;

  SELECT count(*),
         count(*) FILTER (WHERE is_correct = TRUE)
    INTO v_option_count, v_correct_count
  FROM quiz_answer_options
  WHERE question_id = p_question_id;

  IF v_option_count < 2 THEN
    RAISE EXCEPTION 'Question % must have at least 2 options', p_question_id;
  END IF;

  IF v_type IN ('yes_no', 'true_false') AND v_option_count <> 2 THEN
    RAISE EXCEPTION 'Question % of type % must have exactly 2 options', p_question_id, v_type;
  END IF;

  IF v_type IN ('yes_no', 'true_false', 'single_choice') THEN
    IF v_correct_count <> 1 THEN
      RAISE EXCEPTION 'Question % of type % must have exactly 1 correct option', p_question_id, v_type;
    END IF;
  ELSE
    IF v_allow_multiple IS DISTINCT FROM TRUE THEN
      RAISE EXCEPTION 'Question % multi_choice must have allow_multiple=TRUE', p_question_id;
    END IF;
    IF v_correct_count < 1 THEN
      RAISE EXCEPTION 'Question % multi_choice must have at least 1 correct option', p_question_id;
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION quiz_answer_options_validate_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question_id UUID;
BEGIN
  v_question_id := COALESCE(NEW.question_id, OLD.question_id);
  PERFORM validate_quiz_question_options(v_question_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS quiz_answer_options_validate ON quiz_answer_options;
CREATE CONSTRAINT TRIGGER quiz_answer_options_validate
AFTER INSERT OR UPDATE OR DELETE ON quiz_answer_options
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION quiz_answer_options_validate_trigger();

-- -----------------------------
-- 5) Per-user attempts + answers
-- -----------------------------

CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES quiz_puzzles(id) ON DELETE CASCADE,
  question_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_attempt_per_puzzle UNIQUE(user_id, puzzle_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user_date
  ON user_quiz_attempts(user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_puzzle
  ON user_quiz_attempts(puzzle_id);

CREATE TABLE IF NOT EXISTS user_quiz_attempt_answers (
  attempt_id UUID NOT NULL REFERENCES user_quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (attempt_id, option_id),
  CONSTRAINT attempt_answers_option_belongs_to_question
    FOREIGN KEY (option_id, question_id)
    REFERENCES quiz_answer_options(id, question_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_quiz_attempt_answers_attempt
  ON user_quiz_attempt_answers(attempt_id);

-- -----------------------------
-- 6) Public aggregate stats
-- -----------------------------

CREATE TABLE IF NOT EXISTS quiz_puzzle_stats (
  puzzle_id UUID PRIMARY KEY REFERENCES quiz_puzzles(id) ON DELETE CASCADE,
  total_plays INTEGER NOT NULL DEFAULT 0 CHECK (total_plays >= 0),
  correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_answer_option_stats (
  option_id UUID PRIMARY KEY REFERENCES quiz_answer_options(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES quiz_puzzles(id) ON DELETE CASCADE,
  selected_count INTEGER NOT NULL DEFAULT 0 CHECK (selected_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_answer_option_stats_puzzle
  ON quiz_answer_option_stats(puzzle_id);

-- -----------------------------
-- 7) Streaks (private)
-- -----------------------------

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_completed_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------
-- 8) RLS + policies + grants
-- -----------------------------

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_puzzle_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answer_option_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public categories readable" ON categories;
CREATE POLICY "Public categories readable" ON categories
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public quiz puzzles readable" ON quiz_puzzles;
CREATE POLICY "Public quiz puzzles readable" ON quiz_puzzles
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public quiz questions readable" ON quiz_questions;
CREATE POLICY "Public quiz questions readable" ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_puzzles p
      WHERE p.id = quiz_questions.puzzle_id AND p.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Public quiz options readable" ON quiz_answer_options;
CREATE POLICY "Public quiz options readable" ON quiz_answer_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM quiz_questions q
      JOIN quiz_puzzles p ON p.id = q.puzzle_id
      WHERE q.id = quiz_answer_options.question_id AND p.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Public quiz stats readable" ON quiz_puzzle_stats;
CREATE POLICY "Public quiz stats readable" ON quiz_puzzle_stats
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public quiz option stats readable" ON quiz_answer_option_stats;
CREATE POLICY "Public quiz option stats readable" ON quiz_answer_option_stats
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can manage own quiz attempts" ON user_quiz_attempts;
CREATE POLICY "Users can manage own quiz attempts" ON user_quiz_attempts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own quiz attempt answers" ON user_quiz_attempt_answers;
CREATE POLICY "Users can manage own quiz attempt answers" ON user_quiz_attempt_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_quiz_attempts a
      WHERE a.id = user_quiz_attempt_answers.attempt_id
        AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_quiz_attempts a
      WHERE a.id = user_quiz_attempt_answers.attempt_id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can read own streak" ON user_streaks;
CREATE POLICY "Users can read own streak" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own streak" ON user_streaks;
CREATE POLICY "Users can upsert own streak" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streak" ON user_streaks;
CREATE POLICY "Users can update own streak" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

GRANT SELECT ON categories, quiz_puzzles, quiz_questions, quiz_puzzle_stats, quiz_answer_option_stats TO anon, authenticated;
REVOKE SELECT ON quiz_answer_options FROM anon, authenticated;
GRANT SELECT (id, question_id, position, label, created_at) ON quiz_answer_options TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_quiz_attempts, user_quiz_attempt_answers, user_streaks TO authenticated;

-- -----------------------------
-- 9) Submission RPC (server-side scoring + stats + streak)
-- -----------------------------

CREATE OR REPLACE FUNCTION submit_quiz_attempt(
  p_puzzle_id UUID,
  p_answers JSONB
)
RETURNS TABLE (
  attempt_id UUID,
  puzzle_id UUID,
  question_count INTEGER,
  correct_count INTEGER,
  score INTEGER,
  is_correct BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_question_count INTEGER;
  v_correct_count INTEGER := 0;
  v_score INTEGER;
  v_is_correct BOOLEAN;
  v_attempt_id UUID;
  v_puzzle_date DATE;
  v_answer JSONB;
  v_question_id UUID;
  v_selected UUID[];
  v_correct UUID[];
  v_selected_sorted UUID[];
  v_correct_sorted UUID[];
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth required';
  END IF;

  SELECT puzzle_date
    INTO v_puzzle_date
  FROM quiz_puzzles
  WHERE id = p_puzzle_id
    AND is_active = TRUE;

  IF v_puzzle_date IS NULL THEN
    RAISE EXCEPTION 'Puzzle not found or inactive';
  END IF;

  IF v_puzzle_date <> CURRENT_DATE THEN
    RAISE EXCEPTION 'Puzzle is not open for submission';
  END IF;

  SELECT count(*)
    INTO v_question_count
  FROM quiz_questions
  WHERE puzzle_id = p_puzzle_id;

  IF v_question_count IS NULL OR v_question_count = 0 THEN
    RAISE EXCEPTION 'Puzzle has no questions';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM user_quiz_attempts
    WHERE user_id = v_user_id
      AND puzzle_id = p_puzzle_id
  ) THEN
    RAISE EXCEPTION 'Already submitted';
  END IF;

  INSERT INTO user_quiz_attempts (user_id, puzzle_id, question_count, correct_count, score, is_correct)
  VALUES (v_user_id, p_puzzle_id, v_question_count, 0, 0, FALSE)
  RETURNING id INTO v_attempt_id;

  FOR v_answer IN SELECT * FROM jsonb_array_elements(COALESCE(p_answers, '[]'::jsonb))
  LOOP
    v_question_id := (v_answer->>'question_id')::uuid;
    v_selected := ARRAY(
      SELECT (value)::uuid
      FROM jsonb_array_elements_text(COALESCE(v_answer->'option_ids', '[]'::jsonb))
    );

    IF v_question_id IS NULL THEN
      RAISE EXCEPTION 'Invalid question_id in answers';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM quiz_questions q
      WHERE q.id = v_question_id AND q.puzzle_id = p_puzzle_id
    ) THEN
      RAISE EXCEPTION 'Question does not belong to puzzle';
    END IF;

    INSERT INTO user_quiz_attempt_answers (attempt_id, question_id, option_id)
    SELECT v_attempt_id, v_question_id, option_id
    FROM unnest(COALESCE(v_selected, ARRAY[]::uuid[])) AS option_id
    ON CONFLICT DO NOTHING;

    v_correct := ARRAY(
      SELECT o.id
      FROM quiz_answer_options o
      WHERE o.question_id = v_question_id
        AND o.is_correct = TRUE
      ORDER BY o.id
    );

    v_selected_sorted := ARRAY(
      SELECT DISTINCT a.option_id
      FROM user_quiz_attempt_answers a
      WHERE a.attempt_id = v_attempt_id
        AND a.question_id = v_question_id
      ORDER BY a.option_id
    );

    v_correct_sorted := COALESCE(v_correct, ARRAY[]::uuid[]);

    IF v_selected_sorted = v_correct_sorted THEN
      v_correct_count := v_correct_count + 1;
    END IF;
  END LOOP;

  v_score := ROUND((v_correct_count::numeric / v_question_count::numeric) * 100)::int;
  v_is_correct := (v_correct_count = v_question_count);

  UPDATE user_quiz_attempts
  SET correct_count = v_correct_count,
      score = v_score,
      is_correct = v_is_correct
  WHERE id = v_attempt_id;

  INSERT INTO quiz_puzzle_stats (puzzle_id, total_plays, correct_count, updated_at)
  VALUES (p_puzzle_id, 1, CASE WHEN v_is_correct THEN 1 ELSE 0 END, NOW())
  ON CONFLICT (puzzle_id) DO UPDATE SET
    total_plays = quiz_puzzle_stats.total_plays + 1,
    correct_count = quiz_puzzle_stats.correct_count + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
    updated_at = NOW();

  INSERT INTO quiz_answer_option_stats (option_id, question_id, puzzle_id, selected_count, updated_at)
  SELECT a.option_id, a.question_id, p_puzzle_id, 1, NOW()
  FROM user_quiz_attempt_answers a
  WHERE a.attempt_id = v_attempt_id
  ON CONFLICT (option_id) DO UPDATE SET
    selected_count = quiz_answer_option_stats.selected_count + 1,
    updated_at = NOW();

  IF v_is_correct THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_completed_date, updated_at)
    VALUES (v_user_id, 1, 1, v_puzzle_date, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = CASE
        WHEN user_streaks.last_completed_date IS NULL THEN 1
        WHEN v_puzzle_date = user_streaks.last_completed_date THEN user_streaks.current_streak
        WHEN v_puzzle_date = user_streaks.last_completed_date + 1 THEN user_streaks.current_streak + 1
        ELSE 1
      END,
      longest_streak = GREATEST(
        user_streaks.longest_streak,
        CASE
          WHEN user_streaks.last_completed_date IS NULL THEN 1
          WHEN v_puzzle_date = user_streaks.last_completed_date THEN user_streaks.current_streak
          WHEN v_puzzle_date = user_streaks.last_completed_date + 1 THEN user_streaks.current_streak + 1
          ELSE 1
        END
      ),
      last_completed_date = GREATEST(COALESCE(user_streaks.last_completed_date, v_puzzle_date), v_puzzle_date),
      updated_at = NOW();
  END IF;

  RETURN QUERY
  SELECT v_attempt_id, p_puzzle_id, v_question_count, v_correct_count, v_score, v_is_correct;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_quiz_attempt(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_quiz_question_options(UUID) TO postgres, service_role;

REVOKE SELECT ON quiz_answer_options FROM anon, authenticated;
GRANT SELECT (id, question_id, position, label, created_at) ON quiz_answer_options TO anon, authenticated;
```

## 2) Seed today’s puzzle (optional)

Run `supabase/seed/001_quiz_seed.sql`, or paste this block:

```sql
-- Source file in repo: `supabase/seed/001_quiz_seed.sql`

WITH category AS (
  INSERT INTO categories (name)
  VALUES ('Workplace Politics')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
),
puzzle AS (
  INSERT INTO quiz_puzzles (
    puzzle_date,
    category_id,
    title,
    context,
    message,
    reveal_truth,
    reveal_explanation,
    reveal_pattern,
    difficulty,
    is_active
  )
  VALUES (
    CURRENT_DATE,
    (SELECT id FROM category),
    'Subtext in the Meeting',
    'In a team meeting, the project lead role is open and your manager asks for suggestions.',
    'I think Sarah would be great at leading this project, but I''m happy to help however I can.',
    'Subtle self-promotion masked as support for Sarah.',
    'By endorsing Sarah then offering help, they signal they are ready to lead without openly campaigning.',
    'Watch for praise that positions the speaker as the safe fallback choice.',
    'medium',
    TRUE
  )
  ON CONFLICT (puzzle_date) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    title = EXCLUDED.title,
    context = EXCLUDED.context,
    message = EXCLUDED.message,
    reveal_truth = EXCLUDED.reveal_truth,
    reveal_explanation = EXCLUDED.reveal_explanation,
    reveal_pattern = EXCLUDED.reveal_pattern,
    difficulty = EXCLUDED.difficulty,
    is_active = EXCLUDED.is_active
  RETURNING id
),
q1 AS (
  INSERT INTO quiz_questions (puzzle_id, position, question, question_type, allow_multiple)
  VALUES ((SELECT id FROM puzzle), 1, 'What is the strategic move in this line?', 'single_choice', FALSE)
  ON CONFLICT (puzzle_id, position) DO UPDATE SET
    question = EXCLUDED.question,
    question_type = EXCLUDED.question_type,
    allow_multiple = EXCLUDED.allow_multiple
  RETURNING id
),
q2 AS (
  INSERT INTO quiz_questions (puzzle_id, position, question, question_type, allow_multiple)
  VALUES ((SELECT id FROM puzzle), 2, 'Where is the pressure aimed?', 'single_choice', FALSE)
  ON CONFLICT (puzzle_id, position) DO UPDATE SET
    question = EXCLUDED.question,
    question_type = EXCLUDED.question_type,
    allow_multiple = EXCLUDED.allow_multiple
  RETURNING id
),
q3 AS (
  INSERT INTO quiz_questions (puzzle_id, position, question, question_type, allow_multiple)
  VALUES ((SELECT id FROM puzzle), 3, 'Select all outcomes they are hoping for.', 'multi_choice', TRUE)
  ON CONFLICT (puzzle_id, position) DO UPDATE SET
    question = EXCLUDED.question,
    question_type = EXCLUDED.question_type,
    allow_multiple = EXCLUDED.allow_multiple
  RETURNING id
)
INSERT INTO quiz_answer_options (question_id, position, label, is_correct)
VALUES
  ((SELECT id FROM q1), 1, 'Genuine endorsement of Sarah', FALSE),
  ((SELECT id FROM q1), 2, 'Neutral support to avoid conflict', FALSE),
  ((SELECT id FROM q1), 3, 'Positioning themselves as the obvious alternative', TRUE),

  ((SELECT id FROM q2), 1, 'Upward at the manager', TRUE),
  ((SELECT id FROM q2), 2, 'Sideways at Sarah', FALSE),
  ((SELECT id FROM q2), 3, 'Downward at the team', FALSE),

  ((SELECT id FROM q3), 1, 'You give them the lead', TRUE),
  ((SELECT id FROM q3), 2, 'You offer them co-lead with Sarah', TRUE),
  ((SELECT id FROM q3), 3, 'You postpone the decision', FALSE)
ON CONFLICT (question_id, position) DO UPDATE SET
  label = EXCLUDED.label,
  is_correct = EXCLUDED.is_correct;
```

## 2b) Enable advanced grading modes (optional)

If you need the **"any correct except false"** behavior (question type #6), apply the patch below.
It adds `grading_mode` to `quiz_questions` and updates scoring/validation:

```sql
-- Source file in repo: `supabase/migrations/004_quiz_grading_mode.sql`

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_grading_mode') THEN
    CREATE TYPE quiz_grading_mode AS ENUM ('exact', 'any_correct_without_false');
  END IF;
END
$$;

ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS grading_mode quiz_grading_mode NOT NULL DEFAULT 'exact';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quiz_questions_grading_mode_check'
  ) THEN
    ALTER TABLE quiz_questions
      ADD CONSTRAINT quiz_questions_grading_mode_check CHECK (
        (grading_mode = 'exact')
        OR
        (grading_mode = 'any_correct_without_false'
          AND question_type = 'multi_choice'
          AND allow_multiple = TRUE)
      );
  END IF;
END
$$;

-- Update validation + scoring to support grading_mode.
CREATE OR REPLACE FUNCTION validate_quiz_question_options(p_question_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type quiz_question_type;
  v_allow_multiple BOOLEAN;
  v_grading quiz_grading_mode;
  v_option_count INTEGER;
  v_correct_count INTEGER;
BEGIN
  SELECT question_type, allow_multiple, grading_mode
    INTO v_type, v_allow_multiple, v_grading
  FROM quiz_questions
  WHERE id = p_question_id;

  IF v_type IS NULL THEN
    RETURN;
  END IF;

  SELECT count(*),
         count(*) FILTER (WHERE is_correct = TRUE)
    INTO v_option_count, v_correct_count
  FROM quiz_answer_options
  WHERE question_id = p_question_id;

  IF v_option_count < 2 THEN
    RAISE EXCEPTION 'Question % must have at least 2 options', p_question_id;
  END IF;

  IF v_type IN ('yes_no', 'true_false') AND v_option_count <> 2 THEN
    RAISE EXCEPTION 'Question % of type % must have exactly 2 options', p_question_id, v_type;
  END IF;

  IF v_type IN ('yes_no', 'true_false', 'single_choice') THEN
    IF v_correct_count <> 1 THEN
      RAISE EXCEPTION 'Question % of type % must have exactly 1 correct option', p_question_id, v_type;
    END IF;
  ELSE
    IF v_allow_multiple IS DISTINCT FROM TRUE THEN
      RAISE EXCEPTION 'Question % multi_choice must have allow_multiple=TRUE', p_question_id;
    END IF;
    IF v_correct_count < 1 THEN
      RAISE EXCEPTION 'Question % multi_choice must have at least 1 correct option', p_question_id;
    END IF;
    IF v_grading = 'any_correct_without_false' AND v_correct_count = v_option_count THEN
      RAISE EXCEPTION 'Question % any_correct_without_false must include at least 1 incorrect option', p_question_id;
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION submit_quiz_attempt(
  p_puzzle_id UUID,
  p_answers JSONB
)
RETURNS TABLE (
  attempt_id UUID,
  puzzle_id UUID,
  question_count INTEGER,
  correct_count INTEGER,
  score INTEGER,
  is_correct BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_question_count INTEGER;
  v_correct_count INTEGER := 0;
  v_score INTEGER;
  v_is_correct BOOLEAN;
  v_attempt_id UUID;
  v_puzzle_date DATE;
  v_answer JSONB;
  v_question_id UUID;
  v_selected UUID[];
  v_correct UUID[];
  v_selected_sorted UUID[];
  v_correct_sorted UUID[];
  v_grading quiz_grading_mode;
  v_has_correct BOOLEAN;
  v_has_incorrect BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth required';
  END IF;

  SELECT puzzle_date
    INTO v_puzzle_date
  FROM quiz_puzzles
  WHERE id = p_puzzle_id
    AND is_active = TRUE;

  IF v_puzzle_date IS NULL THEN
    RAISE EXCEPTION 'Puzzle not found or inactive';
  END IF;

  IF v_puzzle_date <> CURRENT_DATE THEN
    RAISE EXCEPTION 'Puzzle is not open for submission';
  END IF;

  SELECT count(*)
    INTO v_question_count
  FROM quiz_questions
  WHERE puzzle_id = p_puzzle_id;

  IF v_question_count IS NULL OR v_question_count = 0 THEN
    RAISE EXCEPTION 'Puzzle has no questions';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM user_quiz_attempts
    WHERE user_id = v_user_id
      AND puzzle_id = p_puzzle_id
  ) THEN
    RAISE EXCEPTION 'Already submitted';
  END IF;

  INSERT INTO user_quiz_attempts (user_id, puzzle_id, question_count, correct_count, score, is_correct)
  VALUES (v_user_id, p_puzzle_id, v_question_count, 0, 0, FALSE)
  RETURNING id INTO v_attempt_id;

  FOR v_answer IN SELECT * FROM jsonb_array_elements(COALESCE(p_answers, '[]'::jsonb))
  LOOP
    v_question_id := (v_answer->>'question_id')::uuid;
    v_selected := ARRAY(
      SELECT (value)::uuid
      FROM jsonb_array_elements_text(COALESCE(v_answer->'option_ids', '[]'::jsonb))
    );

    IF v_question_id IS NULL THEN
      RAISE EXCEPTION 'Invalid question_id in answers';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM quiz_questions q
      WHERE q.id = v_question_id AND q.puzzle_id = p_puzzle_id
    ) THEN
      RAISE EXCEPTION 'Question does not belong to puzzle';
    END IF;

    SELECT grading_mode
      INTO v_grading
    FROM quiz_questions
    WHERE id = v_question_id;

    INSERT INTO user_quiz_attempt_answers (attempt_id, question_id, option_id)
    SELECT v_attempt_id, v_question_id, option_id
    FROM unnest(COALESCE(v_selected, ARRAY[]::uuid[])) AS option_id
    ON CONFLICT DO NOTHING;

    v_correct := ARRAY(
      SELECT o.id
      FROM quiz_answer_options o
      WHERE o.question_id = v_question_id
        AND o.is_correct = TRUE
      ORDER BY o.id
    );

    v_selected_sorted := ARRAY(
      SELECT DISTINCT a.option_id
      FROM user_quiz_attempt_answers a
      WHERE a.attempt_id = v_attempt_id
        AND a.question_id = v_question_id
      ORDER BY a.option_id
    );

    v_correct_sorted := COALESCE(v_correct, ARRAY[]::uuid[]);

    IF v_grading = 'any_correct_without_false' THEN
      v_has_correct := EXISTS (
        SELECT 1
        FROM quiz_answer_options o
        JOIN user_quiz_attempt_answers a
          ON a.option_id = o.id
        WHERE a.attempt_id = v_attempt_id
          AND a.question_id = v_question_id
          AND o.is_correct = TRUE
      );
      v_has_incorrect := EXISTS (
        SELECT 1
        FROM quiz_answer_options o
        JOIN user_quiz_attempt_answers a
          ON a.option_id = o.id
        WHERE a.attempt_id = v_attempt_id
          AND a.question_id = v_question_id
          AND o.is_correct = FALSE
      );

      IF v_has_correct AND NOT v_has_incorrect THEN
        v_correct_count := v_correct_count + 1;
      END IF;
    ELSIF v_selected_sorted = v_correct_sorted THEN
      v_correct_count := v_correct_count + 1;
    END IF;
  END LOOP;

  v_score := ROUND((v_correct_count::numeric / v_question_count::numeric) * 100)::int;
  v_is_correct := (v_correct_count = v_question_count);

  UPDATE user_quiz_attempts
  SET correct_count = v_correct_count,
      score = v_score,
      is_correct = v_is_correct
  WHERE id = v_attempt_id;

  INSERT INTO quiz_puzzle_stats (puzzle_id, total_plays, correct_count, updated_at)
  VALUES (p_puzzle_id, 1, CASE WHEN v_is_correct THEN 1 ELSE 0 END, NOW())
  ON CONFLICT (puzzle_id) DO UPDATE SET
    total_plays = quiz_puzzle_stats.total_plays + 1,
    correct_count = quiz_puzzle_stats.correct_count + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
    updated_at = NOW();

  INSERT INTO quiz_answer_option_stats (option_id, question_id, puzzle_id, selected_count, updated_at)
  SELECT a.option_id, a.question_id, p_puzzle_id, 1, NOW()
  FROM user_quiz_attempt_answers a
  WHERE a.attempt_id = v_attempt_id
  ON CONFLICT (option_id) DO UPDATE SET
    selected_count = quiz_answer_option_stats.selected_count + 1,
    updated_at = NOW();

  IF v_is_correct THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_completed_date, updated_at)
    VALUES (v_user_id, 1, 1, v_puzzle_date, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = CASE
        WHEN user_streaks.last_completed_date IS NULL THEN 1
        WHEN v_puzzle_date = user_streaks.last_completed_date THEN user_streaks.current_streak
        WHEN v_puzzle_date = user_streaks.last_completed_date + 1 THEN user_streaks.current_streak + 1
        ELSE 1
      END,
      longest_streak = GREATEST(
        user_streaks.longest_streak,
        CASE
          WHEN user_streaks.last_completed_date IS NULL THEN 1
          WHEN v_puzzle_date = user_streaks.last_completed_date THEN user_streaks.current_streak
          WHEN v_puzzle_date = user_streaks.last_completed_date + 1 THEN user_streaks.current_streak + 1
          ELSE 1
        END
      ),
      last_completed_date = GREATEST(COALESCE(user_streaks.last_completed_date, v_puzzle_date), v_puzzle_date),
      updated_at = NOW();
  END IF;

  RETURN QUERY
  SELECT v_attempt_id, p_puzzle_id, v_question_count, v_correct_count, v_score, v_is_correct;
END;
$$;
```

## 3) Verification / schema report SQL

Run this block after rebuild. It prints:

- whether required tables exist
- whether legacy tables are gone
- whether RLS is enabled
- whether `is_correct` is blocked from anon/authenticated
- quick overview of columns, indexes, policies, and functions

```sql
-- 3.1 Presence checks
WITH checks AS (
  SELECT 'table:categories' AS check, to_regclass('public.categories') IS NOT NULL AS ok
  UNION ALL SELECT 'table:quiz_puzzles', to_regclass('public.quiz_puzzles') IS NOT NULL
  UNION ALL SELECT 'table:quiz_questions', to_regclass('public.quiz_questions') IS NOT NULL
  UNION ALL SELECT 'table:quiz_answer_options', to_regclass('public.quiz_answer_options') IS NOT NULL
  UNION ALL SELECT 'table:user_quiz_attempts', to_regclass('public.user_quiz_attempts') IS NOT NULL
  UNION ALL SELECT 'table:user_quiz_attempt_answers', to_regclass('public.user_quiz_attempt_answers') IS NOT NULL
  UNION ALL SELECT 'table:quiz_puzzle_stats', to_regclass('public.quiz_puzzle_stats') IS NOT NULL
  UNION ALL SELECT 'table:quiz_answer_option_stats', to_regclass('public.quiz_answer_option_stats') IS NOT NULL
  UNION ALL SELECT 'rpc:submit_quiz_attempt', to_regprocedure('public.submit_quiz_attempt(uuid,jsonb)') IS NOT NULL
  UNION ALL SELECT 'legacy:daily_puzzles removed', to_regclass('public.daily_puzzles') IS NULL
  UNION ALL SELECT 'legacy:puzzles removed', to_regclass('public.puzzles') IS NULL
  UNION ALL SELECT 'legacy:user_puzzle_completions removed', to_regclass('public.user_puzzle_completions') IS NULL
)
SELECT * FROM checks ORDER BY ok ASC, check ASC;

-- 3.2 RLS enabled?
SELECT
  c.relname AS table,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'categories','quiz_puzzles','quiz_questions','quiz_answer_options',
    'user_quiz_attempts','user_quiz_attempt_answers',
    'quiz_puzzle_stats','quiz_answer_option_stats'
  )
ORDER BY c.relname;

-- 3.3 Ensure clients cannot read answer keys
SELECT
  has_column_privilege('anon', 'public.quiz_answer_options', 'is_correct', 'SELECT') AS anon_can_select_is_correct,
  has_column_privilege('authenticated', 'public.quiz_answer_options', 'is_correct', 'SELECT') AS auth_can_select_is_correct;

-- 3.4 Table/column overview (for humans)
SELECT table_name, ordinal_position, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'categories','quiz_puzzles','quiz_questions','quiz_answer_options',
    'user_quiz_attempts','user_quiz_attempt_answers',
    'quiz_puzzle_stats','quiz_answer_option_stats'
  )
ORDER BY table_name, ordinal_position;

-- 3.5 Index overview
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'categories','quiz_puzzles','quiz_questions','quiz_answer_options',
    'user_quiz_attempts','user_quiz_attempt_answers',
    'quiz_puzzle_stats','quiz_answer_option_stats'
  )
ORDER BY tablename, indexname;

-- 3.6 RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'categories','quiz_puzzles','quiz_questions','quiz_answer_options',
    'user_quiz_attempts','user_quiz_attempt_answers',
    'quiz_puzzle_stats','quiz_answer_option_stats'
  )
ORDER BY tablename, policyname;

-- 3.7 Functions (signatures)
SELECT
  n.nspname AS schema,
  p.proname AS function,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_get_function_result(p.oid) AS returns,
  p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'submit_quiz_attempt',
    'validate_quiz_question_options',
    'quiz_answer_options_validate_trigger'
  )
ORDER BY function;
```

## 4) Next step (after you confirm the report output)

Once you’ve run the rebuild + report and paste the results back, we can:

- remove all legacy puzzle code + old data models
- make the app load categories/practice/daily puzzles purely from Supabase
- remove any in-repo “fallback puzzle” and seed data
