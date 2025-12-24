-- Add grading_mode support and harden answer option privileges.

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

-- Update validation function to enforce "any_correct_without_false" expectations.
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

-- Update scoring logic.
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

REVOKE SELECT ON quiz_answer_options FROM anon, authenticated;
GRANT SELECT (id, question_id, position, label, created_at) ON quiz_answer_options TO anon, authenticated;
