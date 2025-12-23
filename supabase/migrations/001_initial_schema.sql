-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Puzzles table
CREATE TABLE IF NOT EXISTS puzzles (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN (
    'Workplace Politics',
    'Dating & Romance',
    'Family Dynamics',
    'Conflict Resolution',
    'Social Etiquette',
    'Anger Management',
    'Sarcasm Detection'
  )),
  context TEXT NOT NULL,
  message TEXT NOT NULL,
  rounds JSONB NOT NULL,
  reveal JSONB NOT NULL,
  is_daily BOOLEAN NOT NULL DEFAULT FALSE,
  daily_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Exactly 3 rounds
  CONSTRAINT rounds_array_check CHECK (jsonb_typeof(rounds) = 'array' AND jsonb_array_length(rounds) = 3),

  -- Reveal fields required
  CONSTRAINT reveal_fields_check CHECK (
    reveal ? 'truth' AND reveal ? 'explanation'
  ),

  -- FIX #1: daily_date only allowed when is_daily is true (and must exist then)
  CONSTRAINT daily_requires_date CHECK (
    (is_daily = FALSE AND daily_date IS NULL)
    OR
    (is_daily = TRUE AND daily_date IS NOT NULL)
  )
);

-- FIX #1: Unique daily puzzle per day ONLY for daily puzzles (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS puzzles_daily_unique
  ON puzzles (daily_date)
  WHERE is_daily = TRUE;

CREATE INDEX IF NOT EXISTS idx_puzzles_category
  ON puzzles(category)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_puzzles_daily
  ON puzzles(daily_date)
  WHERE is_daily = TRUE AND is_active = TRUE;

-- User profiles (private table; leaderboard uses a public view)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym TEXT UNIQUE NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pseudonym_length CHECK (char_length(pseudonym) BETWEEN 3 AND 20)
);

CREATE INDEX IF NOT EXISTS idx_profiles_country
  ON user_profiles(country)
  WHERE country IS NOT NULL;

-- Puzzle completions
CREATE TABLE IF NOT EXISTS user_puzzle_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_id TEXT NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  round_1_choice TEXT NOT NULL,
  round_2_choice TEXT NOT NULL,
  round_3_choice TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score IN (0, 33, 66, 100)),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_attempt_per_puzzle UNIQUE(user_id, puzzle_id)
);

CREATE INDEX IF NOT EXISTS idx_completions_user_date
  ON user_puzzle_completions(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_completions_puzzle
  ON user_puzzle_completions(puzzle_id);

-- Aggregated puzzle statistics
CREATE TABLE IF NOT EXISTS puzzle_stats (
  puzzle_id TEXT PRIMARY KEY REFERENCES puzzles(id) ON DELETE CASCADE,
  total_plays INTEGER NOT NULL DEFAULT 0 CHECK (total_plays >= 0),
  round_1_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  round_2_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  round_3_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  avg_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User streaks (for retention)
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_completed_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_puzzle_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public can read active puzzles
DROP POLICY IF EXISTS "Public puzzles readable" ON puzzles;
CREATE POLICY "Public puzzles readable" ON puzzles
  FOR SELECT USING (is_active = TRUE);

-- Profiles are PRIVATE: user can read/insert/update own profile
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Completions: user can read/insert own
DROP POLICY IF EXISTS "Users can read own completions" ON user_puzzle_completions;
CREATE POLICY "Users can read own completions" ON user_puzzle_completions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own completions" ON user_puzzle_completions;
CREATE POLICY "Users can insert own completions" ON user_puzzle_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public can read stats (aggregates)
DROP POLICY IF EXISTS "Public puzzle stats" ON puzzle_stats;
CREATE POLICY "Public puzzle stats" ON puzzle_stats
  FOR SELECT USING (TRUE);

-- Streaks: user can read own
DROP POLICY IF EXISTS "Users can read own streak" ON user_streaks;
CREATE POLICY "Users can read own streak" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

-- FIX #2: Leaderboards must NOT query user_profiles directly.
-- Create a public view exposing only pseudonym + country.
CREATE OR REPLACE VIEW public_leaderboard_profiles AS
SELECT user_id, pseudonym, country
FROM user_profiles;

GRANT SELECT ON public_leaderboard_profiles TO anon, authenticated;

-- FIX #3: Safe atomic stats update function with SECURITY DEFINER + search_path + robust json increments
CREATE OR REPLACE FUNCTION update_puzzle_stats(
  p_puzzle_id TEXT,
  p_round_1_choice TEXT,
  p_round_2_choice TEXT,
  p_round_3_choice TEXT,
  p_score INTEGER,
  p_is_correct BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO puzzle_stats (puzzle_id, total_plays, correct_count, avg_score)
  VALUES (p_puzzle_id, 1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, p_score)
  ON CONFLICT (puzzle_id) DO UPDATE SET
    total_plays = puzzle_stats.total_plays + 1,
    correct_count = puzzle_stats.correct_count + CASE WHEN p_is_correct THEN 1 ELSE 0 END,

    round_1_distribution = jsonb_set(
      puzzle_stats.round_1_distribution,
      ARRAY[p_round_1_choice],
      to_jsonb(COALESCE((puzzle_stats.round_1_distribution->>p_round_1_choice)::int, 0) + 1),
      true
    ),
    round_2_distribution = jsonb_set(
      puzzle_stats.round_2_distribution,
      ARRAY[p_round_2_choice],
      to_jsonb(COALESCE((puzzle_stats.round_2_distribution->>p_round_2_choice)::int, 0) + 1),
      true
    ),
    round_3_distribution = jsonb_set(
      puzzle_stats.round_3_distribution,
      ARRAY[p_round_3_choice],
      to_jsonb(COALESCE((puzzle_stats.round_3_distribution->>p_round_3_choice)::int, 0) + 1),
      true
    ),

    avg_score = (puzzle_stats.avg_score * puzzle_stats.total_plays + p_score) / (puzzle_stats.total_plays + 1),
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION update_puzzle_stats(TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN) TO anon, authenticated;
